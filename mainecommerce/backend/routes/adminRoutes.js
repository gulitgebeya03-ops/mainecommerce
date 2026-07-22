const express = require('express');
const router = express.Router();
const { getStats, getReports } = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/stats',    authenticate, requireAdmin, getStats);
router.get('/reports',  authenticate, requireAdmin, getReports);
router.get('/settings', authenticate, requireAdmin, getSettings);
router.put('/settings', authenticate, requireAdmin, updateSettings);

module.exports = router;
