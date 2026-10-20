const { User, OwnerProfile, Venue, Booking, State, City, Locality } = require('../models');
const { refreshVenueTrie } = require('./venueController');

// @desc    Admin Platform Overview Stats
// @route   GET /api/admin/overview
// @access  Private (Admin)
exports.getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const pendingOwners = await OwnerProfile.countDocuments({ approvalStatus: 'pending' });

    const totalVenues = await Venue.countDocuments();
    const approvedVenues = await Venue.countDocuments({ approvalStatus: 'approved' });
    const pendingVenues = await Venue.countDocuments({ approvalStatus: 'pending' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.find({ bookingStatus: 'confirmed' }).select('totalAmountPaise');
    const totalSimulatedRevenuePaise = confirmedBookings.reduce((sum, b) => sum + (b.totalAmountPaise || 0), 0);

    const totalCities = await City.countDocuments({ isActive: true });
    const totalStates = await State.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        pendingOwners,
        totalVenues,
        approvedVenues,
        pendingVenues,
        totalBookings,
        totalSimulatedRevenueInr: totalSimulatedRevenuePaise / 100,
        totalCities,
        totalStates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List All Registered Users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    List Ground Owners and Verification Profiles
// @route   GET /api/admin/owners
// @access  Private (Admin)
exports.getOwners = async (req, res, next) => {
  try {
    const profiles = await OwnerProfile.find()
      .populate('user', 'name email phone createdAt isActive')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: profiles.length, owners: profiles });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Ground Owner Application
// @route   PATCH /api/admin/owners/:id/approval
// @access  Private (Admin)
exports.reviewOwnerApplication = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const profile = await OwnerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Owner profile not found.' });
    }

    profile.approvalStatus = status;
    profile.approvedAt = new Date();
    profile.approvedBy = req.user._id;
    if (rejectionReason) profile.rejectionReason = rejectionReason;

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Owner application has been ${status}.`,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List Venues Awaiting Approval
// @route   GET /api/admin/venue-approvals
// @access  Private (Admin)
exports.getPendingVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: venues.length, venues });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve, Reject, or Suspend Venue Listing
// @route   PATCH /api/admin/venues/:id/approval
// @access  Private (Admin)
exports.reviewVenue = async (req, res, next) => {
  try {
    const { status, type } = req.body; // status: 'approved' | 'rejected' | 'pending'; type: 'bookable' | 'discovery'

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    if (status) venue.approvalStatus = status;
    if (type) venue.type = type;

    await venue.save();
    refreshVenueTrie();

    res.status(200).json({
      success: true,
      message: `Venue "${venue.name}" listing updated to status: ${venue.approvalStatus}.`,
      venue,
    });
  } catch (error) {
    next(error);
  }
};
