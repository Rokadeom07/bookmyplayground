const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    playingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayingArea',
      required: true,
      index: true,
    },
    sport: {
      type: String,
      enum: ['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'],
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    startTime: {
      type: String, // 'HH:MM' (24-hour format)
      required: true,
    },
    endTime: {
      type: String, // 'HH:MM'
      required: true,
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
    },
    totalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    originalAmountPaise: {
      type: Number,
      required: true,
    },
    discountAmountPaise: {
      type: Number,
      default: 0,
    },
    promotionApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'simulated_success', 'completed', 'refunded', 'failed'],
      default: 'simulated_success',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    customerDetails: {
      name: String,
      phone: String,
      email: String,
    },
    isSimulatedPayment: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up conflict checks
bookingSchema.index({ playingArea: 1, date: 1, bookingStatus: 1 });
bookingSchema.index({ venue: 1, date: 1 });

bookingSchema.virtual('totalAmountInr').get(function () {
  return this.totalAmountPaise / 100;
});

module.exports = mongoose.model('Booking', bookingSchema);
