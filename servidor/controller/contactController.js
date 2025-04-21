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

    // --- Notificación ADMIN --- 
    const adminRecipients = (process.env.EMAIL_RECIPIENT || 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com').split(',').map(e => e.trim()).filter(e => e);
    if (!adminRecipients.includes('ignaciodalesiolopez@gmail.com')) { adminRecipients.push('ignaciodalesiolopez@gmail.com'); }

    const adminHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nuevo Contacto Recibido</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: Georgia, 'Times New Roman', Times, serif;">
<center style="width: 100%; table-layout: fixed; background-color: #f0f0f0; padding-bottom: 60px;">
  <table style="background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 650px; border-spacing: 0; font-size: 16px; color: #1a1a1a; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" width="100%">
    <!-- Header -->
    <tr>
      <td style="background-color: #1a1a1a; padding: 30px 20px; text-align: center;">
        <h1 style="font-size: 28px; color: #C7A336; margin: 0; font-weight: bold; letter-spacing: 1px;">GOZA MADRID</h1>
        <p style="color: #ffffff; font-size: 14px; margin: 5px 0 0 0;">Notificación de Nuevo Contacto</p>
      </td>
    </tr>
    <!-- Contenido -->
    <tr>
      <td style="padding: 40px 50px;">
        <h2 style="font-size: 22px; color: #1a1a1a; margin-top: 0; margin-bottom: 25px; font-weight: bold; border-bottom: 3px solid #C7A336; padding-bottom: 10px;">Información del Contacto</h2>
        <table style="width: 100%; border-spacing: 0;" width="100%">
          <tr>
            <td style="padding: 0 0 18px 0; color: #555555; font-weight: bold; width: 120px; padding-right: 15px; vertical-align: top;">Nombre:</td>
            <td style="padding: 0 0 18px 0; vertical-align: top;">${nombre}</td>
          </tr>
          <tr>
            <td style="padding: 0 0 18px 0; color: #555555; font-weight: bold; width: 120px; padding-right: 15px; vertical-align: top;">Email:</td>
            <td style="padding: 0 0 18px 0; vertical-align: top;"><a href="mailto:${email}" style="color: #C7A336; text-decoration: none; font-weight: bold;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 0 0 18px 0; color: #555555; font-weight: bold; width: 120px; padding-right: 15px; vertical-align: top;">Teléfono:</td>
            <td style="padding: 0 0 18px 0; vertical-align: top;">${telefonoCompleto}</td>
          </tr>
        </table>
        <br>
        <h2 style="font-size: 22px; color: #1a1a1a; margin-top: 0; margin-bottom: 25px; font-weight: bold; border-bottom: 3px solid #C7A336; padding-bottom: 10px;">Mensaje Enviado</h2>
        <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-left: 6px solid #C7A336; padding: 25px; margin-top: 15px; border-radius: 6px; white-space: pre-wrap; font-size: 15px; line-height: 1.7;">
          ${mensaje || asunto || 'No proporcionado'}
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #333333; padding: 20px; text-align: center; font-size: 13px; color: #aaaaaa;">
        Recibido: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
      </td>
    </tr>
  </table>
</center>
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

    // --- Confirmación CLIENTE --- 
    if (email && /\S+@\S+\.\S+/.test(email)) {
      const clientHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmación de Contacto - Goza Madrid</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Georgia, 'Times New Roman', Times, serif;">
<center style="width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 40px;">
  <table style="background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 680px; border-spacing: 0; font-size: 17px; color: #1a1a1a;" width="100%">
    <!-- Borde Dorado Superior -->
    <tr>
      <td style="height: 10px; background-color: #C7A336;"></td>
    </tr>
    <!-- Header -->
    <tr>
      <td style="padding: 40px 0 30px 0; text-align: center;">
        <!-- <img src="URL_LOGO_NEGRO_O_DORADO" alt="Goza Madrid" width="200" style="border:0;"> -->
        <h1 style="font-size: 36px; color: #C7A336; margin: 0; font-weight: bold; letter-spacing: 1px;">Goza Madrid</h1>
      </td>
    </tr>
    <!-- Contenido - Cuerpo de la Carta -->
    <tr>
      <td style="padding: 10px 60px 30px 60px; line-height: 1.7;">
        <p style="margin: 0 0 20px 0;">Estimado/a ${nombre},</p>
        <p style="margin: 0 0 20px 0;">Es un placer confirmar que hemos recibido su mensaje a través de nuestro formulario de contacto. Valoramos sinceramente su interés en Goza Madrid.</p>
        <p style="margin: 0 0 20px 0;">Nuestro equipo de expertos está revisando su consulta y se pondrá en contacto con usted a la mayor brevedad posible para ofrecerle la atención personalizada que merece.</p>
        <div style="border-left: 4px solid #e0e0e0; padding-left: 20px; margin: 30px 0; font-style: italic; color: #555555; font-size: 16px;">
          <p style="margin: 0 0 10px 0;"><em>Para su referencia, el mensaje que nos envió indicaba:</em></p>
          <p style="margin: 0; white-space: pre-wrap;">"${mensaje || asunto || 'No proporcionado'}"</p>
        </div>
        <p style="margin: 0 0 20px 0;">Mientras tanto, le invitamos a explorar más sobre nuestros servicios y propiedades exclusivas en nuestro sitio web.</p>
        <p style="margin: 40px 0 20px 0;">
          Atentamente,<br><br>
          <strong>El Equipo de Goza Madrid</strong><br>
          <a href="https://www.realestategozamadrid.com" style="color: #C7A336; text-decoration: none;">www.realestategozamadrid.com</a>
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #1a1a1a; padding: 25px; text-align: center; font-size: 13px; color: #aaaaaa;">
        Este mensaje se ha enviado automáticamente. Por favor, no responda a este correo.<br>
        &copy; ${new Date().getFullYear()} Goza Madrid. Todos los derechos reservados.
      </td>
    </tr>
  </table>
</center>
</body>
</html>
      `;

      const clientMsg = {
        to: email,
        from: { email: verifiedSender, name: "Goza Madrid" },
        subject: `Hemos recibido tu mensaje - Goza Madrid`,
        text: `Estimado/a ${nombre},\n\nEs un placer confirmar que hemos recibido su mensaje. Valoramos sinceramente su interés en Goza Madrid.\n\nNuestro equipo está revisando su consulta y se pondrá en contacto con usted a la mayor brevedad posible.\n\nSu mensaje: "${mensaje || asunto || 'No proporcionado'}"\n\nAtentamente,\nEl Equipo de Goza Madrid\nwww.realestategozamadrid.com\n\n(Este es un mensaje automático, por favor no responda).`,
        html: clientHtml
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