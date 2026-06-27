const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');

function createOrderCode() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function formatPaymentError(err) {
  const chapaError = err.response?.data;
  if (chapaError) return chapaError;

  if (err.code) {
    return {
      code: err.code,
      message: err.code === 'EACCES'
        ? 'The server could not connect to Chapa. Check network/firewall access and try again.'
        : err.message || 'Unable to contact Chapa.',
    };
  }

  return { message: err.message || 'Payment request failed.' };
}

exports.initializePayment = async (req, res) => {
  try {
    const { amount, email, first_name, last_name, phone_number, orderDraft } = req.body;
    if (!process.env.CHAPA_SECRET_KEY) {
      return res.status(500).json({ message: 'Chapa secret key is not configured.' });
    }

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required.' });
    }

    const tx_ref = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // Optionally create a draft order with tx_ref so verify can finalize it
    let draftId = null;
    if (orderDraft) {
      const itemsTotal = (orderDraft.products || []).reduce((s, p) => s + (Number(p.price) * Number(p.quantity || 1)), 0);
      const totalAmount = itemsTotal + (Number(orderDraft.deliveryFee) || 0);
      const draft = new Order({
        orderCode: createOrderCode(),
        customerName: orderDraft.customerName,
        email: orderDraft.email || email,
        phoneNumber: orderDraft.phoneNumber || phone_number,
        deliveryAddress: orderDraft.deliveryAddress,
        latitude: orderDraft.latitude,
        longitude: orderDraft.longitude,
        products: orderDraft.products || [],
        deliveryFee: Number(orderDraft.deliveryFee) || 0,
        totalAmount,
        payment: { tx_ref },
        paymentMethod: 'CHAPA',
        paymentStatus: 'pending',
        orderStatus: 'Pending'
      });
      await draft.save();
      draftId = draft._id;
    }
    const callbackBase = (process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const clientBase = (req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resp = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
      amount: paymentAmount,
      currency: 'ETB',
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url: `${callbackBase}/api/payment/verify/${tx_ref}`,
      return_url: `${clientBase}/payment-success?tx_ref=${encodeURIComponent(tx_ref)}`
    }, { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' } });
    res.json({ data: resp.data.data, tx_ref, draftId });
  } catch (err) {
    const details = formatPaymentError(err);
    console.error('initializePayment error', details);
    res.status(500).json({ message: 'Payment init failed', details });
  }
};

async function reducePaidOrderStock(order) {
  if (!order || order.payment?.stockAdjusted) return;

  const updates = (order.products || [])
    .filter((item) => /^[0-9a-fA-F]{24}$/.test(String(item.productId || '')))
    .map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: -Math.max(0, Number(item.quantity) || 0) } },
      },
    }));

  if (updates.length) {
    await Product.bulkWrite(updates);
  }

  order.payment.stockAdjusted = true;
}

exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    if (!process.env.CHAPA_SECRET_KEY) {
      return res.status(500).json({ message: 'Chapa secret key is not configured.' });
    }

    const resp = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } });
    const chapaData = resp.data;

    const order = await Order.findOne({ 'payment.tx_ref': tx_ref });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order for this transaction was not found.', chapaData });
    }

    const chapaStatus = chapaData?.data?.status;
    order.payment.chapa = chapaData.data;

    if (chapaStatus === 'success') {
      const wasAlreadyPaid = order.paymentStatus === 'paid';
      order.paymentStatus = 'paid';
      order.orderStatus = order.orderStatus === 'Pending' ? 'Processing' : order.orderStatus;
      order.payment.verifiedAt = new Date();

      if (!wasAlreadyPaid) {
        await reducePaidOrderStock(order);
      }

      await order.save();
      return res.json({ success: true, chapaData, order });
    }

    if (['failed', 'cancelled'].includes(chapaStatus)) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'Pending';
      await order.save();
    }

    res.json({ success: false, chapaData, order });
  } catch (err) {
    const details = formatPaymentError(err);
    console.error('verifyPayment error', details);
    res.status(500).json({ message: 'Verify failed', details });
  }
};
