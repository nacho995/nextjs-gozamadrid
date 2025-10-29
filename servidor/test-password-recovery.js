import dotenv from 'dotenv';
import { sendEmail } from './utils/email.js';

dotenv.config();

const testPasswordRecovery = async () => {
  try {
    console.log('=== Test de Recuperación de Contraseña ===\n');
    
    console.log('Variables de entorno configuradas:');
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 20) + '...' : 'NO CONFIGURADA');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('\n');

    const testToken = 'abc123test456token';
    const testEmail = process.env.EMAIL_FROM || 'test@example.com';
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
    console.log('1. Verifica que BREVO_API_KEY esté configurada en .env');
    console.log('2. Obtén una API Key gratis en https://www.brevo.com/');
    console.log('3. Ve a Settings → API Keys → Generate new API key');
    console.log('4. Verifica que EMAIL_FROM esté configurado con un email válido');
  }
};

testPasswordRecovery();
