const express = require('express');
const router = express.Router();
const {
  getSlots,
  holdSlot,
  checkoutBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  getReceipt,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', getSlots);
router.post('/hold', protect, holdSlot);
router.post('/checkout', protect, checkoutBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/owner-bookings', protect, authorize('owner', 'admin'), getOwnerBookings);
router.post('/:id/cancel', protect, cancelBooking);
router.get('/:id/receipt', protect, getReceipt);

module.exports = router;
