const mongoose = require('mongoose');

// State Schema
const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// City Schema
const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    stateName: {
      type: String,
      required: true,
      trim: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    tier: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

citySchema.index({ location: '2dsphere' });
citySchema.index({ name: 1, stateName: 1 }, { unique: true });

// Locality Schema
const localitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    stateName: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

localitySchema.index({ location: '2dsphere' });
localitySchema.index({ name: 1, cityName: 1 }, { unique: true });

const State = mongoose.model('State', stateSchema);
const City = mongoose.model('City', citySchema);
const Locality = mongoose.model('Locality', localitySchema);

module.exports = { State, City, Locality };
