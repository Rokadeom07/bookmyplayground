const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getUsers,
  getOwners,
  reviewOwnerApplication,
  getPendingVenues,
  reviewVenue,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Restrict all routes to super admin
router.use(protect, authorize('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.get('/owners', getOwners);
router.patch('/owners/:id/approval', reviewOwnerApplication);
router.get('/venue-approvals', getPendingVenues);
router.patch('/venues/:id/approval', reviewVenue);

module.exports = router;
