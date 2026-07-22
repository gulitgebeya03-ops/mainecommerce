const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
// Returns headline numbers for the dashboard: order count, customer count,
// product count, and total revenue from paid/delivered orders.
exports.getStats = async (req, res) => {
  try {
    const [totalOrders, totalCustomers, totalProducts, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $in: ['Delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    res.json({ totalOrders, totalCustomers, totalProducts, revenue });
  } catch (err) {
    console.error('getStats error', err.message || err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

// ── GET /api/admin/reports ────────────────────────────────────────────────────
// Returns monthly aggregated sales data.
// Query param: ?range=30|90|365|all  (default: 365)
exports.getReports = async (req, res) => {
  try {
    const range = req.query.range || '365';
    const matchStage = {};
    if (range !== 'all') {
      const days = parseInt(range, 10) || 365;
      matchStage.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    const rows = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$email' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const report = rows.map((r) => ({
      month: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
      sales: r.sales,
      orders: r.orders,
      customers: r.customers.length,
    }));

    res.json(report);
  } catch (err) {
    console.error('getReports error', err.message || err);
    res.status(500).json({ message: 'Failed to load reports' });
  }
};
