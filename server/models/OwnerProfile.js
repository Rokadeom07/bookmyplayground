const mongoose = require('mongoose');

const ownerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide business or venue entity name'],
      trim: true,
    },
    businessAddress: {
      type: String,
      required: [true, 'Please provide business registered address'],
      trim: true,
    },
    panOrGst: {
      type: String,
      trim: true,
      default: '',
    },
    declarationSigned: {
      type: Boolean,
      default: false,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OwnerProfile', ownerProfileSchema);
