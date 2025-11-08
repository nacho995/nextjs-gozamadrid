import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userSchema.js';

const router = express.Router();

// Endpoint temporal para debugging de contraseñas
router.post('/check-user-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`[DEBUG] Verificando contraseña para: ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'Usuario no encontrado',
        email
      });
    }

    const passwordHash = user.password;
    const isBcryptHash = passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2a$');

    console.log(`[DEBUG] Usuario encontrado: ${user.email}`);
    console.log(`[DEBUG] Hash en DB: ${passwordHash.substring(0, 30)}...`);
    console.log(`[DEBUG] Es hash de bcrypt: ${isBcryptHash}`);

    const isValid = await bcrypt.compare(password, passwordHash);

    console.log(`[DEBUG] Contraseña válida: ${isValid}`);

    return res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        passwordHashPrefix: passwordHash.substring(0, 30) + '...',
        isBcryptHash,
        passwordLength: passwordHash.length,
        passwordValid: isValid
      },
      message: isValid ? '✅ Contraseña correcta' : '❌ Contraseña incorrecta'
    });

  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
