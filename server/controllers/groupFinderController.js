const crypto = require('crypto');
const { GroupSession, Venue, Locality, City } = require('../models');
const { calculateHaversineDistance, estimateTravelTimeMinutes } = require('../algorithms/Haversine');
const { createDemoTransitGraph } = require('../algorithms/Graph');
const { PriorityQueue } = require('../algorithms/MinHeap');

// @desc    Create a New Group Session
// @route   POST /api/groups
// @access  Private (Customer, Owner, Admin)
exports.createGroupSession = async (req, res, next) => {
  try {
    const {
      name,
      sport,
      city,
      preferredDate,
      preferredTime = '18:00',
      totalBudgetInr = 2500,
      playerCount = 10,
      fairnessMode = 'fairest_travel',
      initialParticipant,
    } = req.body;

    if (!name || !sport || !city || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session name, sport, city, and preferred date.',
      });
    }

    const sessionCode = `BMP-GRP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const participants = [];
    if (initialParticipant && initialParticipant.localityName) {
      participants.push({
        user: req.user._id,
        name: initialParticipant.name || req.user.name,
        localityName: initialParticipant.localityName,
        cityName: city,
        coordinates: initialParticipant.coordinates || [72.8777, 19.076],
      });
    }

    const session = await GroupSession.create({
      sessionCode,
      creator: req.user._id,
      name,
      sport,
      city,
      preferredDate,
      preferredTime,
      totalBudgetInr,
      playerCount,
      fairnessMode,
      participants,
    });

    res.status(201).json({
      success: true,
      message: 'Group session created. Share session code to invite friends.',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join Group Session
// @route   POST /api/groups/:id/join
// @access  Public (or Private)
exports.joinGroupSession = async (req, res, next) => {
  try {
    const { name, localityName, cityName, coordinates } = req.body;

    if (!name || !localityName) {
      return res.status(400).json({
        success: false,
        message: 'Participant name and starting locality are required.',
      });
    }

    // Lookup session by ID or sessionCode
    let session = await GroupSession.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { sessionCode: req.params.id }],
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Group session not found.' });
    }

    // Determine coordinates if not provided
    let coords = coordinates;
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      const loc = await Locality.findOne({
        name: new RegExp(`^${localityName.trim()}$`, 'i'),
        cityName: new RegExp(`^${cityName || session.city}$`, 'i'),
      });
      if (loc && loc.location?.coordinates) {
        coords = loc.location.coordinates;
      } else {
        coords = [72.8777, 19.076]; // default city fallback
      }
    }

    session.participants.push({
      user: req.user ? req.user._id : null,
      name,
      localityName,
      cityName: cityName || session.city,
      coordinates: coords,
    });

    await session.save();

    res.status(200).json({
      success: true,
      message: `${name} joined group session successfully!`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Session Details
// @route   GET /api/groups/:id
// @access  Public
exports.getGroupSession = async (req, res, next) => {
  try {
    const session = await GroupSession.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { sessionCode: req.params.id }],
    })
      .populate('creator', 'name email phone')
      .populate('selectedVenue', 'name address locality city baseHourlyPricePaise images');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Group session not found.' });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate Group Recommendations with Fairness Objective & Dijkstra Demo
// @route   POST /api/groups/:id/recommendations
// @access  Public
exports.getGroupRecommendations = async (req, res, next) => {
  try {
    const session = await GroupSession.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { sessionCode: req.params.id }],
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Group session not found.' });
    }

    const { fairnessMode = session.fairnessMode || 'fairest_travel' } = req.body;
    const participants = session.participants;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No participants have joined this session yet. Add at least one starting locality.',
      });
    }

    // 1. Fetch candidate venues for this sport and city
    const candidateVenues = await Venue.find({
      approvalStatus: 'approved',
      sports: session.sport,
      city: new RegExp(`^${session.city}$`, 'i'),
    }).lean();

    if (candidateVenues.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No approved ${session.sport} grounds found in ${session.city}.`,
        recommendations: [],
      });
    }

    // 2. Evaluate travel metrics for each venue across all participants
    const evaluatedVenues = candidateVenues.map(venue => {
      const [vLng, vLat] = venue.location.coordinates;
      let totalDistance = 0;
      let maxIndividualDistance = 0;
      let minIndividualDistance = Infinity;

      const participantBreakdown = participants.map(p => {
        const [pLng, pLat] = p.coordinates;
        const distKm = calculateHaversineDistance(pLat, pLng, vLat, vLng);
        const estTimeMin = estimateTravelTimeMinutes(distKm);

        totalDistance += distKm;
        if (distKm > maxIndividualDistance) maxIndividualDistance = distKm;
        if (distKm < minIndividualDistance) minIndividualDistance = distKm;

        return {
          participantName: p.name,
          locality: p.localityName,
          distanceKm: distKm,
          estimatedTravelTimeMinutes: estTimeMin,
        };
      });

      const averageDistance = Math.round((totalDistance / participants.length) * 10) / 10;
      const hourlyPriceInr = venue.baseHourlyPricePaise / 100;

      // Group Fairness Cost Objective
      // Normalised Total: lower is better (0 to 1)
      const normTotal = Math.min(1.0, totalDistance / (participants.length * 35));
      // Normalised Max: prevents any single friend from traveling an unfair distance
      const normMax = Math.min(1.0, maxIndividualDistance / 40);
      // Fairness score: higher is fairer (0 to 100%)
      const groupCost = 0.6 * normTotal + 0.4 * normMax;
      const fairnessScore = Math.round(Math.max(10, (1.0 - groupCost) * 100));

      return {
        ...venue,
        hourlyPriceInr,
        totalGroupDistanceKm: Math.round(totalDistance * 10) / 10,
        averageDistanceKm: averageDistance,
        maxIndividualDistanceKm: Math.round(maxIndividualDistance * 10) / 10,
        minIndividualDistanceKm: Math.round(minIndividualDistance * 10) / 10,
        fairnessScore,
        participantBreakdown,
        explanation: `Balances travel across your group of ${participants.length}: Avg ${averageDistance} km per person, Max ${maxIndividualDistance.toFixed(1)} km.`,
      };
    });

    // 3. Sort based on selected ranking mode
    if (fairnessMode === 'minimum_travel') {
      evaluatedVenues.sort((a, b) => a.totalGroupDistanceKm - b.totalGroupDistanceKm);
    } else if (fairnessMode === 'lowest_price') {
      evaluatedVenues.sort((a, b) => a.baseHourlyPricePaise - b.baseHourlyPricePaise);
    } else {
      // Default: 'fairest_travel' (highest fairness score)
      evaluatedVenues.sort((a, b) => b.fairnessScore - a.fairnessScore);
    }

    // 4. Educational Dijkstra Shortest Path Computation on Demonstration Graph
    const demoGraph = createDemoTransitGraph();
    let dijkstraResult = null;

    if (participants.length > 0) {
      // Pick first participant's locality or matching demo node
      const sampleLocality = participants[0].localityName;
      const allGraphNodes = demoGraph.getAllVertices();

      // Find closest node name match in demonstration transit graph
      const matchedStart =
        allGraphNodes.find(n => n.toLowerCase().includes(sampleLocality.toLowerCase())) || 'Kalyan West';
      const matchedEnd = 'Thane West (Urban Sports Turf)';

      dijkstraResult = demoGraph.dijkstra(matchedStart, matchedEnd);
    }

    res.status(200).json({
      success: true,
      sessionId: session._id,
      sessionCode: session.sessionCode,
      participantCount: participants.length,
      fairnessMode,
      recommendations: evaluatedVenues.slice(0, 8),
      educationalDijkstra: {
        networkName: 'Mumbai Metropolitan Region (MMR) Educational Transit Graph',
        sourceNode: dijkstraResult?.startNode,
        targetNode: dijkstraResult?.endNode,
        computedShortestDistanceKm: dijkstraResult?.totalDistance,
        optimalPath: dijkstraResult?.path,
        stepTrace: dijkstraResult?.steps?.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};
