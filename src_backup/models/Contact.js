import mongoose from 'mongoose';

// Esquema para almacenar información de contactos
const ContactSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor, proporcione un nombre'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor, proporcione un email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, use un email válido'],
  },
  telefono: {
    type: String,
    trim: true,
  },
  tipoPropiedad: {
    type: String,
    enum: ['Piso', 'Chalet', 'Ático', 'Villa', 'Dúplex', 'Otro'],
  },
  zonaPropiedad: String,
  rangoValor: String,
  intereses: {
    type: [String],
    default: ['valoración'],
  },
  ultimoContacto: {
    type: Date,
    default: Date.now,
  },
  emailsEnviados: {
    type: Number,
    default: 0,
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'pausado'],
    default: 'activo',
  },
  ultimosTemasEnviados: {
    type: [String],
    default: [],
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

// Middleware para actualizar la fecha de modificación
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
