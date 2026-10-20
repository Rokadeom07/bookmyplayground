const mongoose = require('mongoose');

// GroupParticipant sub-document
const groupParticipantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    localityName: {
      type: String,
      required: true,
      trim: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// GroupSession Schema
const groupSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      enum: ['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'],
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    preferredTime: {
      type: String, // 'HH:MM'
      default: '18:00',
    },
    totalBudgetInr: {
      type: Number,
      default: 2500,
    },
    playerCount: {
      type: Number,
      default: 10,
    },
    fairnessMode: {
      type: String,
      enum: ['minimum_travel', 'fairest_travel', 'lowest_price'],
      default: 'fairest_travel',
    },
    status: {
      type: String,
      enum: ['active', 'finalized', 'expired'],
      default: 'active',
    },
    participants: [groupParticipantSchema],
    selectedVenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  { timestamps: true }
);

// WeatherCache Schema
const weatherCacheSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    hourlyForecast: [
      {
        time: String, // 'HH:00'
        temperatureC: Number,
        precipitationProbability: Number,
        rainMm: Number,
        windSpeedKmh: Number,
        weatherCode: Number,
        weatherDescription: String,
        riskLevel: {
          type: String,
          enum: ['LOW', 'MODERATE', 'HIGH'],
          default: 'LOW',
        },
      },
    ],
    summary: {
      averageTempC: Number,
      maxRainProb: Number,
      overallRisk: String,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL cache for 1 hour
    },
  },
  { timestamps: true }
);

weatherCacheSchema.index({ venue: 1, date: 1 }, { unique: true });

// Promotion Schema for Owner dynamic promotional discounts
const promotionSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    playingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayingArea',
      default: null, // Null means all areas
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 90,
    },
    applicableDays: {
      type: [Number], // 0-6
      default: [1, 2, 3, 4, 5], // default weekdays
    },
    startHour: {
      type: String, // '14:00'
      required: true,
    },
    endHour: {
      type: String, // '17:00'
      required: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTo: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// VenueAnalytics Schema
const venueAnalyticsSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenuePaise: {
      type: Number,
      default: 0,
    },
    occupancyPercent: {
      type: Number,
      default: 0,
    },
    peakHour: {
      type: String,
      default: '19:00',
    },
    cancellationCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

venueAnalyticsSchema.index({ venue: 1, date: 1 }, { unique: true });

const GroupSession = mongoose.model('GroupSession', groupSessionSchema);
const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);
const Promotion = mongoose.model('Promotion', promotionSchema);
const VenueAnalytics = mongoose.model('VenueAnalytics', venueAnalyticsSchema);

module.exports = {
  GroupSession,
  WeatherCache,
  Promotion,
  VenueAnalytics,
};
