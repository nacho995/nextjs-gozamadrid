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
  let adminSendSuccess = false;
  const { nombre, email, asunto, telefono, prefix, mensaje } = req.body;
  const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
  if (!verifiedSender) {
    console.error("Error: Falta SENDGRID_VERIFIED_SENDER.");
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

    // --- Notificación ADMIN (Estilo Documento Confidencial) --- 
    const adminRecipients = (process.env.EMAIL_RECIPIENT || 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com').split(',').map(e => e.trim()).filter(e => e);
    if (!adminRecipients.includes('ignaciodalesiolopez@gmail.com')) { adminRecipients.push('ignaciodalesiolopez@gmail.com'); }

    const adminHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ALERTA: Nuevo Prospecto Recibido - Goza Madrid</title>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #e9e9e9; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; height: 100% !important; width: 100% !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
    <tr>
      <td align="center" style="padding: 40px 0 !important;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important; max-width: 680px;">
          <!-- HEADER NEGRO CON DETALLE DORADO -->
          <tr>
            <td align="center" style="background-color: #1a1a1a; padding: 30px 20px; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 5px solid #C7A336;">
              <h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: 1px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">GOZA MADRID</h1>
              <p style="font-size: 16px; color: #cccccc; margin: 5px 0 0 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">Informe de Nuevo Contacto Web</p>
            </td>
          </tr>
          <!-- CUERPO PRINCIPAL - EFECTO PAPEL -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 40px 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
                <!-- SECCIÓN: DETALLES DEL REMITENTE -->
                <tr>
                  <td align="left" style="padding: 0 0 30px 0;">
                    <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding: 0 0 10px 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">DETALLES DEL REMITENTE</h2>
                    <table border="0" cellpadding="5" cellspacing="0" width="100%" style="border-collapse: collapse !important; font-size: 15px; color: #333333;">
                      <tr>
                        <td width="100" style="padding: 0 0 18px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Nombre:</td>
                        <td style="padding: 0 0 18px 0; vertical-align: top;">${nombre}</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 18px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Email:</td>
                        <td style="padding: 0 0 18px 0; vertical-align: top;"><a href="mailto:${email}" style="color: #C7A336; text-decoration: none; font-weight: bold; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">${email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 18px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Teléfono:</td>
                        <td style="padding: 0 0 18px 0; vertical-align: top;">${telefonoCompleto}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- SECCIÓN: MENSAJE -->
                <tr>
                  <td align="left" style="padding: 0;">
                    <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding: 0 0 10px 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">MENSAJE</h2>
                    <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; border-left: 4px solid #C7A336; padding: 20px; border-radius: 5px; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
                      ${mensaje || asunto || 'No proporcionado'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color: #333333; padding: 20px 30px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
              <p style="margin: 0; color: #aaaaaa; font-size: 12px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
                Fecha de Recepción: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}<br>
                Este es un email interno generado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const adminMsg = {
      to: adminRecipients, 
      from: { email: verifiedSender, name: "Goza Madrid Web" },
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      text: `Nuevo mensaje de contacto\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefonoCompleto}\nMensaje: ${mensaje || asunto || 'No proporcionado'}`, 
      html: adminHtml
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

    // --- Confirmación CLIENTE (Estilo Carta Formal) --- 
    if (email && /\S+@\S+\.\S+/.test(email)) {
      const clientHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hemos Recibido su Mensaje - Goza Madrid</title>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f5f5f5; font-family: 'Garamond', 'Times New Roman', Times, serif; height: 100% !important; width: 100% !important; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
    <tr>
      <td align="center" style="padding: 30px 10px !important;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important; max-width: 650px; background-color: #ffffff; border: 1px solid #dddddd; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
          <!-- HEADER LOGO Y TÍTULO -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #eeeeee;">
              <!-- Si tienes un logo URL, puedes ponerlo aquí -->
              <!-- <img src="URL_DEL_LOGO" alt="Goza Madrid Logo" width="150" style="display: block; border: 0; margin-bottom: 20px;"> -->
              <h1 style="font-size: 28px; font-weight: normal; color: #1a1a1a; margin: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">Goza Madrid</h1>
              <p style="font-size: 16px; color: #888888; margin: 5px 0 0 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">Confirmación de Contacto</p>
            </td>
          </tr>
          <!-- CUERPO DEL MENSAJE -->
          <tr>
            <td align="left" style="padding: 35px 40px; font-size: 16px; line-height: 1.8;">
              <p style="margin: 0 0 25px 0;">Estimado/a ${nombre},</p>
              <p style="margin: 0 0 25px 0;">Hemos recibido correctamente su mensaje y le agradecemos sinceramente por ponerse en contacto con Goza Madrid.</p>
              <p style="margin: 0 0 25px 0;">Nuestro equipo revisará su consulta a la brevedad posible y nos comunicaremos con usted utilizando los datos proporcionados:</p>
              <blockquote style="margin: 0 0 25px 20px; padding: 15px; border-left: 3px solid #C7A336; background-color: #f9f9f9; font-size: 15px; color: #555;">
                <strong>Email:</strong> ${email}<br>
                <strong>Teléfono:</strong> ${telefonoCompleto}
              </blockquote>
              <p style="margin: 0 0 25px 0;">Si su consulta requiere una respuesta urgente, no dude en contactarnos directamente por teléfono.</p>
              <p style="margin: 0;">Agradecemos su interés y confianza.</p>
            </td>
          </tr>
          <!-- SECCIÓN DE DESPEDIDA -->
          <tr>
            <td align="left" style="padding: 0px 40px 40px 40px; font-size: 16px; line-height: 1.8;">
              <p style="margin: 0;">Atentamente,</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #1a1a1a;">El Equipo de Goza Madrid</p>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color: #eeeeee; padding: 20px 30px; border-top: 1px solid #dddddd;">
              <p style="margin: 0; color: #888888; font-size: 12px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
                Este es un mensaje automático. Por favor, no responda directamente a este correo.<br>
                Goza Madrid | <a href="https://www.realestategozamadrid.com" target="_blank" style="color: #888888; text-decoration: underline;">www.realestategozamadrid.com</a>
                <!-- Añadir dirección física si se desea -->
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const clientMsg = {
        to: email,
        from: { email: verifiedSender, name: "Goza Madrid" }, // Usar un nombre más genérico
        subject: 'Confirmación: Hemos recibido tu mensaje - Goza Madrid',
        text: `Estimado/a ${nombre},\\n\\nGracias por contactar con Goza Madrid. Hemos recibido tu mensaje y te responderemos pronto.\\n\\nSaludos,\\nEl equipo de Goza Madrid`,
        html: clientHtml
      };

      try {
        console.log('Preparando correo confirmación CLIENTE SendGrid:', { to: clientMsg.to, from: clientMsg.from, subject: clientMsg.subject });
        logToFile('Opciones correo CLIENTE SendGrid', clientMsg);
        const clientResponse = await sgMail.send(clientMsg);
        console.log('Correo confirmación CLIENTE SendGrid enviado:', clientResponse[0].statusCode);
        logToFile('Correo CLIENTE SendGrid enviado', { response: clientResponse });
      } catch (clientError) {
        console.error('Error al enviar correo confirmación CLIENTE SendGrid:', clientError);
         if (clientError.response) {
           console.error('SendGrid Error Body (Cliente):', clientError.response.body);
         }
        logToFile('Error correo CLIENTE SendGrid', { error: clientError.message, responseBody: clientError.response?.body });
        // No consideramos esto un fallo crítico para la respuesta principal
      }
    } else {
      console.warn('No se envió confirmación al cliente: Email inválido o no proporcionado.');
      logToFile('Confirmación cliente omitida', { reason: 'Email inválido o no proporcionado', email });
    }

    // Respuesta final al frontend (basada en el éxito del envío ADMIN)
    return res.status(adminSendSuccess ? 200 : 500).json({
      success: adminSendSuccess,
      message: adminSendSuccess ? 'Mensaje enviado correctamente' : 'Error al procesar el mensaje',
    });

  } catch (error) {
    console.error('Error GENERAL en sendContactEmail:', error);
    logToFile('Error GENERAL sendContactEmail', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el mensaje.'
    });
  }
}; 