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

const STORE_PRODUCTS = [
  {
    name: 'Samsung Galaxy A55',
    price: 38500,
    stock: 8,
    category: 'Electronics',
    description: '128GB storage, a bright AMOLED display, dual SIM support, and all-day battery life.',
  },
  {
    name: 'Leather Crossbody Bag',
    price: 4200,
    stock: 14,
    category: 'Fashion',
    description: 'A compact everyday bag with an adjustable strap and secure zip pockets.',
  },
  {
    name: 'Ceramic Dinner Set',
    price: 6800,
    stock: 5,
    category: 'Home',
    description: 'A durable 16-piece dinner set for family meals and small gatherings.',
  },
  {
    name: 'Running Shoes',
    price: 7900,
    stock: 10,
    category: 'Sports',
    description: 'Lightweight road running shoes with a breathable mesh upper.',
  },
  {
    name: 'Atomic Habits',
    price: 1250,
    stock: 20,
    category: 'Books',
    description: 'A practical guide for building better habits and improving daily systems.',
  },
  {
    name: 'Bluetooth Speaker',
    price: 3600,
    stock: 3,
    category: 'Electronics',
    description: 'A portable speaker with clear sound, USB-C charging, and splash resistance.',
  },
];

const STORE_PROFILE = {
  name: 'GULIT',
  about: 'GULIT is an online store for electronics, fashion, home essentials, sports gear, and books.',
  orderFlow: 'Customers can sign in, browse products, add them to the cart, and check out with cash on delivery or Chapa.',
  delivery: 'Orders are delivered to the address provided during checkout, and the checkout form also supports map-based delivery pinning.',
  support: 'If you need help with an order, payment, or a product question, use the help chat or support contact options on the website.',
};

function formatPrice(value) {
  return `ETB ${Number(value || 0).toLocaleString('en-US')}`;
}

function findProduct(query) {
  const normalized = String(query || '').toLowerCase();
  return STORE_PRODUCTS.find((product) => {
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return haystack.includes(normalized) || normalized.includes(product.name.toLowerCase()) || normalized.includes(product.category.toLowerCase());
  });
}

function buildFallbackReply(message) {
  const text = String(message || '').toLowerCase();

  if (!text.trim()) {
    return `Hi! I’m ${STORE_PROFILE.name}’s assistant. I can help with products, prices, orders, payments, and delivery.`;
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return `Hello! I’m ${STORE_PROFILE.name}’s assistant. I can help you browse products, check prices, place orders, and learn about delivery.`;
  }

  if (text.includes('about') || text.includes('who are you') || text.includes('what is gulit')) {
    return `${STORE_PROFILE.name} is an online store focused on quality products across electronics, fashion, home essentials, sports gear, and books. We aim to make shopping simple and convenient.`;
  }

  if (text.includes('sell') || text.includes('products') || text.includes('categories') || text.includes('what do you have')) {
    return `We currently offer products in Electronics, Fashion, Home, Sports, and Books. Popular items include the Samsung Galaxy A55, Leather Crossbody Bag, Ceramic Dinner Set, Running Shoes, Atomic Habits, and Bluetooth Speaker.`;
  }

  if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
    const product = findProduct(text);
    if (product) {
      return `${product.name} is ${formatPrice(product.price)}. It is in ${product.category} and currently has ${product.stock} units in stock.`;
    }
    return `Our prices vary by product. For example, the Samsung Galaxy A55 is ${formatPrice(38500)}, the Leather Crossbody Bag is ${formatPrice(4200)}, and the Bluetooth Speaker is ${formatPrice(3600)}.`;
  }

  if (text.includes('order') || text.includes('checkout') || text.includes('cart')) {
    return `To place an order, sign in, add items to your cart, and proceed to checkout. You can pay with cash on delivery or Chapa, and we also support delivery location pinning during checkout.`;
  }

  if (text.includes('payment') || text.includes('chapa')) {
    return `You can pay during checkout using cash on delivery or Chapa. If you run into any issues, contact support so we can help you complete the payment.`;
  }

  if (text.includes('delivery') || text.includes('ship')) {
    return `Orders are delivered to the address you provide during checkout. We also support selecting a delivery pin on the map for more accurate delivery placement.`;
  }

  if (text.includes('support') || text.includes('contact')) {
    return `You can reach out through the website support options if you need help with an order, payment, or product question.`;
  }

  const product = findProduct(text);
  if (product) {
    return `${product.name} is a ${product.category} item priced at ${formatPrice(product.price)}. ${product.description}`;
  }

  return `I can help with products, prices, orders, payments, and delivery for ${STORE_PROFILE.name}. Ask me about a product or how to place an order.`;
}

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if ((!message || !message.trim()) && !Array.isArray(history)) {
      return res.status(400).json({ message: 'Message is required' });
    }

<<<<<<< HEAD
    const apiKey = process.env.OPENROUTER_API_KEY;
    const systemPrompt = `You are the customer support assistant for ${STORE_PROFILE.name}. Use this store information when answering: ${STORE_PROFILE.about} ${STORE_PROFILE.orderFlow} ${STORE_PROFILE.delivery} ${STORE_PROFILE.support} Available products: ${STORE_PRODUCTS.map((product) => `${product.name} - ${formatPrice(product.price)} (${product.category}, ${product.stock} in stock)`).join('; ')}.`;

    if (!apiKey) {
      return res.json({ reply: buildFallbackReply(message), fallback: true, source: 'local' });
=======
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
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: FREE_MODEL,
<<<<<<< HEAD
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
=======
        messages: [...systemMessages, ...contextMessages, ...conversationMessages],
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306
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
      return res.json({ reply: buildFallbackReply(message), fallback: true, source: 'local' });
    }
    res.json({ reply: text });
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.response?.data || err.message;
    console.error('OpenRouter API error:', detail);
    res.json({ reply: buildFallbackReply(message), fallback: true, source: 'local', detail: String(detail) });
  }
};
