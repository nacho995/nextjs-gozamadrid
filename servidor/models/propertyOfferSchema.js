import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PropertyOfferSchema = new Schema({
    property: {
        type: String,  // ID de la propiedad
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
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'negotiating'],
        default: 'pending'
    }},
     {
        timestamps: true,
      });

export default mongoose.model('PropertyOffer', PropertyOfferSchema); 