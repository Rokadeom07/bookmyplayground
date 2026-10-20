const express = require('express');
const router = express.Router();
const {
  getVenues,
  getNearMeVenues,
  autocompleteSearch,
  getVenueById,
  createVenue,
  updateVenue,
  getMyVenues,
  addReview,
  toggleFavourite,
  getMyFavourites,
} = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

router.get('/autocomplete', autocompleteSearch);
router.get('/near-me', getNearMeVenues);
router.get('/my-favourites', protect, getMyFavourites);
router.get('/my-venues', protect, authorize('owner', 'admin'), getMyVenues);
router.get('/:id', getVenueById);
router.get('/', getVenues);
router.post('/', protect, authorize('owner', 'admin'), createVenue);
router.put('/:id', protect, authorize('owner', 'admin'), updateVenue);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/favourite', protect, toggleFavourite);

module.exports = router;
