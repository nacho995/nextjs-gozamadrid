import dotenv from 'dotenv';
// import nodemailer from 'nodemailer';
// import smtpTransport from 'nodemailer-smtp-transport';
import sgMail from '@sendgrid/mail'; // Importar SendGrid
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Configurar SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API Key configurada.');
} else {
  console.error('¡ERROR CRÍTICO! Falta la variable de entorno SENDGRID_API_KEY.');
  // Considera lanzar un error o manejar esto de forma más robusta
}

// Para obtener la ruta absoluta
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log adicional para saber qué valores estamos usando
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_RECIPIENT:', process.env.EMAIL_RECIPIENT);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

// Loguear destinatario configurado (si aún es relevante)
console.log('EMAIL_RECIPIENT (Admin notification): ', process.env.EMAIL_RECIPIENT);

// Función para escribir logs
const logToFile = (message, data) => {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'email-logs.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}: ${JSON.stringify(data, null, 2)}\n\n`;
    
    fs.appendFileSync(logFile, logEntry);
    console.log(`Log guardado en ${logFile}`);
  } catch (error) {
    console.error('Error al escribir log:', error);
  }
};

// --- Funciones de Nodemailer y Fallbacks Comentadas ---
/*
const createTransporter = () => {
  // ... (código de Nodemailer) ...
};

const sendEmailViaSMTP2GO = async (mailOptions) => {
  // ... (código SMTP2GO) ...
};

const sendEmailViaExternalService = async (mailOptions) => {
  // ... (código FormSubmit) ...
};

const sendEmailWithFallbacks = async (mailOptions) => {
  // ... (código de fallbacks) ...
};
*/

// Función para enviar correo de prueba (actualizar para usar SendGrid)
export const testEmail = async (req, res) => {
  try {
    const msg = {
      to: 'ignaciodalesio1995@gmail.com', // Cambiar si es necesario
      // ¡Importante! SendGrid requiere un remitente verificado.
      // Usa un email de un dominio que hayas verificado en SendGrid.
      from: process.env.SENDGRID_VERIFIED_SENDER || 'test@yourverifieddomain.com', 
      subject: 'Correo de prueba SendGrid - ' + new Date().toISOString(),
      text: 'Este es un correo de prueba enviado desde la API de Goza Madrid usando SendGrid.',
      html: `<h1>Correo de prueba SendGrid</h1><p>Fecha: ${new Date().toLocaleString()}</p>`,
    };

    console.log('Enviando correo de prueba SendGrid:', msg.subject);
    const response = await sgMail.send(msg);
    console.log('Correo de prueba SendGrid enviado:', response[0].statusCode, response[0].headers);
    logToFile('Correo prueba SendGrid enviado', { response });

    return res.status(200).json({
      success: true,
      message: 'Correo de prueba SendGrid enviado correctamente',
      data: { statusCode: response[0].statusCode }
    });

  } catch (error) {
    console.error('Error al enviar correo de prueba SendGrid:', error);
    if (error.response) {
      console.error('SendGrid Error Body:', error.response.body)
    }
    logToFile('Error prueba SendGrid', { error: error.message, responseBody: error.response?.body });
    return res.status(500).json({
      success: false,
      message: 'Error al enviar correo de prueba SendGrid',
      error: error.message
    });
  }
};

