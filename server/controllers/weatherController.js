const axios = require('axios');
const { WeatherCache, Venue, PlayingArea } = require('../models');
const { PriorityQueue } = require('../algorithms/MinHeap');
const { calculateHaversineDistance } = require('../algorithms/Haversine');

// WMO Weather interpretation code mapper
function interpretWeatherCode(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Mainly Clear / Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
}

// Configurable weather risk rules engine
function classifyWeatherRisk(rainProb = 0, rainMm = 0, windSpeedKmh = 10, isOutdoor = true) {
  if (!isOutdoor) {
    return 'LOW'; // Indoor covered grounds have minimal weather risk
  }

  if (rainProb >= 65 || rainMm >= 4.0 || windSpeedKmh >= 40) {
    return 'HIGH';
  }
  if (rainProb >= 35 || rainMm >= 1.0 || windSpeedKmh >= 28) {
    return 'MODERATE';
  }
  return 'LOW';
}

// @desc    Get Weather Forecast for a Venue on a Specific Date
// @route   GET /api/weather/venue/:venueId?date=YYYY-MM-DD
// @access  Public
exports.getVenueWeather = async (req, res, next) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD).' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    const [vLng, vLat] = venue.location.coordinates;

    // Check MongoDB WeatherCache
    const cached = await WeatherCache.findOne({
      venue: venue._id,
      date,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        venueId: venue._id,
        venueName: venue.name,
        isIndoor: venue.isIndoor,
        date,
        forecast: cached.hourlyForecast,
        summary: cached.summary,
      });
    }

    // Check if requested date is within Open-Meteo's 14-day forecast window
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((requestedDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 14) {
      return res.status(200).json({
        success: true,
        isForecastAvailable: false,
        message: 'Weather forecast unavailable for this booking time (outside 14-day forecast window).',
        venueId: venue._id,
        date,
      });
    }

    // Call real Open-Meteo API
    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${vLat}&longitude=${vLng}&hourly=temperature_2m,precipitation_probability,rain,weathercode,windspeed_10m&forecast_days=14&timezone=Asia%2FKolkata`;

      const response = await axios.get(openMeteoUrl, { timeout: 6000 });
      const hourly = response.data?.hourly;

      if (!hourly || !hourly.time) {
        throw new Error('Incomplete weather payload.');
      }

      // Filter hours for the requested date (YYYY-MM-DD)
      const hourlyForecast = [];
      let totalTemp = 0;
      let maxRainProb = 0;
      let count = 0;

      for (let i = 0; i < hourly.time.length; i++) {
        const timeStr = hourly.time[i]; // e.g. "2026-10-18T18:00"
        if (timeStr.startsWith(date)) {
          const hourPart = timeStr.split('T')[1];
          const temp = hourly.temperature_2m[i];
          const rainProb = hourly.precipitation_probability[i] || 0;
          const rainMm = hourly.rain[i] || 0;
          const wind = hourly.windspeed_10m[i] || 0;
          const code = hourly.weathercode[i] || 0;
          const riskLevel = classifyWeatherRisk(rainProb, rainMm, wind, !venue.isIndoor);

          hourlyForecast.push({
            time: hourPart,
            temperatureC: Math.round(temp),
            precipitationProbability: rainProb,
            rainMm,
            windSpeedKmh: Math.round(wind),
            weatherCode: code,
            weatherDescription: interpretWeatherCode(code),
            riskLevel,
          });

          totalTemp += temp;
          if (rainProb > maxRainProb) maxRainProb = rainProb;
          count++;
        }
      }

      const averageTempC = count > 0 ? Math.round(totalTemp / count) : 28;
      const overallRisk = classifyWeatherRisk(maxRainProb, 0, 15, !venue.isIndoor);

      const summary = {
        averageTempC,
        maxRainProb,
        overallRisk,
        venueType: venue.isIndoor ? 'Indoor / Covered' : 'Outdoor Open Ground',
      };

      // Cache in MongoDB with 1-hour expiry
      await WeatherCache.findOneAndUpdate(
        { venue: venue._id, date },
        {
          venue: venue._id,
          latitude: vLat,
          longitude: vLng,
          date,
          hourlyForecast,
          summary,
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({
        success: true,
        source: 'live_api',
        isForecastAvailable: true,
        venueId: venue._id,
        venueName: venue.name,
        isIndoor: venue.isIndoor,
        date,
        forecast: hourlyForecast,
        summary,
      });
    } catch (apiError) {
      console.warn('[Weather API Notice] Open-Meteo unavailable:', apiError.message);
      return res.status(200).json({
        success: true,
        isForecastAvailable: false,
        message: 'Weather forecast unavailable for this booking time (network error or provider rate limit).',
        venueId: venue._id,
        date,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Weather-Safe Indoor / Covered Alternative Venues
// @route   GET /api/weather/alternatives?venueId=...&sport=Football&city=Mumbai
// @access  Public
exports.getWeatherSafeAlternatives = async (req, res, next) => {
  try {
    const { venueId, sport, city, budgetInr = 2500 } = req.query;

    const baseVenue = venueId ? await Venue.findById(venueId) : null;
    const searchSport = sport || baseVenue?.sports[0] || 'Football';
    const searchCity = city || baseVenue?.city || 'Mumbai';

    // Search covered or indoor venues for same sport
    const alternatives = await Venue.find({
      approvalStatus: 'approved',
      city: new RegExp(`^${searchCity}$`, 'i'),
      sports: searchSport,
      isIndoor: true,
    }).lean();

    if (alternatives.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No covered/indoor ${searchSport} venues found in ${searchCity}.`,
        alternatives: [],
      });
    }

    // Rank using Priority Queue by distance to original venue and price
    const pq = new PriorityQueue((a, b) => a.rankScore - b.rankScore);

    const [origLng, origLat] = baseVenue?.location?.coordinates || [72.8777, 19.076];

    for (const alt of alternatives) {
      const [aLng, aLat] = alt.location.coordinates;
      const distanceKm = calculateHaversineDistance(origLat, origLng, aLat, aLng);
      const priceInr = alt.baseHourlyPricePaise / 100;

      // Ranking cost: lower distance and closer to budget is better
      const rankScore = distanceKm * 0.6 + (priceInr / 100) * 0.4;
      pq.insert({ ...alt, distanceKm, priceInr, rankScore });
    }

    const topAlternatives = pq.extractTopK(5);

    res.status(200).json({
      success: true,
      sport: searchSport,
      city: searchCity,
      count: topAlternatives.length,
      alternatives: topAlternatives.map(a => ({
        id: a._id,
        name: a.name,
        locality: a.locality,
        city: a.city,
        isIndoor: a.isIndoor,
        hourlyPriceInr: a.priceInr,
        distanceFromOriginalKm: a.distanceKm,
        facilities: a.facilities,
        images: a.images,
        reason: 'Covered all-weather indoor facility protected from rain and wind.',
      })),
    });
  } catch (error) {
    next(error);
  }
};
