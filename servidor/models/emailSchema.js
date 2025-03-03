import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Esquema para formularios de contacto
const ContactFormSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telefono: {  
        type: String,
        required: true
    },
    prefix: { 
        type: String,
        required: true
    },
    asunto: { 
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'resolved'],
        default: 'pending'
    },
    emailSent: {
        success: Boolean,
        error: String,
        attempts: Number,
        lastAttempt: Date
    }
}, { timestamps: true });

// Exportamos solo el modelo de contacto
export const ContactForm = mongoose.model('ContactForm', ContactFormSchema);