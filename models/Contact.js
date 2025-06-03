import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
    required: false,
    maxlength: [20, 'Phone cannot be more than 20 characters'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
  },
  subject: {
    type: String,
    required: false,
    maxlength: [200, 'Subject cannot be more than 200 characters'],
  },
  source: {
    type: String,
    default: 'contact_form',
    enum: ['contact_form', 'newsletter', 'property_inquiry'],
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'responded', 'closed'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema); 