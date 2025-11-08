import User from '../models/userSchema.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

// Configuración para entornos (desarrollo/producción)
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5174';

export const forgotPassword = async (req, res) => {
  try {
    // 1) Obtener usuario basado en el email
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor proporcione un email'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No existe un usuario con ese email'
      });
    }

    // 2) Generar token de restablecimiento aleatorio
    const resetToken = user.createPasswordResetToken();
    console.log(`[forgotPassword] Token generado (primeros 10 chars): ${resetToken.substring(0, 10)}...`);
    console.log(`[forgotPassword] Token generado (longitud): ${resetToken.length}`);
    console.log(`[forgotPassword] Token hasheado guardado (primeros 10 chars): ${user.resetPasswordToken.substring(0, 10)}...`);
    console.log(`[forgotPassword] Token expira en: ${new Date(user.resetPasswordExpires).toISOString()}`);
    
    await user.save({ validateBeforeSave: false });
    
    // Verificar que se guardó correctamente
    const savedUser = await User.findById(user._id);
    console.log(`[forgotPassword] ✅ Token guardado en DB: ${savedUser.resetPasswordToken ? 'Sí' : 'No'}`);
    console.log(`[forgotPassword] ✅ Expiración guardada: ${savedUser.resetPasswordExpires ? new Date(savedUser.resetPasswordExpires).toISOString() : 'No'}`);

    // 3) Enviar por email
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    
    const message = `
      <p>¿Olvidaste tu contraseña? No te preocupes, puedes establecer una nueva utilizando el siguiente enlace:</p>
      <p><a href="${resetURL}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
      <p>Este enlace es válido por 10 minutos.</p>
      <p>Si no solicitaste este cambio, por favor ignora este email.</p>
    `;

    try {
      console.log(`[forgotPassword] 📧 Enviando email de recuperación a: ${user.email}`);
      console.log(`[forgotPassword] 🔗 URL de reset: ${resetURL}`);
      
      await sendEmail({
        email: user.email,
        subject: 'Restablecimiento de contraseña (válido por 10 min)',
        html: message,
        sendCopyToAdmin: false // No enviar copia a admin por privacidad en recuperación de contraseña
      });

      console.log(`[forgotPassword] ✅ Email de recuperación enviado exitosamente a: ${user.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Token enviado al email'
      });
      
    } catch (err) {
      console.error('Error al enviar email de recuperación:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'Error al enviar el email. Inténtelo más tarde.'
      });
    }
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al procesar su solicitud'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log('[authController] resetPassword - Token recibido:', req.params.token.substring(0, 10) + '...');
    
    // 1) Obtener usuario basado en el token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // 2) Si el token no ha expirado, y hay un usuario, establecer la nueva contraseña
    if (!user) {
      console.log('[authController] resetPassword - Token inválido o expirado');
      return res.status(400).json({
        status: 'error',
        message: 'El token es inválido o ha expirado'
      });
    }

    console.log('[authController] resetPassword - Usuario encontrado:', user.email);
    console.log('[authController] resetPassword - Actualizando contraseña...');

    // 3) Actualizar la contraseña (el pre-save hook la hasheará automáticamente)
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('[authController] resetPassword - Contraseña actualizada exitosamente para:', user.email);

    // 4) Responder al cliente
    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.error('[authController] Error en resetPassword:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al procesar su solicitud'
    });
  }
};

export const login = async (req, res) => {
  try {
    // ... lógica de autenticación existente
    
    // Al devolver el usuario, incluir la imagen de perfil
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      // ... otros campos
      profileImage: user.profileImage?.url || null,
      // ... otros datos
    };
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: userResponse,
      token // si usas JWT
    });
  } catch (error) {
    // ... manejo de errores
  }
}; 