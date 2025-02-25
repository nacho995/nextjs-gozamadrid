import mongoose from 'mongoose';
const { Schema } = mongoose;

const propertySchema = new Schema({
    typeProperty: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    piso: {
        type: Number,
        required: true
    },
    wc: {
        type: Number,
        required: true
    },
    m2: {
        type: Number,
        required: true
    },
    rooms: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
  