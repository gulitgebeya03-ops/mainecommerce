const express = require('express');
const router = express.Router();
const { addSearch, getRecentSearches } = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

router.post('/', addSearch);
router.get('/recent', getRecentSearches);

module.exports = router;
