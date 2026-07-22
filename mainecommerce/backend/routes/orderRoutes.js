const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getMyOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public — customers place orders
router.post('/', createOrder);

// Authenticated — customer fetches their own orders
router.get('/mine', authenticate, getMyOrders);

// Admin only
router.get('/',           authenticate, requireAdmin, getOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.delete('/:id',     authenticate, requireAdmin, deleteOrder);

module.exports = router;
