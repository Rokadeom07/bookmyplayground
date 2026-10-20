const mongoose = require('mongoose');

// Payment Schema
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['simulated_upi', 'simulated_card', 'simulated_netbanking', 'razorpay_test'],
      default: 'simulated_upi',
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
    receiptId: {
      type: String,
      required: true,
    },
    disclaimer: {
      type: String,
      default: 'DEMO PAYMENT — NO REAL MONEY CHARGED',
    },
  },
  { timestamps: true }
);

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    cleanlinessRating: { type: Number, min: 1, max: 5, default: 5 },
    facilitiesRating: { type: Number, min: 1, max: 5, default: 5 },
    valueRating: { type: Number, min: 1, max: 5, default: 5 },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent multiple reviews per booking
reviewSchema.index({ venue: 1, customer: 1, booking: 1 });

// Favourite Schema
const favouriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favouriteSchema.index({ customer: 1, venue: 1 }, { unique: true });

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['booking', 'cancellation', 'promotion', 'system', 'approval', 'weather_alert'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
const Review = mongoose.model('Review', reviewSchema);
const Favourite = mongoose.model('Favourite', favouriteSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Payment, Review, Favourite, Notification };
