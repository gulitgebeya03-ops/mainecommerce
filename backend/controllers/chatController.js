const axios = require('axios');

const FREE_MODEL = 'openrouter/free';

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenRouter API key not configured. Get one at https://openrouter.ai/keys' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: FREE_MODEL,
        messages: [{ role: 'user', content: message }],
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
