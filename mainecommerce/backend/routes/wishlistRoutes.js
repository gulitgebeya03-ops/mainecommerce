const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, checkWishlist } = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getWishlist);
router.post('/toggle', authenticate, toggleWishlist);
router.get('/check', authenticate, checkWishlist);

module.exports = router;
