const express = require('express');
const router = express.Router();
const {
  getVenueWeather,
  getWeatherSafeAlternatives,
} = require('../controllers/weatherController');

// GET /api/weather/venue/:venueId?date=YYYY-MM-DD
router.get('/venue/:venueId', getVenueWeather);

// GET /api/weather/alternatives
router.get('/alternatives', getWeatherSafeAlternatives);

module.exports = router;
