import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PropertyVisitSchema = new Schema({
    property: {
        type: String,  // ID de la propiedad
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
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    emailSent: {
        success: Boolean,
        error: String,
        attempts: {
            type: Number,
            default: 0
        },
        lastAttempt: Date
    }
}, {
    timestamps: true
});

export default mongoose.model('PropertyVisit', PropertyVisitSchema); 