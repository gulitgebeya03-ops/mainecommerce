const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendStatusUpdate } = require('../services/email');

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

    sendOrderConfirmation(order).catch((e) => console.error('Order confirmation email failed:', e?.message));

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

exports.getMyOrders = async (req, res) => {
  try {
    const email = String(req.user?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'No email on token' });
    const orders = await Order.find({ email }).sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    await order.save();

    if (order.email && previousStatus !== status) {
      sendStatusUpdate(order, previousStatus).catch((e) => console.error('Status update email failed:', e?.message));
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
