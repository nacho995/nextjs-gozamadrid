import mongoose from 'mongoose';
const { Schema } = mongoose;

const propertySchema = new Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    },
    price: {
      type: String,
      required: true
    },
    images: [{
      src: { type: String },
      alt: { type: String }
    }],
    bedrooms: {
      type: String,
      required: true
    },
    bathrooms: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    typeProperty: {
      type: String,
      default: "Propiedad"
    },
    m2: { type: String },
    priceM2: { type: String },
    rooms: { 
      type: String, 
      required: false
    },
    wc: { 
      type: String, 
      required: false
    },
    piso: { 
      type: String, 
      required: false
    },
    tags: [String],
    template: {
      type: String,
      default: "default",
    },
    location: {
      type: String,
      required: true
    },
    propertyType: {
      type: String,
      enum: ['Venta', 'Alquiler', 'Alquiler Vacacional'],
      default: 'Venta'
    },
    features: [String],
    status: {
      type: String,
      enum: ['Disponible', 'Vendido', 'Reservado'],
      default: 'Disponible'
    },
    featured: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true,
  });
  
  const Property = mongoose.model('Property', propertySchema);

export default Property;
  