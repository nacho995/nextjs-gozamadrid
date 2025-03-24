import mongoose from 'mongoose';

const PropertyOfferSchema = new mongoose.Schema({
  property: {
    type: String,
    required: true
  },
  propertyAddress: {
    type: String,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  offerPercentage: {
    type: String,
    default: 'Personalizada'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'negotiating'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de actualización
PropertyOfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PropertyOffer = mongoose.model('PropertyOffer', PropertyOfferSchema);

export default PropertyOffer; 