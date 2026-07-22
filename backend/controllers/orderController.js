const Order = require('../models/Order');
const Product = require('../models/Product');

function createOrderCode() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

exports.createOrder = async (req, res) => {
  try {
    const { customerName, email, phoneNumber, deliveryAddress, latitude, longitude, products, deliveryFee, paymentMethod, payment } = req.body;
    const itemsTotal = (products || []).reduce((s, p) => s + (p.price * p.quantity), 0);
    const totalAmount = itemsTotal + (deliveryFee || 0);
    const order = new Order({ orderCode: createOrderCode(), customerName, email, phoneNumber, deliveryAddress, latitude, longitude, products, deliveryFee, totalAmount, paymentMethod, paymentStatus: 'pending', orderStatus: 'Pending', payment });
    await order.save();

    await Promise.all((products || []).map((item) => {
      if (!/^[0-9a-fA-F]{24}$/.test(String(item.productId || ''))) return null;
      return Product.findByIdAndUpdate(item.productId, { $inc: { stock: -Math.max(0, Number(item.quantity) || 0) } });
    }));

    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error', err.message || err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
