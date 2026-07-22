const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, deleteProduct, getProducts, getProduct } = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
