import dotenv from 'dotenv';

dotenv.config();

// Brevo API para envío de emails (funciona en Render, SMTP está bloqueado)
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

export const sendEmail = async ({ email, subject, html, text, sendCopyToAdmin = false }) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY no está configurada. Obtén una gratis en https://www.brevo.com/');
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@gozamadrid.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'GozaMadrid';

    console.log(`[SendEmail Brevo] Enviando email a: ${email}`);
    console.log(`[SendEmail Brevo] Usando API Key: ${BREVO_API_KEY.substring(0, 20)}...`);

    // Preparar el payload para Brevo API
    const payload = {
      sender: {
        name: fromName,
        email: fromEmail
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: subject,
      htmlContent: html,
      textContent: text || 'Por favor habilite HTML en su cliente de correo.'
    };

    // Enviar email principal usando Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[SendEmail Brevo] Error response:', errorData);
      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log(`[SendEmail Brevo] Email enviado exitosamente. MessageId: ${result.messageId}`);

    // Enviar copia al admin si se solicita
    if (sendCopyToAdmin && process.env.EMAIL_RECIPIENT) {
      const adminEmails = process.env.EMAIL_RECIPIENT.split(',').map(e => e.trim());
      
      const adminPayload = {
        sender: {
          name: fromName,
          email: fromEmail
        },
        to: adminEmails.map(adminEmail => ({
          email: adminEmail,
          name: adminEmail.split('@')[0]
        })),
        subject: `[COPIA ADMIN] ${subject}`,
        htmlContent: html + `<hr><p><small>Este es un email enviado a: ${email}</small></p>`,
        textContent: text || 'Por favor habilite HTML en su cliente de correo.'
      };

      await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(adminPayload)
      });

      console.log(`[SendEmail Brevo] Copia enviada al admin: ${process.env.EMAIL_RECIPIENT}`);
    }

    return result;

  } catch (error) {
    console.error('[SendEmail Brevo] Error al enviar email:', error);
    throw error;
  }
};

console.log('[utils/email.js] Configurado con Brevo API (300 emails/día gratis).'); 