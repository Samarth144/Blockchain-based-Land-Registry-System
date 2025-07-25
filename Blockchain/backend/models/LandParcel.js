import mongoose from 'mongoose';

const LandParcelSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  surveyNumber: { type: String, required: true, unique: true },
  owner: { type: String, required: true }, // Wallet address of the current owner
  location: { type: String, required: true },
  area: { type: Number, required: true },
  marketValue: { type: Number, default: 0 },
  isDisputed: { type: Boolean, default: false },
  documents: [{
    fileName: String,
    fileHash: String, // IPFS hash or similar
    uploadedAt: { type: Date, default: Date.now }
  }],
  ownershipHistory: [{
    from: String,
    to: String,
    transferDate: { type: Date, default: Date.now },
    txHash: String
  }],
  disputeHistory: [{
    flaggedBy: String,
    reason: String,
    flaggedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolvedBy: String,
    status: { type: String, enum: ['active', 'resolved'], default: 'active' }
  }],
  metadata: {
    name: String,
    description: String,
    image: String,
    external_url: String,
    attributes: Array
  }
}, { timestamps: true });

const LandParcel = mongoose.model('LandParcel', LandParcelSchema);

export default LandParcel;