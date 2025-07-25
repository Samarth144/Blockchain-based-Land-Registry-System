import mongoose from 'mongoose';

const LandEventSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  surveyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  ownerAddress: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
  },
  marketValue: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const LandEvent = mongoose.model('LandEvent', LandEventSchema);

export default LandEvent;
