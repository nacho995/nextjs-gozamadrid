import mongoose from 'mongoose';

const PropertyVisitSchema = new mongoose.Schema({
  property: {
    type: String,
    required: true
  },
  propertyAddress: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: Date,
    required: true
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
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
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
PropertyVisitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PropertyVisit = mongoose.model('PropertyVisit', PropertyVisitSchema);

export default PropertyVisit; 