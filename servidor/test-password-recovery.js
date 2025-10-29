import dotenv from 'dotenv';
import { sendEmail } from './utils/email.js';

dotenv.config();

const testPasswordRecovery = async () => {
  try {
    console.log('=== Test de Recuperación de Contraseña ===\n');
    
    console.log('Variables de entorno configuradas:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configurada***' : 'NO CONFIGURADA');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('\n');

    const testToken = 'abc123test456token';
    const testEmail = process.env.EMAIL_USER || 'test@example.com';
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${testToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablecimiento de Contraseña</h2>
        <p>¿Olvidaste tu contraseña? No te preocupes, puedes establecer una nueva utilizando el siguiente enlace:</p>
        <p style="margin: 30px 0;">
          <a href="${resetURL}" 
             style="background-color: #000; 
                    color: #fff; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Restablecer Contraseña
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Este enlace es válido por 10 minutos.</p>
        <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, por favor ignora este email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Este es un email de prueba del sistema de recuperación de contraseña.</p>
      </div>
    `;

    console.log(`Enviando email de prueba a: ${testEmail}\n`);

    await sendEmail({
      email: testEmail,
      subject: 'Test: Restablecimiento de contraseña - GozaMadrid',
      html: message,
      sendCopyToAdmin: false
    });

    console.log('\n✅ Email de prueba enviado correctamente!');
    console.log('Revisa tu bandeja de entrada en:', testEmail);

  } catch (error) {
    console.error('\n❌ Error al enviar email de prueba:', error.message);
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    if (error.command) {
      console.error('Comando que falló:', error.command);
    }
    
    console.log('\n🔍 Posibles soluciones:');
    console.log('1. Verifica que EMAIL_USER y EMAIL_PASSWORD estén configuradas en .env');
    console.log('2. Si usas Gmail, asegúrate de usar una App Password, no tu contraseña normal');
    console.log('3. Habilita la verificación en dos pasos en tu cuenta de Google');
    console.log('4. Si el error es de timeout, prueba con EMAIL_PORT=465 y EMAIL_SECURE=true');
  }
};

testPasswordRecovery();
