const mongoose = require('mongoose');

const playingAreaSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Playing area name is required (e.g. Pitch 1, Court A)'],
      trim: true,
    },
    sport: {
      type: String,
      enum: ['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'],
      required: true,
    },
    surfaceType: {
      type: String,
      default: 'Artificial Turf',
    },
    dimensions: {
      type: String,
      default: '100ft x 60ft',
    },
    capacity: {
      type: Number,
      default: 14,
    },
    hourlyPricePaise: {
      type: Number,
      required: true,
      default: 120000, // ₹1,200
    },
    weekendHourlyPricePaise: {
      type: Number,
      required: true,
      default: 150000, // ₹1,500
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

playingAreaSchema.virtual('hourlyPriceInr').get(function () {
  return this.hourlyPricePaise / 100;
});

playingAreaSchema.virtual('weekendHourlyPriceInr').get(function () {
  return this.weekendHourlyPricePaise / 100;
});

module.exports = mongoose.model('PlayingArea', playingAreaSchema);
