const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const items = await Wishlist.find({ userId }).populate('productId').sort({ createdAt: -1 });
    const products = items.filter((i) => i.productId).map((i) => i.productId);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.json({ wishlisted: false });
    }

    await new Wishlist({ userId, productId }).save();
    res.json({ wishlisted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({});

    const items = await Wishlist.find({ userId }).select('productId');
    const map = {};
    items.forEach((i) => { map[String(i.productId)] = true; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
