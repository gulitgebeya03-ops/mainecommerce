const User = require('../models/User');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('_id username email role createdAt')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(customers);
  } catch (err) {
    console.error('getCustomers error', err.message || err);
    res.status(500).json({ message: 'Failed to load customers' });
  }
};
