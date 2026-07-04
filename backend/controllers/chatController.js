const axios = require('axios');
const Product = require('../models/Product');

const FREE_MODEL = 'openrouter/free';
const STORE_SYSTEM_PROMPT = `You are the virtual assistant for GULIT, an e-commerce store. Answer questions only about the store, products, ordering, shipping, payments, returns, customer support, and account access. Keep replies focused on GULIT's shop policies, product categories, and buying experience. If users ask unrelated questions, politely explain that you can only help with GULIT store-related topics. Use the current inventory and pricing data provided in the context when answering questions about stock, pricing, availability, and product details.`;

async function buildInventoryContext() {
  const products = await Product.find().sort({ createdAt: -1 }).limit(12).lean();
  if (!products || products.length === 0) return '';

  const rows = products.map((product) => {
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
    const stock = typeof product.stock === 'number' ? `${product.stock} in stock` : `stock: ${product.stock}`;
    return `${product.title}: $${price} - ${stock}`;
  });

  return `Current live inventory and pricing:\n${rows.join('\n')}`;
}

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if ((!message || !message.trim()) && !Array.isArray(history)) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_RUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenRouter API key not configured. Define OPENROUTER_API_KEY in your backend .env.' });
    }

    const inventoryContext = await buildInventoryContext();
    const systemMessages = [{ role: 'system', content: STORE_SYSTEM_PROMPT }];
    const contextMessages = inventoryContext
      ? [{ role: 'assistant', content: inventoryContext }]
      : [];
    const conversationMessages = Array.isArray(history)
      ? history
          .filter(msg => msg && msg.text)
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text,
          }))
      : [];

    if (message && message.trim()) {
      conversationMessages.push({ role: 'user', content: message.trim() });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: FREE_MODEL,
        messages: [...systemMessages, ...contextMessages, ...conversationMessages],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'GULIT Chat',
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
      return res.status(500).json({ message: 'Empty response from AI', details: response.data });
    }
    res.json({ reply: text });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data?.error?.message || err.response?.data || err.message;
    console.error('OpenRouter API error:', detail);
    res.status(status).json({ message: String(detail) });
  }
};
