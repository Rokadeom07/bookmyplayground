const mongoose = require('mongoose');

// AvailabilityRule Schema for recurring hours and maintenance blocks
const availabilityRuleSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    playingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayingArea',
      default: null, // Null means applies to all areas
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6,
    },
    specificDate: {
      type: String, // 'YYYY-MM-DD' for single-day overrides / maintenance
      default: null,
    },
    openTime: {
      type: String,
      default: '06:00',
    },
    closeTime: {
      type: String,
      default: '23:00',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// BookingHold Schema for temporary concurrency lock (expires in 10 minutes)
const bookingHoldSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    playingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayingArea',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-expire holds
    },
  },
  { timestamps: true }
);

bookingHoldSchema.index({ playingArea: 1, date: 1, startTime: 1 });

const AvailabilityRule = mongoose.model('AvailabilityRule', availabilityRuleSchema);
const BookingHold = mongoose.model('BookingHold', bookingHoldSchema);

module.exports = { AvailabilityRule, BookingHold };
