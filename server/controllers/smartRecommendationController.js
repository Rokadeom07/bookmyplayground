const { Venue, Locality, City, Booking } = require('../models');
const { calculateHaversineDistance } = require('../algorithms/Haversine');
const { scoreVenue, DEFAULT_WEIGHTS } = require('../algorithms/WeightedRecommendation');
const { PriorityQueue } = require('../algorithms/MinHeap');
const { intervalsOverlap } = require('../algorithms/IntervalOverlap');

// @desc    Smart Ground Recommendation Engine
// @route   POST /api/recommendations/smart
// @access  Public
exports.getSmartRecommendations = async (req, res, next) => {
  try {
    const {
      sport,
      city,
      preferredLocality,
      budgetInr = 2500,
      maxDistanceKm = 30,
      preferredDate,
      preferredTime = '18:00',
      numberOfPlayers = 10,
      requiredFacilities = [],
      isIndoor,
      userCoordinates, // [lng, lat] optional
      weights = DEFAULT_WEIGHTS,
    } = req.body;

    if (!sport) {
      return res.status(400).json({
        success: false,
        message: 'Please choose one of the 6 sports (Cricket, Football, Pickleball, Hockey, Golf, Kabaddi).',
      });
    }

    // 1. Determine reference center coordinates for distance calculation
    let refCoords = [72.8777, 19.076]; // Default Mumbai coords

    if (userCoordinates && Array.isArray(userCoordinates) && userCoordinates.length === 2) {
      refCoords = userCoordinates;
    } else if (preferredLocality && city) {
      const loc = await Locality.findOne({
        name: new RegExp(`^${preferredLocality.trim()}$`, 'i'),
        cityName: new RegExp(`^${city.trim()}$`, 'i'),
      });
      if (loc && loc.location?.coordinates) {
        refCoords = loc.location.coordinates;
      }
    } else if (city) {
      const c = await City.findOne({ name: new RegExp(`^${city.trim()}$`, 'i') });
      if (c && c.location?.coordinates) {
        refCoords = c.location.coordinates;
      }
    }

    const [refLng, refLat] = refCoords;

    // 2. Query candidate approved venues from MongoDB
    const query = {
      approvalStatus: 'approved',
      sports: sport,
    };

    if (city) {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (isIndoor !== undefined && isIndoor !== null && isIndoor !== '') {
      query.isIndoor = Boolean(isIndoor);
    }

    const candidateVenues = await Venue.find(query).lean();

    if (candidateVenues.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No approved ${sport} venues found in ${city || 'selected region'}.`,
        recommendations: [],
      });
    }

    // 3. For each candidate venue, evaluate distance, slot availability, and multi-factor score
    const evaluatedList = await Promise.all(
      candidateVenues.map(async venue => {
        let distanceKm = 10;
        if (venue.location?.coordinates) {
          const [vLng, vLat] = venue.location.coordinates;
          distanceKm = calculateHaversineDistance(refLat, refLng, vLat, vLng);
        }

        // Check if preferred time slot is confirmed available
        let isSlotAvailable = true;
        if (preferredDate && preferredTime) {
          const slotEndHour = `${String(Number(preferredTime.split(':')[0]) + 1).padStart(2, '0')}:00`;
          const conflictingBooking = await Booking.findOne({
            venue: venue._id,
            date: preferredDate,
            bookingStatus: { $ne: 'cancelled' },
            startTime: { $lt: slotEndHour },
            endTime: { $gt: preferredTime },
          });
          if (conflictingBooking) {
            isSlotAvailable = false;
          }
        }

        // Calculate transparent weighted recommendation score
        const { rawScore, matchPercentage, explanation, breakdown } = scoreVenue(
          venue,
          {
            distanceKm,
            maxDistanceKm: Number(maxDistanceKm),
            budgetInr: Number(budgetInr),
            requestedFacilities: requiredFacilities,
            isSlotAvailable,
          },
          weights
        );

        return {
          ...venue,
          distanceKm,
          isSlotAvailable,
          matchPercentage,
          rawScore,
          explanation,
          scoreBreakdown: breakdown,
        };
      })
    );

    // 4. Use Priority Queue (Max-Heap simulator via MinHeap with inverted comparator)
    // to extract Top-K venues efficiently: O(N log K)
    const pq = new PriorityQueue((a, b) => b.rawScore - a.rawScore);
    for (const item of evaluatedList) {
      pq.insert(item);
    }

    const topK = pq.extractTopK(10);

    // 5. Categorized Highlights
    let bestMatch = topK[0] || null;

    // Cheapest suitable
    const cheapestSuitable = [...evaluatedList]
      .filter(v => v.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.baseHourlyPricePaise - b.baseHourlyPricePaise)[0] || topK[0];

    // Nearest suitable
    const nearestSuitable = [...evaluatedList].sort((a, b) => a.distanceKm - b.distanceKm)[0] || topK[0];

    // Best facilities
    const bestFacilities = [...evaluatedList].sort(
      (a, b) => (b.facilities?.length || 0) - (a.facilities?.length || 0)
    )[0] || topK[0];

    res.status(200).json({
      success: true,
      dataStructureAlgorithm: 'Min Heap Priority Queue (O(N log K))',
      sport,
      city: city || 'All Cities',
      totalEvaluated: evaluatedList.length,
      topCount: topK.length,
      weightsUsed: weights,
      highlights: {
        bestMatch: bestMatch ? { id: bestMatch._id, name: bestMatch.name, matchPercentage: bestMatch.matchPercentage } : null,
        cheapestSuitable: cheapestSuitable ? { id: cheapestSuitable._id, name: cheapestSuitable.name, priceInr: cheapestSuitable.baseHourlyPricePaise / 100 } : null,
        nearestSuitable: nearestSuitable ? { id: nearestSuitable._id, name: nearestSuitable.name, distanceKm: nearestSuitable.distanceKm } : null,
        bestFacilities: bestFacilities ? { id: bestFacilities._id, name: bestFacilities.name, facilitiesCount: bestFacilities.facilities?.length } : null,
      },
      recommendations: topK,
    });
  } catch (error) {
    next(error);
  }
};
