const crypto = require('crypto');
const {
  Booking,
  BookingHold,
  Payment,
  Venue,
  PlayingArea,
  Promotion,
  Notification,
  AvailabilityRule,
} = require('../models');
const {
  timeToMinutes,
  minutesToTime,
  intervalsOverlap,
  generateHourlySlots,
} = require('../algorithms/IntervalOverlap');

// @desc    Get Available Slots for a Venue and Playing Area on a Date
// @route   GET /api/bookings/slots?venueId=...&playingAreaId=...&date=YYYY-MM-DD
// @access  Public
exports.getSlots = async (req, res, next) => {
  try {
    const { venueId, playingAreaId, date } = req.query;

    if (!venueId || !date) {
      return res.status(400).json({
        success: false,
        message: 'venueId and date are required.',
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    let playingArea;
    if (playingAreaId) {
      playingArea = await PlayingArea.findById(playingAreaId);
    } else {
      playingArea = await PlayingArea.findOne({ venue: venue._id, isActive: true });
    }

    if (!playingArea) {
      return res.status(404).json({ success: false, message: 'Playing area not found for this venue.' });
    }

    const openTime = venue.operatingHours?.open || '06:00';
    const closeTime = venue.operatingHours?.close || '23:00';

    // 1. Fetch confirmed bookings for this playing area on this date
    const bookedSlots = await Booking.find({
      playingArea: playingArea._id,
      date,
      bookingStatus: { $ne: 'cancelled' },
    }).select('startTime endTime bookingStatus');

    // 2. Fetch active temporary holds
    const heldSlots = await BookingHold.find({
      playingArea: playingArea._id,
      date,
      expiresAt: { $gt: new Date() },
    }).select('startTime endTime');

    // 3. Fetch maintenance blocked rules
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    const blockedRules = await AvailabilityRule.find({
      venue: venue._id,
      isBlocked: true,
      $and: [
        { $or: [{ playingArea: playingArea._id }, { playingArea: null }] },
        { $or: [{ specificDate: date }, { dayOfWeek: dayOfWeek }] },
      ],
    }).select('openTime closeTime blockReason');

    // 4. Generate hourly slots using DS Interval Algorithm
    const baseSlots = generateHourlySlots(
      openTime,
      closeTime,
      playingArea.slotDurationMinutes || 60,
      bookedSlots,
      heldSlots,
      blockedRules
    );

    // 5. Calculate pricing and check for promotions
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const basePricePaise = isWeekend
      ? playingArea.weekendHourlyPricePaise || playingArea.hourlyPricePaise
      : playingArea.hourlyPricePaise;

    // Check active promotions for this venue and day
    const promotions = await Promotion.find({
      venue: venue._id,
      isActive: true,
      applicableDays: dayOfWeek,
      validFrom: { $lte: dateObj },
      validTo: { $gte: dateObj },
    });

    const enrichedSlots = baseSlots.map(slot => {
      let finalPricePaise = basePricePaise;
      let appliedPromotion = null;

      // Check if slot falls in promotion window
      for (const promo of promotions) {
        if (intervalsOverlap(slot.startTime, slot.endTime, promo.startHour, promo.endHour)) {
          const discount = Math.round((basePricePaise * promo.discountPercentage) / 100);
          finalPricePaise = basePricePaise - discount;
          appliedPromotion = {
            id: promo._id,
            title: promo.title,
            discountPercentage: promo.discountPercentage,
          };
          break;
        }
      }

      return {
        ...slot,
        originalPriceInr: basePricePaise / 100,
        finalPriceInr: finalPricePaise / 100,
        originalPricePaise: basePricePaise,
        finalPricePaise,
        promotion: appliedPromotion,
      };
    });

    res.status(200).json({
      success: true,
      venueId: venue._id,
      venueName: venue.name,
      playingArea: {
        id: playingArea._id,
        name: playingArea.name,
        sport: playingArea.sport,
      },
      date,
      isWeekend,
      totalSlots: enrichedSlots.length,
      availableSlotsCount: enrichedSlots.filter(s => s.status === 'available').length,
      slots: enrichedSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hold a Slot temporarily (10-minute hold for concurrency safety)
// @route   POST /api/bookings/hold
// @access  Private (Customer, Owner, Admin)
exports.holdSlot = async (req, res, next) => {
  try {
    const { venueId, playingAreaId, date, startTime, endTime } = req.body;

    if (!venueId || !playingAreaId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'venueId, playingAreaId, date, startTime, and endTime are required.',
      });
    }

    // 0. Check if slot overlaps with maintenance block
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const maintenanceConflict = await AvailabilityRule.findOne({
      venue: venueId,
      isBlocked: true,
      $and: [
        { $or: [{ playingArea: playingAreaId }, { playingArea: null }] },
        { $or: [{ specificDate: date }, { dayOfWeek: dayOfWeek }] },
      ],
      openTime: { $lt: endTime },
      closeTime: { $gt: startTime },
    });

    if (maintenanceConflict) {
      return res.status(409).json({
        success: false,
        message: `This slot is unavailable due to maintenance: ${maintenanceConflict.blockReason || 'Scheduled turf maintenance'}.`,
      });
    }

    // 1. Check if slot is already booked
    const conflictBooking = await Booking.findOne({
      playingArea: playingAreaId,
      date,
      bookingStatus: { $ne: 'cancelled' },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: 'Sorry, this slot has already been booked by another player.',
      });
    }

    // 2. Check if already held by another user
    const existingHold = await BookingHold.findOne({
      playingArea: playingAreaId,
      date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      expiresAt: { $gt: new Date() },
    });

    if (existingHold && String(existingHold.customer) !== String(req.user._id)) {
      return res.status(409).json({
        success: false,
        message: 'This slot is currently on hold by another user completing checkout. Please try again shortly.',
      });
    }

    // Generate unique session token and 10-minute expiry
    const sessionToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert or create hold
    const hold = await BookingHold.findOneAndUpdate(
      {
        playingArea: playingAreaId,
        date,
        startTime,
        customer: req.user._id,
      },
      {
        venue: venueId,
        playingArea: playingAreaId,
        date,
        startTime,
        endTime,
        customer: req.user._id,
        sessionToken,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Slot temporarily locked for 10 minutes.',
      holdId: hold._id,
      sessionToken,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Checkout & Concurrency-Safe Booking Confirmation
// @route   POST /api/bookings/checkout
// @access  Private (Customer, Owner, Admin)
exports.checkoutBooking = async (req, res, next) => {
  try {
    const {
      venueId,
      playingAreaId,
      sport,
      date,
      startTime,
      endTime,
      paymentMethod = 'simulated_upi',
      notes = '',
      customerDetails,
      sessionToken,
    } = req.body;

    if (!venueId || !playingAreaId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All booking slot details must be provided.',
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    if (venue.type === 'discovery') {
      return res.status(400).json({
        success: false,
        message: 'This is a Discovery Venue. Live bookings will be enabled once owner onboarding is complete.',
      });
    }

    const playingArea = await PlayingArea.findById(playingAreaId);
    if (!playingArea) {
      return res.status(404).json({ success: false, message: 'Playing area not found.' });
    }

    // Check maintenance conflict
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const maintenanceConflict = await AvailabilityRule.findOne({
      venue: venueId,
      isBlocked: true,
      $and: [
        { $or: [{ playingArea: playingAreaId }, { playingArea: null }] },
        { $or: [{ specificDate: date }, { dayOfWeek: dayOfWeek }] },
      ],
      openTime: { $lt: endTime },
      closeTime: { $gt: startTime },
    });

    if (maintenanceConflict) {
      return res.status(409).json({
        success: false,
        message: `This slot cannot be booked due to maintenance: ${maintenanceConflict.blockReason || 'Scheduled turf maintenance'}.`,
      });
    }

    // Atomic Check: prevent double booking
    const conflictBooking = await Booking.findOne({
      playingArea: playingArea._id,
      date,
      bookingStatus: { $ne: 'cancelled' },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: 'Slot conflict: This slot was just booked by another customer.',
      });
    }

    // Calculate official server-side price (Never trust client-supplied price)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const originalAmountPaise = isWeekend
      ? playingArea.weekendHourlyPricePaise || playingArea.hourlyPricePaise
      : playingArea.hourlyPricePaise;

    let discountAmountPaise = 0;
    let appliedPromoId = null;

    // Check active promotional discounts
    const promo = await Promotion.findOne({
      venue: venue._id,
      isActive: true,
      applicableDays: dayOfWeek,
      validFrom: { $lte: dateObj },
      validTo: { $gte: dateObj },
      startHour: { $lte: startTime },
      endHour: { $gte: endTime },
    });

    if (promo) {
      discountAmountPaise = Math.round((originalAmountPaise * promo.discountPercentage) / 100);
      appliedPromoId = promo._id;
    }

    const totalAmountPaise = originalAmountPaise - discountAmountPaise;

    // Generate unique Indian booking ID: BMP-YYYYMMDD-XXXX
    const dateClean = date.replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingId = `BMP-${dateClean}-${randomHex}`;

    // Create Booking record
    const booking = await Booking.create({
      bookingId,
      customer: req.user._id,
      owner: venue.owner,
      venue: venue._id,
      playingArea: playingArea._id,
      sport: sport || playingArea.sport,
      date,
      startTime,
      endTime,
      totalAmountPaise,
      originalAmountPaise,
      discountAmountPaise,
      promotionApplied: appliedPromoId,
      paymentStatus: 'simulated_success',
      bookingStatus: 'confirmed',
      notes,
      customerDetails: {
        name: customerDetails?.name || req.user.name,
        phone: customerDetails?.phone || req.user.phone,
        email: customerDetails?.email || req.user.email,
      },
      isSimulatedPayment: true,
    });

    // Create Payment record
    const transactionId = `TXN_SIM_${Date.now()}_${randomHex}`;
    const receiptId = `RCPT_${bookingId}`;

    const payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      amountPaise: totalAmountPaise,
      currency: 'INR',
      method: paymentMethod,
      transactionId,
      status: 'success',
      isSimulated: true,
      receiptId,
      disclaimer: 'DEMO PAYMENT — NO REAL MONEY CHARGED',
    });

    // Release any temporary hold
    await BookingHold.deleteMany({
      playingArea: playingArea._id,
      date,
      startTime,
    });

    // Send notifications
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your slot at ${venue.name} (${playingArea.name}) for ${date} at ${startTime} is confirmed. Booking ID: ${bookingId}.`,
      type: 'booking',
      data: { bookingId: booking._id },
    });

    if (venue.owner) {
      await Notification.create({
        user: venue.owner,
        title: 'New Ground Booking Received',
        message: `New booking for ${venue.name} on ${date} (${startTime}-${endTime}) by ${req.user.name}.`,
        type: 'booking',
        data: { bookingId: booking._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully (Simulated Payment).',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        venueName: venue.name,
        playingAreaName: playingArea.name,
        sport: booking.sport,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalAmountInr: totalAmountPaise / 100,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        transactionId: payment.transactionId,
        receiptId: payment.receiptId,
        disclaimer: 'DEMO PAYMENT — NO REAL MONEY CHARGED',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Customer's Bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer, Owner, Admin)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('venue', 'name address city locality images location')
      .populate('playingArea', 'name sport surfaceType')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = bookings.map(b => ({
      ...b,
      totalAmountInr: b.totalAmountPaise / 100,
      originalAmountInr: b.originalAmountPaise / 100,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Ground Owner's Venue Bookings
// @route   GET /api/bookings/owner-bookings
// @access  Private (Owner)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    // Find venues owned by this user
    const ownerVenues = await Venue.find({ owner: req.user._id }).select('_id');
    const venueIds = ownerVenues.map(v => v._id);

    const bookings = await Booking.find({ venue: { $in: venueIds } })
      .populate('venue', 'name locality city')
      .populate('playingArea', 'name sport')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = bookings.map(b => ({
      ...b,
      totalAmountInr: b.totalAmountPaise / 100,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Eligible Booking
// @route   POST /api/bookings/:id/cancel
// @access  Private (Customer, Owner, Admin)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Personal reasons' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check ownership or admin
    const isCustomer = String(booking.customer) === String(req.user._id);
    const isOwner = String(booking.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot cancel this booking.' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
    }

    // Mark cancelled
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Create notification
    await Notification.create({
      user: booking.customer,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingId}) has been cancelled. Simulated refund initiated.`,
      type: 'cancellation',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Slot is now available for other players.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Booking Receipt Data
// @route   GET /api/bookings/:id/receipt
// @access  Private
exports.getReceipt = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue', 'name address city locality pincode')
      .populate('playingArea', 'name sport')
      .populate('customer', 'name email phone')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const payment = await Payment.findOne({ booking: booking._id }).lean();

    res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: payment ? payment.receiptId : `RCPT_${booking.bookingId}`,
        bookingId: booking.bookingId,
        bookingDate: booking.createdAt,
        slotDate: booking.date,
        slotTime: `${booking.startTime} - ${booking.endTime}`,
        venue: {
          name: booking.venue.name,
          address: `${booking.venue.address}, ${booking.venue.locality}, ${booking.venue.city} - ${booking.venue.pincode}`,
        },
        playingArea: booking.playingArea.name,
        sport: booking.sport,
        customer: {
          name: booking.customerDetails?.name || booking.customer.name,
          email: booking.customerDetails?.email || booking.customer.email,
          phone: booking.customerDetails?.phone || booking.customer.phone,
        },
        pricing: {
          originalInr: booking.originalAmountPaise / 100,
          discountInr: booking.discountAmountPaise / 100,
          totalInr: booking.totalAmountPaise / 100,
        },
        payment: {
          method: payment ? payment.method : 'simulated_upi',
          transactionId: payment ? payment.transactionId : 'TXN_SIMULATED',
          status: payment ? payment.status : 'success',
          disclaimer: 'DEMO PAYMENT — NO REAL MONEY CHARGED',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
