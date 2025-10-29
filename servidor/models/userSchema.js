import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    profilePic: {
        src: {
            type: String,
            default: null
        },
        alt: {
            type: String,
            default: 'Foto de perfil'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profileImage: {
        url: {
            type: String,
            default: ''
        },
        publicId: {
            type: String,
            default: ''
        }
    }
}, { timestamps: true });

// Middleware para actualizar updatedAt antes de cada actualización
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para crear token de restablecimiento de contraseña
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User; 