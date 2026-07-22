const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) return res.status(400).json({ message: 'Missing email or password' });
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const normalizedRole = ['admin', 'salesman'].includes(role) ? role : 'customer';
    const userData = { username, email: normalizedEmail, password: hash, role: normalizedRole };

    // Staff accounts require the shared admin secret. Customer accounts do not.
    if (['admin', 'salesman'].includes(normalizedRole)) {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json({ id: user._id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    console.error('register error', err.message || err);
    res.status(500).json({ message: 'Register failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { id: user._id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ access_token: token, user: payload });
  } catch (err) {
    console.error('login error', err.message || err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Missing Google idToken' });

    const googleRes = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: idToken },
    });
    const { email, name, sub: googleId } = googleRes.data;
    if (!email) return res.status(400).json({ message: 'Google token missing email' });

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const hash = await bcrypt.hash(googleId, 10);
      user = new User({
        username: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hash,
        role: 'customer',
      });
      await user.save();
    }

    const payload = { id: user._id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ access_token: token, user: payload });
  } catch (err) {
    console.error('googleLogin error', err.message || err);
    res.status(500).json({ message: 'Google login failed' });
  }
};
