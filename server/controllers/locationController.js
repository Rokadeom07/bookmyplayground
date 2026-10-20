const { State, City, Locality, Venue } = require('../models');

// @desc    Get All Active States
// @route   GET /api/locations/states
// @access  Public
exports.getStates = async (req, res, next) => {
  try {
    const states = await State.find({ isActive: true }).sort({ name: 1 }).lean();
    res.status(200).json({
      success: true,
      count: states.length,
      states,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Cities with State filter, popularity sorting, and venue counts
// @route   GET /api/locations/cities?state=Maharashtra&popularOnly=false
// @access  Public
exports.getCities = async (req, res, next) => {
  try {
    const { state, popularOnly, search } = req.query;
    const query = { isActive: true };

    if (state) {
      query.stateName = new RegExp(`^${state.trim()}$`, 'i');
    }
    if (popularOnly === 'true') {
      query.isPopular = true;
    }
    if (search) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const cities = await City.find(query).sort({ isPopular: -1, name: 1 }).lean();

    // Attach ground count per city
    const citiesWithCount = await Promise.all(
      cities.map(async c => {
        const venueCount = await Venue.countDocuments({
          city: new RegExp(`^${c.name}$`, 'i'),
          approvalStatus: 'approved',
        });
        return { ...c, venueCount };
      })
    );

    res.status(200).json({
      success: true,
      count: citiesWithCount.length,
      cities: citiesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Localities for a given City
// @route   GET /api/locations/localities?city=Mumbai
// @access  Public
exports.getLocalities = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required to fetch localities.',
      });
    }

    const localities = await Locality.find({
      cityName: new RegExp(`^${city.trim()}$`, 'i'),
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      cityName: city,
      count: localities.length,
      localities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create State
// @route   POST /api/locations/states
// @access  Private (Admin)
exports.createState = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const state = await State.create({ name, code: code.toUpperCase() });
    res.status(201).json({ success: true, state });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create City
// @route   POST /api/locations/cities
// @access  Private (Admin)
exports.createCity = async (req, res, next) => {
  try {
    const { name, stateName, isPopular, coordinates, tier } = req.body;
    const state = await State.findOne({ name: new RegExp(`^${stateName}$`, 'i') });
    if (!state) {
      return res.status(400).json({ success: false, message: `State ${stateName} not found.` });
    }

    const city = await City.create({
      name,
      state: state._id,
      stateName: state.name,
      isPopular: Boolean(isPopular),
      tier: tier || 1,
      location: {
        type: 'Point',
        coordinates: coordinates || [72.8777, 19.076],
      },
    });

    res.status(201).json({ success: true, city });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create Locality
// @route   POST /api/locations/localities
// @access  Private (Admin)
exports.createLocality = async (req, res, next) => {
  try {
    const { name, cityName, pincode, coordinates } = req.body;
    const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    if (!city) {
      return res.status(400).json({ success: false, message: `City ${cityName} not found.` });
    }

    const locality = await Locality.create({
      name,
      city: city._id,
      cityName: city.name,
      stateName: city.stateName,
      pincode: pincode || '400001',
      location: {
        type: 'Point',
        coordinates: coordinates || city.location.coordinates,
      },
    });

    res.status(201).json({ success: true, locality });
  } catch (error) {
    next(error);
  }
};
