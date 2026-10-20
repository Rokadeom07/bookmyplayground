const mongoose = require('mongoose');

const ownerVerificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentType: {
      type: String,
      enum: ['aadhaar', 'pan', 'gst', 'business_license', 'ground_lease', 'electricity_bill'],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['submitted', 'verified', 'rejected'],
      default: 'submitted',
    },
    notes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OwnerVerification', ownerVerificationSchema);
