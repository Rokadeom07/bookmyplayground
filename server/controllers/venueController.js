const { Venue, PlayingArea, Review, Promotion, City, Favourite } = require('../models');
const { Trie } = require('../algorithms/Trie');
const { calculateHaversineDistance } = require('../algorithms/Haversine');
const { mergeSort } = require('../algorithms/MergeSort');

// Global Trie instances for autocomplete cache
let venueTrie = new Trie();
let isTrieInitialized = false;

// Initialize or refresh Trie from MongoDB
async function refreshVenueTrie() {
  try {
    const venues = await Venue.find({ approvalStatus: 'approved' }).select('name city locality sports type');
    const freshTrie = new Trie();

    for (const v of venues) {
      // Index venue name
      freshTrie.insert(v.name, { id: v._id, text: v.name, type: 'venue', city: v.city, sports: v.sports });
      // Index locality
      freshTrie.insert(v.locality, { id: v._id, text: v.locality, type: 'locality', city: v.city });
    }

    const cities = await City.find({ isActive: true }).select('name stateName');
    for (const c of cities) {
      freshTrie.insert(c.name, { id: c._id, text: c.name, type: 'city', state: c.stateName });
    }

    venueTrie = freshTrie;
    isTrieInitialized = true;
    console.log(`[Trie] Autocomplete Trie refreshed with ${venueTrie.totalWords} indexed entries.`);
  } catch (err) {
    console.error('[Trie Error] Failed to build autocomplete trie:', err.message);
  }
}

