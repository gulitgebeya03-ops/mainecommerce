const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const normalizedRole = ['admin', 'salesman'].includes(role) ? role : 'customer';
    const userData = { username, email, password: hash, role: normalizedRole };

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
    const user = await User.findOne({ email });
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
