const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['discovery', 'bookable'],
      default: 'bookable',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    sports: {
      type: [String],
      enum: ['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'],
      required: [true, 'At least one sport must be selected'],
      validate: [v => Array.isArray(v) && v.length > 0, 'Select at least one sport'],
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    facilities: {
      type: [String],
      default: ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'],
    },
    surface: {
      type: String,
      enum: ['Artificial Turf', 'Natural Grass', 'Clay', 'Hard Court', 'Sand', 'Indoor Mat', 'Hybrid Turf', 'Synthetic Turf'],
      default: 'Artificial Turf',
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
    },
    baseHourlyPricePaise: {
      type: Number,
      default: 120000, // ₹1,200 stored as integer paise
      min: 0,
    },
    capacity: {
      type: Number,
      default: 20,
    },
    isIndoor: {
      type: Boolean,
      default: false,
    },
    hasFloodlights: {
      type: Boolean,
      default: true,
    },
    hasParking: {
      type: Boolean,
      default: true,
    },
    hasWashrooms: {
      type: Boolean,
      default: true,
    },
    hasDrinkingWater: {
      type: Boolean,
      default: true,
    },
    hasChangingRooms: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for discovery venues
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // For seeded verified venues; newly submitted owner venues start as pending
    },
    isAvailableForBooking: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    rules: {
      type: [String],
      default: [
        'Non-marking sports shoes only',
        'No smoking or alcohol on premises',
        'Report 10 minutes prior to slot time',
        'Carry your own sports gear/balls unless rented on site',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial discovery
venueSchema.index({ location: '2dsphere' });
venueSchema.index({ city: 1, sports: 1, approvalStatus: 1 });
venueSchema.index({ baseHourlyPricePaise: 1 });
venueSchema.index({ ratingAverage: -1 });

// Helper virtual for price in INR rupees
venueSchema.virtual('baseHourlyPriceInr').get(function () {
  return this.baseHourlyPricePaise / 100;
});

module.exports = mongoose.model('Venue', venueSchema);
