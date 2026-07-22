require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes    = require('./routes/userRoutes');
const chatRoutes    = require('./routes/chatRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const searchRoutes   = require('./routes/searchRoutes');

const app = express();

// Allow both the storefront and the admin dashboard origins
const allowedOrigins = [
  process.env.CLIENT_URL      || 'http://localhost:5173',  // storefront (Gulit)
  process.env.ADMIN_CLIENT_URL || 'http://localhost:5174', // admin dashboard (Vite default next port)
  'http://localhost:5175',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public',  express.static(path.join(__dirname, 'public')));

app.use('/api/payment',  paymentRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/search',   searchRoutes);

const PORT = process.env.PORT || 5252;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server listening on ${PORT}`)))
  .catch(err => console.error('MongoDB connection error', err));

module.exports = app;