// @desc    Autocomplete Search using Trie Algorithm
// @route   GET /api/venues/autocomplete?q=ban
// @access  Public
exports.autocompleteSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, results: [] });
    }

    if (!isTrieInitialized) {
      await refreshVenueTrie();
    }

    const suggestions = venueTrie.autocomplete(q.trim(), 8);

    // Format clean suggestions
    const deduplicated = [];
    const seen = new Set();

    for (const item of suggestions) {
      if (item.metadata && item.metadata.length > 0) {
        for (const meta of item.metadata) {
          const key = `${meta.type}-${meta.text}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(meta);
          }
        }
      } else {
        if (!seen.has(item.word)) {
          seen.add(item.word);
          deduplicated.push({ text: item.word, type: 'keyword' });
        }
      }
    }

    res.status(200).json({
      success: true,
      query: q,
      results: deduplicated.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Venues with Multi-Filter and Sorting
// @route   GET /api/venues
// @access  Public
exports.getVenues = async (req, res, next) => {
  try {
    const {
      city,
      locality,
      state,
      sport,
      minPrice,
      maxPrice,
      minRating,
      facilities,
      surface,
      isIndoor,
      type, // 'bookable' or 'discovery'
      search,
      sortBy = 'rating', // 'rating', 'price_asc', 'price_desc', 'name', 'distance'
      userLat,
      userLng,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { approvalStatus: 'approved' };

    if (city) {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (locality) {
      query.locality = new RegExp(`^${locality.trim()}$`, 'i');
    }
    if (state) {
      query.state = new RegExp(`^${state.trim()}$`, 'i');
    }
    if (sport) {
      query.sports = sport;
    }
    if (type) {
      query.type = type;
    }
    if (isIndoor !== undefined) {
      query.isIndoor = isIndoor === 'true';
    }
    if (surface) {
      query.surface = surface;
    }
    if (minRating) {
      query.ratingAverage = { $gte: Number(minRating) };
    }

    if (minPrice || maxPrice) {
      query.baseHourlyPricePaise = {};
      if (minPrice) query.baseHourlyPricePaise.$gte = Number(minPrice) * 100;
      if (maxPrice) query.baseHourlyPricePaise.$gte = Number(maxPrice) * 100;
    }

    if (facilities) {
      const facList = facilities.split(',').map(f => f.trim());
      query.facilities = { $all: facList };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    let venues = await Venue.find(query).lean();

    // Attach distance using Haversine formula if coordinates provided
    if (userLat && userLng) {
      const uLat = parseFloat(userLat);
      const uLng = parseFloat(userLng);

      venues = venues.map(v => {
        let distanceKm = null;
        if (v.location && v.location.coordinates) {
          const [vLng, vLat] = v.location.coordinates;
          distanceKm = calculateHaversineDistance(uLat, uLng, vLat, vLng);
        }
        return { ...v, distanceKm };
      });
    }

    // Sort using Merge Sort algorithm for predictable stability
    let comparator;
    if (sortBy === 'price_asc') {
      comparator = (a, b) => a.baseHourlyPricePaise - b.baseHourlyPricePaise;
    } else if (sortBy === 'price_desc') {
      comparator = (a, b) => b.baseHourlyPricePaise - a.baseHourlyPricePaise;
    } else if (sortBy === 'name') {
      comparator = (a, b) => a.name.localeCompare(b.name);
    } else if (sortBy === 'distance' && userLat && userLng) {
      comparator = (a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999);
    } else {
      // Default: rating desc
      comparator = (a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0);
    }

    const { sorted: sortedVenues } = mergeSort(venues, comparator);

    // Apply pagination
    const totalCount = sortedVenues.length;
    const startIndex = (page - 1) * limit;
    const paginatedVenues = sortedVenues.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedVenues.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      venues: paginatedVenues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find Venues Near Me (Geospatial $near or Haversine sorting)
// @route   GET /api/venues/near-me?lat=...&lng=...&radius=10
// @access  Public
exports.getNearMeVenues = async (req, res, next) => {
  try {
    const { lat, lng, radius = 20, sport } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user latitude and longitude coordinates.',
      });
    }

    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const maxRadiusKm = parseFloat(radius);
    const maxDistanceMeters = maxRadiusKm * 1000;

    const geoQuery = {
      approvalStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [uLng, uLat],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (sport) {
      geoQuery.sports = sport;
    }

    const venues = await Venue.find(geoQuery).limit(30).lean();

    // Attach exact Haversine distance in km
    const venuesWithDistance = venues.map(v => {
      const [vLng, vLat] = v.location.coordinates;
      const distanceKm = calculateHaversineDistance(uLat, uLng, vLat, vLng);
      return {
        ...v,
        distanceKm,
        googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${vLat},${vLng}&travelmode=driving`,
      };
    });

    res.status(200).json({
      success: true,
      radiusKm: maxRadiusKm,
      count: venuesWithDistance.length,
      userLocation: { lat: uLat, lng: uLng },
      venues: venuesWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Venue Details by ID with Playing Areas & Active Promotions
// @route   GET /api/venues/:id
// @access  Public
exports.getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'name email phone')
      .lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    // Fetch playing areas
    const playingAreas = await PlayingArea.find({ venue: venue._id, isActive: true }).lean();

    // Fetch latest verified reviews
    const reviews = await Review.find({ venue: venue._id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch active promotions
    const promotions = await Promotion.find({
      venue: venue._id,
      isActive: true,
      validTo: { $gte: new Date() },
    }).lean();

    res.status(200).json({
      success: true,
      venue: {
        ...venue,
        playingAreas,
        reviews,
        promotions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Venue (Owner only)
// @route   POST /api/venues
// @access  Private (Owner, Admin)
exports.createVenue = async (req, res, next) => {
  try {
    const {
      name,
      description,
      sports,
      address,
      state,
      city,
      locality,
      pincode,
      coordinates, // [lng, lat]
      images,
      facilities,
      surface,
      operatingHours,
      baseHourlyPriceInr,
      isIndoor,
      playingAreas = [],
    } = req.body;

    if (!name || !sports || !address || !state || !city || !locality || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory venue fields including address and coordinates.',
      });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const baseHourlyPricePaise = Math.round((Number(baseHourlyPriceInr) || 1200) * 100);

    const venue = await Venue.create({
      name,
      slug,
      type: 'bookable',
      description: description || '',
      sports: Array.isArray(sports) ? sports : [sports],
      address,
      state,
      city,
      locality,
      pincode: pincode || '400001',
      location: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      },
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=1200'],
      facilities: facilities || ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
      surface: surface || 'Artificial Turf',
      operatingHours: operatingHours || { open: '06:00', close: '23:00' },
      baseHourlyPricePaise,
      isIndoor: Boolean(isIndoor),
      owner: req.user._id,
      approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
      isAvailableForBooking: true,
    });

    // Create default playing areas if provided or fallback to 1 area per sport
    if (playingAreas && playingAreas.length > 0) {
      for (const area of playingAreas) {
        await PlayingArea.create({
          venue: venue._id,
          name: area.name || 'Pitch 1',
          sport: area.sport || venue.sports[0],
          surfaceType: area.surfaceType || venue.surface,
          dimensions: area.dimensions || '100ft x 60ft',
          capacity: area.capacity || 14,
          hourlyPricePaise: Math.round((Number(area.hourlyPriceInr) || Number(baseHourlyPriceInr) || 1200) * 100),
          weekendHourlyPricePaise: Math.round((Number(area.weekendHourlyPriceInr) || (Number(baseHourlyPriceInr) * 1.25) || 1500) * 100),
        });
      }
    } else {
      // Create at least one playing area for each sport
      for (let i = 0; i < venue.sports.length; i++) {
        const sport = venue.sports[i];
        await PlayingArea.create({
          venue: venue._id,
          name: `${sport} Area 1`,
          sport,
          surfaceType: venue.surface,
          hourlyPricePaise: baseHourlyPricePaise,
          weekendHourlyPricePaise: Math.round(baseHourlyPricePaise * 1.25),
        });
      }
    }

    // Refresh autocomplete Trie in background
    refreshVenueTrie();

    res.status(201).json({
      success: true,
      message:
        req.user.role === 'admin'
          ? 'Venue created and published successfully.'
          : 'Venue created successfully. Submitted for admin approval.',
      venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Venue (Owner of the venue or Admin)
// @route   PUT /api/venues/:id
// @access  Private (Owner, Admin)
exports.updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    if (req.user.role !== 'admin' && String(venue.owner) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own venues.',
      });
    }

    const updates = req.body;
    if (updates.baseHourlyPriceInr) {
      updates.baseHourlyPricePaise = Math.round(Number(updates.baseHourlyPriceInr) * 100);
    }

    const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    refreshVenueTrie();

    res.status(200).json({
      success: true,
      message: 'Venue details updated.',
      venue: updatedVenue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner's Own Venues
// @route   GET /api/venues/my-venues
// @access  Private (Owner)
exports.getMyVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ owner: req.user._id }).lean();
    const venuesWithAreas = await Promise.all(
      venues.map(async v => {
        const areas = await PlayingArea.find({ venue: v._id }).lean();
        return { ...v, playingAreas: areas };
      })
    );

    res.status(200).json({
      success: true,
      count: venuesWithAreas.length,
      venues: venuesWithAreas,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Review for Venue
// @route   POST /api/venues/:id/reviews
// @access  Private (Customer, Admin)
exports.addReview = async (req, res, next) => {
  try {
    const { rating, cleanlinessRating, facilitiesRating, valueRating, comment, bookingId } = req.body;
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating (1-5) and comment are required.' });
    }

    const review = await Review.create({
      venue: venue._id,
      customer: req.user._id,
      booking: bookingId || null,
      rating: Number(rating),
      cleanlinessRating: Number(cleanlinessRating) || Number(rating),
      facilitiesRating: Number(facilitiesRating) || Number(rating),
      valueRating: Number(valueRating) || Number(rating),
      comment: comment.trim(),
    });

    // Recalculate average rating for venue
    const allReviews = await Review.find({ venue: venue._id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    venue.ratingAverage = Math.round(avg * 10) / 10;
    venue.ratingCount = allReviews.length;
    await venue.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review,
      ratingAverage: venue.ratingAverage,
      ratingCount: venue.ratingCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Venue Favourite
// @route   POST /api/venues/:id/favourite
// @access  Private
exports.toggleFavourite = async (req, res, next) => {
  try {
    const existing = await Favourite.findOne({
      customer: req.user._id,
      venue: req.params.id,
    });

    if (existing) {
      await Favourite.findByIdAndDelete(existing._id);
      return res.status(200).json({ success: true, isFavourite: false, message: 'Removed from favourites.' });
    }

    await Favourite.create({
      customer: req.user._id,
      venue: req.params.id,
    });

    res.status(200).json({ success: true, isFavourite: true, message: 'Saved to favourites!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Customer's Favourite Venues
// @route   GET /api/venues/my-favourites
// @access  Private
exports.getMyFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ customer: req.user._id })
      .populate('venue')
      .lean();

    res.status(200).json({
      success: true,
      count: favourites.length,
      favourites: favourites.map(f => f.venue).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

module.exports.refreshVenueTrie = refreshVenueTrie;
