const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, unique: true, sparse: true },
  customerName: String,
  email: String,
  phoneNumber: String,
  deliveryAddress: String,
  latitude: Number,
  longitude: Number,
  products: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number,
    }
  ],
  deliveryFee: { type: Number, default: 0 },
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['COD','CHAPA'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['Pending','Processing','Shipped','Delivered'], default: 'Pending' },
  payment: {
    tx_ref: String,
    chapa: Object,
    verifiedAt: Date,
    stockAdjusted: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
