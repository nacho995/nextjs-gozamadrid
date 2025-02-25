import mongoose from 'mongoose';
const { Schema } = mongoose;

const propertySchema = new mongoose.Schema({
    typeProperty: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    m2: { type: String },
    priceM2: { type: String },
    rooms: { type: String, required: true },
    wc: { type: String, required: true },
    piso: { type: String, required: true },
    tags: [String],
    // Cambiamos "image" a "images" para permitir múltiples imágenes
    images: [{
      src: { type: String },
      alt: { type: String },
    }],
    price: { type: String, required: true },
    template: {
      type: String,
      default: "default",
    },
  }, {
    timestamps: true,
  });
  
  const Property = mongoose.model('Property', propertySchema);

export default Property;
  