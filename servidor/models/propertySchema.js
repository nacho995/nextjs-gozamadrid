import mongoose from 'mongoose';
const { Schema } = mongoose;

const propertySchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    images: [{
      src: String,
      alt: String
    }],
    bedrooms: {
      type: String,
      default: "2"
    },
    bathrooms: {
      type: String,
      default: "1"
    },
    area: {
      type: String,
      default: "80"
    },
    typeProperty: {
      type: String,
      default: "Propiedad"
    },
    m2: { type: String },
    priceM2: { type: String },
    rooms: { type: String, required: true },
    wc: { type: String, required: true },
    piso: { type: String, required: true },
    tags: [String],
    template: {
      type: String,
      default: "default",
    },
  }, {
    timestamps: true,
  });
  
  const Property = mongoose.model('Property', propertySchema);

export default Property;
  