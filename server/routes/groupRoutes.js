const express = require('express');
const router = express.Router();
const {
  createGroupSession,
  joinGroupSession,
  getGroupSession,
  getGroupRecommendations,
} = require('../controllers/groupFinderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', protect, createGroupSession);
router.get('/:id', optionalAuth, getGroupSession);
router.post('/:id/join', optionalAuth, joinGroupSession);
router.post('/:id/recommendations', optionalAuth, getGroupRecommendations);

module.exports = router;