// --- Función Principal sendContactEmail (Actualizada para SendGrid) ---
export const sendContactEmail = async (req, res) => {
  let adminSendSuccess = false; // Para rastrear el resultado del envío al admin
  const { nombre, email, asunto, telefono, prefix, mensaje } = req.body;

  // **¡IMPORTANTE! Define tu remitente verificado en SendGrid**
  const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER; 
  if (!verifiedSender) {
      console.error("Error: Falta la variable de entorno SENDGRID_VERIFIED_SENDER.");
      // No podemos enviar sin un remitente verificado
      return res.status(500).json({ success: false, message: 'Error de configuración del servidor (email).', });
  }

  try {
    console.log('Recibida solicitud de contacto:', req.body);
    logToFile('Recibida solicitud de contacto', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });

    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre y email son obligatorios'
      });
    }

    const telefonoCompleto = telefono ? `${prefix || '+34'} ${telefono}` : 'No proporcionado';

    // --- Notificación ADMIN --- 
    const destinatarioPrincipal = process.env.EMAIL_RECIPIENT || 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
    // SendGrid maneja múltiples destinatarios en el campo 'to' como un array o string separado por comas.
    // No necesita CC explícito si todos son destinatarios principales.
    const adminRecipients = destinatarioPrincipal.split(',').map(e => e.trim()).filter(e => e);
     if (!adminRecipients.includes('ignaciodalesio1995@gmail.com')) {
         adminRecipients.push('ignaciodalesiolopez@gmail.com'); // Asegurar que Nacho reciba
     }

    const adminMsg = {
      to: adminRecipients, 
      from: { 
          email: verifiedSender, 
          name: "Goza Madrid Web" 
      },
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      text: `
Nuevo mensaje de contacto

Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefonoCompleto}
Mensaje: ${mensaje || asunto || 'No proporcionado'}
      `,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefonoCompleto}</p>
        <p><strong>Mensaje:</strong> ${mensaje || asunto || 'No proporcionado'}</p>
      `
    };

    console.log('Preparando correo ADMIN SendGrid:', { to: adminMsg.to, from: adminMsg.from, subject: adminMsg.subject });
    logToFile('Opciones correo ADMIN SendGrid', adminMsg);

    try {
      const response = await sgMail.send(adminMsg);
      console.log('Correo ADMIN SendGrid enviado:', response[0].statusCode, response[0].headers);
      logToFile('Correo ADMIN SendGrid enviado', { response });
      adminSendSuccess = true;
    } catch (adminError) {
      console.error('Error CRÍTICO al enviar correo ADMIN SendGrid:', adminError);
      if (adminError.response) {
        console.error('SendGrid Error Body:', adminError.response.body);
      }
      logToFile('Error CRÍTICO correo ADMIN SendGrid', { error: adminError.message, responseBody: adminError.response?.body });
      // Continuar para intentar enviar confirmación al cliente
    }

    // --- Confirmación CLIENTE --- 
    if (email && /\S+@\S+\.\S+/.test(email)) {
      const clientMsg = {
        to: email,
        from: { 
            email: verifiedSender, 
            name: "Goza Madrid" 
        },
        subject: `Hemos recibido tu mensaje - Goza Madrid`,
        text: `Hola ${nombre},\n\nHemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.\n\nGracias por contactar con Goza Madrid.\n\nTu mensaje:\n${mensaje || asunto || 'No proporcionado'}`, 
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Hola ${nombre},</h2>
            <p>Hemos recibido tu mensaje y nuestro equipo se pondrá en contacto contigo lo antes posible.</p>
            <p><strong>Tu mensaje fue:</strong></p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0;">
              <p>${mensaje || asunto || 'No proporcionado'}</p>
            </blockquote>
            <p>Gracias por contactar con <strong>Goza Madrid</strong>.</p>
            <hr>
            <p><small>Este es un mensaje automático, por favor no respondas directamente a este email.</small></p>
          </div>
        `
      };
      
      console.log('Preparando correo CLIENTE SendGrid:', { to: clientMsg.to, from: clientMsg.from, subject: clientMsg.subject });
      logToFile('Opciones correo CLIENTE SendGrid', clientMsg);

      try {
        const response = await sgMail.send(clientMsg);
        console.log('Correo CLIENTE SendGrid enviado:', response[0].statusCode, response[0].headers);
        logToFile('Correo CLIENTE SendGrid enviado', { response });
      } catch (clientError) {
        console.error('Error al enviar correo CLIENTE SendGrid:', clientError);
         if (clientError.response) {
            console.error('SendGrid Error Body:', clientError.response.body);
         }
        logToFile('Error correo CLIENTE SendGrid', { to: email, error: clientError.message, responseBody: clientError.response?.body });
      }
    } else {
      console.warn('No se envió correo de confirmación: email de cliente no válido o no proporcionado.');
      logToFile('Correo CLIENTE no enviado', { reason: 'Email inválido o no proporcionado', clientEmail: email });
    }

    // --- Respuesta final al Frontend --- 
    if (!adminSendSuccess) { // Si el envío al admin falló
      return res.status(500).json({
        success: false,
        message: 'Error interno al procesar el formulario. Por favor, inténtalo más tarde.',
        error: process.env.NODE_ENV === 'development' ? 'Failed to send admin notification' : undefined
      });
    }
    // Si el envío al admin tuvo éxito (SendGrid devolvió 2xx)
    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: { 
         adminMessageId: response[0].headers['x-message-id']
      }
    });

  } catch (error) {
    // Este catch ahora solo cubriría errores MUY tempranos (ej. JSON mal formado)
    console.error('Error MUY TEMPRANO al procesar solicitud de contacto:', error);
    logToFile('Error MUY TEMPRANO en /api/contact', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 