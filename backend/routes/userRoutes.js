const express = require('express');
const router = express.Router();
const { getCustomers } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/customers', authenticate, requireAdmin, getCustomers);

module.exports = router;
