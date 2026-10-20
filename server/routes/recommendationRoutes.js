const express = require('express');
const router = express.Router();
const { getSmartRecommendations } = require('../controllers/smartRecommendationController');

// POST /api/recommendations/smart
router.post('/smart', getSmartRecommendations);

module.exports = router;
