const express = require('express');
const router = express.Router();
const {
  getOwnerAnalytics,
  getSlotOptimisationSuggestions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getOwnerPromotions,
  blockSlotForMaintenance,
  getBlockedSlots,
  unblockSlot,
} = require('../controllers/ownerAnalyticsController');
const { protect, authorize } = require('../middleware/auth');

// Restrict all owner routes to authenticated owners (or admins)
router.use(protect, authorize('owner', 'admin'));

router.get('/analytics', getOwnerAnalytics);
router.get('/slot-optimisation', getSlotOptimisationSuggestions);
router.get('/promotions', getOwnerPromotions);
router.post('/promotions', createPromotion);
router.patch('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);
router.get('/blocked-slots', getBlockedSlots);
router.post('/block-slot', blockSlotForMaintenance);
router.delete('/blocked-slots/:id', unblockSlot);

module.exports = router;
