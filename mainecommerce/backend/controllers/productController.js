const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const fs = require('fs/promises');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads', 'products');

async function saveProductImageIfDataUrl(image) {
  const value = String(image || '').trim();
  const match = value.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/i);

  if (!match) return value;

  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const mimeType = match[1].toLowerCase();
  const extension = extensionByMime[mimeType] || 'jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(match[2], 'base64'));

  return `/uploads/products/${fileName}`;
}

async function normalizeProductPayload(body = {}) {
  const images = Array.isArray(body.images)
    ? body.images
    : [];
  const singleImage = body.image ? [body.image] : [];
  const normalizedImages = await Promise.all(
    [...singleImage, ...images]
      .map((image) => String(image || '').trim())
      .filter(Boolean)
      .map(saveProductImageIfDataUrl)
  );

  return {
    title: body.title || body.name,
    description: body.description,
    price: body.price,
    originalPrice: body.originalPrice || null,
    stock: body.stock,
    images: normalizedImages,
    category: body.category,
  };
}

exports.createProduct = async (req, res) => {
  try {
    const productData = await normalizeProductPayload(req.body);
    const p = new Product({ ...productData, createdBy: req.user?.id });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    console.error('createProduct error', err.message || err);
    res.status(500).json({ message: 'Create product failed' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, await normalizeProductPayload(req.body), { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(500);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Image search: find products with similar names/descriptions ──────────────
exports.searchByImage = async (req, res) => {
  try {
    const { imageData, category } = req.body;
    if (!imageData) return res.status(400).json({ message: 'imageData (base64) is required' });

    const match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
    if (!match) return res.status(400).json({ message: 'Invalid base64 image data' });

    const uploadDir = path.join(__dirname, '..', 'uploads', 'search');
    await fs.mkdir(uploadDir, { recursive: true });
    const ext = imageData.match(/^data:image\/(\w+);/)?.[1] || 'jpg';
    const fileName = `search-${Date.now()}.${ext}`;
    await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(match[1], 'base64'));

    const query = { category: category || 'Electronics' };
    if (category) query.category = category;
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(12);

    res.json({ results: products, savedAs: `/uploads/search/${fileName}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── About / public stats ────────────────────────────────────────────────────
exports.getPublicStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueAgg, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find({ createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } }),
    ]);

    const annualSales = revenueAgg[0]?.total || 0;
    const yearlyOrders = recentOrders.length;
    const uniqueCustomers = new Set(recentOrders.map((o) => o.email).filter(Boolean)).size;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      annualSales,
      yearlyOrders,
      uniqueCustomers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
