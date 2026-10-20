const express = require('express');
const router = express.Router();
const {
  getStates,
  getCities,
  getLocalities,
  createState,
  createCity,
  createLocality,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/localities', getLocalities);

router.post('/states', protect, authorize('admin'), createState);
router.post('/cities', protect, authorize('admin'), createCity);
router.post('/localities', protect, authorize('admin'), createLocality);

module.exports = router;
