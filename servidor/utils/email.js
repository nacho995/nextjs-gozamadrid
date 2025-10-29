import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Configurar transporter de Nodemailer
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  console.log('[utils/email.js] Configurando transporter con:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user
  });

  return nodemailer.createTransport(config);
};

export const sendEmail = async ({ email, subject, html, text, sendCopyToAdmin = false }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_USER y EMAIL_PASSWORD deben estar configurados');
    }

    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    // Mensaje principal al usuario
    const mailOptions = {
      from: `"GozaMadrid" <${fromEmail}>`,
      to: email,
      subject: subject,
      text: text || 'Por favor habilite HTML en su cliente de correo.',
      html: html
    };

    console.log(`[SendEmail] Enviando email a: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SendEmail] Email enviado exitosamente. MessageId: ${info.messageId}`);

    // Enviar copia al admin si se solicita
    if (sendCopyToAdmin && process.env.EMAIL_RECIPIENT) {
      const adminMailOptions = {
        from: `"GozaMadrid" <${fromEmail}>`,
        to: process.env.EMAIL_RECIPIENT,
        subject: `[COPIA ADMIN] ${subject}`,
        text: text || 'Por favor habilite HTML en su cliente de correo.',
        html: html + `<hr><p><small>Este es un email enviado a: ${email}</small></p>`
      };

      await transporter.sendMail(adminMailOptions);
      console.log(`[SendEmail] Copia enviada al admin: ${process.env.EMAIL_RECIPIENT}`);
    }

    return info;

  } catch (error) {
    console.error('[SendEmail] Error al enviar email:', error);
    throw error;
  }
};

console.log('[utils/email.js] Configurado con Nodemailer.'); 