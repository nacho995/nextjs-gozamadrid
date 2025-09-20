import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PropertyOffer from '../models/PropertyOffer.js';

dotenv.config();

// Configurar SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[PropertyOffer] SendGrid API Key configurada.');
} else {
  console.error('[PropertyOffer] ¡ERROR CRÍTICO! Falta SENDGRID_API_KEY.');
}

// Para obtener la ruta absoluta
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Función para escribir logs
const logToFile = (message, data) => {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'offer-logs.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}: ${JSON.stringify(data, null, 2)}\n\n`;
    
    fs.appendFileSync(logFile, logEntry);
    console.log(`Log guardado en ${logFile}`);
  } catch (error) {
    console.error('Error al escribir log:', error);
  }
};

// Función para enviar notificación de oferta de propiedad
export const sendPropertyOfferNotification = async (req, res) => {
  let savedOffer = null;
  let emailSent = false;
  
  // **¡IMPORTANTE! Remitente verificado de SendGrid**
  const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
  if (!verifiedSender) {
      console.error("[PropertyOffer] Error: Falta SENDGRID_VERIFIED_SENDER.");
      logToFile('Error Configuración: Falta SENDGRID_VERIFIED_SENDER', {});
      // Considera devolver un error 500 aquí si el email es crítico
  }

  try {
    console.log('[PropertyOffer] Recibida solicitud de oferta:', req.body);
    logToFile('Recibida solicitud de oferta', req.body);
    
    // Validar datos requeridos
    const { property, propertyAddress, offerPrice, offerPercentage, name, email, phone, message, ccEmail } = req.body;
    
    if (!property || !email || !name || !phone || !offerPrice) {
      logToFile('Error Validación: Faltan datos requeridos', req.body);
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la oferta'
      });
    }
    
    try {
      // Crear nueva oferta en la base de datos
      const newOffer = new PropertyOffer({
        property,
        propertyAddress,
        offerPrice,
        offerPercentage,
        name,
        email,
        phone,
        message: message || '',
        status: 'pending'
      });
      
      // Guardar la oferta en la base de datos
      savedOffer = await newOffer.save();
      console.log('[PropertyOffer] Oferta guardada DB:', savedOffer._id);
      logToFile('Oferta guardada en DB', { offerId: savedOffer._id });
    } catch (dbError) {
      console.error('[PropertyOffer] Error guardando oferta DB:', dbError);
      logToFile('Error DB guardando oferta', { error: dbError.message, stack: dbError.stack });
      // No salimos de la función, continuamos para intentar enviar el correo
    }
    
    // Enviar email con SendGrid
    try {
      if (!verifiedSender) throw new Error('Remitente SendGrid no configurado.');

      // Destinatarios Admin
      const recipientString = process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com';
      const adminRecipients = recipientString.split(',').map(e => e.trim()).filter(e => e);
      if (!adminRecipients.includes('ignaciodalesio1995@gmail.com')) {
           adminRecipients.push('ignaciodalesiolopez@gmail.com');
      }
      
      // Formatear el precio para el correo
      const formattedOfferPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(offerPrice);
      
      // Log para debug
      console.log('[PropertyOffer] formattedOfferPrice:', formattedOfferPrice);

      // **PLANTILLA HTML ELEGANTE PARA OFERTA**
      const offerHtml = `
<!DOCTYPE html> <html lang="es"> <head> <meta charset="UTF-8"> <title>Nueva Oferta Recibida - Goza Madrid</title> </head> <body style="margin: 0 !important; padding: 0 !important; background-color: #e9e9e9; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; height: 100% !important; width: 100% !important;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;"> <tr> <td align="center" style="padding: 40px 0 !important;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important; max-width: 680px;"> <!-- HEADER --> <tr> <td align="center" style="background-color: #1a1a1a; padding: 30px 20px; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 5px solid #C7A336;"> <h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: 1px;">GOZA MADRID</h1> <p style="font-size: 16px; color: #cccccc; margin: 5px 0 0 0;">Nueva Oferta Recibida</p> </td> </tr> <!-- CUERPO --> <tr> <td align="center" style="background-color: #ffffff; padding: 40px 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;"> <!-- SECCIÓN: DETALLES OFERTA --> <tr> <td align="left" style="padding-bottom: 30px;"> <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">DETALLES DE LA OFERTA</h2> <table border="0" cellpadding="5" cellspacing="0" width="100%" style="font-size: 15px; color: #333333;"> <tr> <td width="150" style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Propiedad:</td> <td style="padding: 0 0 15px 0; vertical-align: top;">${propertyAddress || 'No especificada'} (<a href="${property ? 'https://www.realestategozamadrid.com/property/' + property : '#'}" target="_blank" style="color: #C7A336; text-decoration: none;">ID: ${property || 'N/A'}</a>)</td> </tr> <tr> <td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Precio Ofertado:</td> <td style="padding: 0 0 15px 0; vertical-align: top; font-weight: bold; font-size: 16px;">${formattedOfferPrice}</td> </tr> ${offerPercentage ? `<tr> <td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Porcentaje Oferta:</td> <td style="padding: 0 0 15px 0; vertical-align: top;">${offerPercentage}%</td> </tr>` : ''} </table> </td> </tr> <!-- SECCIÓN: DATOS CLIENTE --> <tr> <td align="left" style="padding-bottom: 30px;"> <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">DATOS DEL OFERTANTE</h2> <table border="0" cellpadding="5" cellspacing="0" width="100%" style="font-size: 15px; color: #333333;"> <tr> <td width="130" style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Nombre:</td> <td style="padding: 0 0 15px 0; vertical-align: top;">${name}</td> </tr> <tr> <td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Email:</td> <td style="padding: 0 0 15px 0; vertical-align: top;"><a href="mailto:${email}" style="color: #C7A336; text-decoration: none; font-weight: bold;">${email}</a></td> </tr> <tr> <td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Teléfono:</td> <td style="padding: 0 0 15px 0; vertical-align: top;">${phone}</td> </tr> </table> </td> </tr> <!-- SECCIÓN: MENSAJE ADICIONAL --> <tr> <td align="left"> <h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">MENSAJE ADICIONAL</h2> <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; border-left: 4px solid #C7A336; padding: 20px; border-radius: 5px; font-size: 15px; line-height: 1.7; white-space: pre-wrap; min-height: 50px;"> ${message || 'Sin mensaje adicional.'} </div> </td> </tr> </table> </td> </tr> </table> </body> </html>
      `;
      
      // Configurar el mensaje para SendGrid
      const adminOfferMsg = {
        to: adminRecipients,
        from: {
          email: verifiedSender,
          name: "Goza Madrid - Nueva Oferta"
        },
        subject: `Nueva Oferta: ${formattedOfferPrice} para ${propertyAddress || 'propiedad sin dirección'} por ${name}`,
        text: `Nueva oferta recibida:\nPropiedad: ${propertyAddress || 'N/A'} (ID: ${property || 'N/A'})\nPrecio Ofertado: ${formattedOfferPrice}\nPorcentaje: ${offerPercentage ? offerPercentage + '%' : 'N/A'}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nMensaje: ${message || 'No'}\nID Oferta DB: ${savedOffer ? savedOffer._id : 'N/A'}`,
        html: offerHtml
      };

      console.log('[PropertyOffer] Preparando email notificación ADMIN...');
      logToFile('Preparando email oferta ADMIN', { to: adminRecipients, subject: adminOfferMsg.subject });

      const response = await sgMail.send(adminOfferMsg);
      emailSent = true;
      console.log('[PropertyOffer] Email notificación ADMIN enviado:', response[0].statusCode);
      logToFile('Email oferta ADMIN enviado', { response });

    } catch (emailError) {
      console.error('[PropertyOffer] Error enviando email:', emailError);
      if (emailError.response) {
        console.error('[PropertyOffer] SendGrid Error Body:', emailError.response.body);
      }
      logToFile('Error enviando email', { error: emailError.message, stack: emailError.stack });
      
      // Si es un error de SendGrid, mostrar detalles adicionales
      if (emailError.response && emailError.response.body) {
        console.log('[PropertyOffer] SendGrid Error Body:', emailError.response.body);
        logToFile('SendGrid Error Body', emailError.response.body);
      }
      
      // Si SendGrid falló, usar fallback con nodemailer
      console.log('[PropertyOffer] Intentando fallback con nodemailer...');
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
            pass: process.env.GMAIL_PASS
          }
        });

        const fallbackMsg = {
          from: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
          to: adminRecipients.join(','),
          subject: `Nueva Oferta: ${formattedOfferPrice} para ${propertyAddress || 'propiedad sin dirección'} por ${name}`,
          text: `Nueva oferta recibida:\nPropiedad: ${propertyAddress || 'N/A'} (ID: ${property || 'N/A'})\nPrecio Ofertado: ${formattedOfferPrice}\nPorcentaje: ${offerPercentage ? offerPercentage + '%' : 'N/A'}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nMensaje: ${message || 'No'}\nID Oferta DB: ${savedOffer ? savedOffer._id : 'N/A'}`
        };

        await transporter.sendMail(fallbackMsg);
        console.log('[PropertyOffer] Email enviado via fallback nodemailer');
        emailSent = true;
      } catch (fallbackError) {
        console.error('[PropertyOffer] Error en fallback nodemailer:', fallbackError);
        emailSent = false;
      }
    }
    
    // --- Envío de Confirmación al Cliente --- 
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // Asegurar que formattedOfferPrice esté disponible aquí también
      const clientFormattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(offerPrice);
      
      const clientOfferHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Oferta Recibida - Goza Madrid</title>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f5f5f5; font-family: 'Garamond', 'Times New Roman', Times, serif; height: 100% !important; width: 100% !important; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
    <tr>
      <td align="center" style="padding: 30px 10px !important;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important; max-width: 650px; background-color: #ffffff; border: 1px solid #dddddd; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
          <!-- HEADER LOGO Y TÍTULO -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #eeeeee;">
              <h1 style="font-size: 28px; font-weight: normal; color: #1a1a1a; margin: 0;">Goza Madrid</h1>
              <p style="font-size: 16px; color: #888888; margin: 5px 0 0 0;">Confirmación de Envío de Oferta</p>
            </td>
          </tr>
          <!-- CUERPO DEL MENSAJE -->
          <tr>
            <td align="left" style="padding: 35px 40px; font-size: 16px; line-height: 1.8;">
              <p style="margin: 0 0 25px 0;">Estimado/a ${name},</p>
              <p style="margin: 0 0 25px 0;">Hemos recibido correctamente su oferta para la propiedad ubicada en <strong>${propertyAddress || 'Dirección no especificada'}</strong> por un importe de <strong>${clientFormattedPrice}</strong>.</p>
              <p style="margin: 0 0 25px 0;">Su oferta está siendo procesada y nuestro equipo se pondrá en contacto con usted a la brevedad para informarle sobre los siguientes pasos, utilizando la información proporcionada:</p>
              <blockquote style="margin: 0 0 25px 20px; padding: 15px; border-left: 3px solid #C7A336; background-color: #f9f9f9; font-size: 15px; color: #555;">
                <strong>Email:</strong> ${email}<br>
                <strong>Teléfono:</strong> ${phone}
              </blockquote>
              <p style="margin: 0 0 25px 0;">Agradecemos su interés y la confianza depositada en Goza Madrid.</p>
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
              <p style="margin: 0; color: #888888; font-size: 12px;">
                Este es un mensaje automático. Por favor, no responda directamente a este correo.<br>
                Goza Madrid | <a href="https://www.realestategozamadrid.com" target="_blank" style="color: #888888; text-decoration: underline;">www.realestategozamadrid.com</a>
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

      const clientOfferMsg = {
        to: email,
        from: { email: verifiedSender, name: "Goza Madrid" }, 
        subject: `Confirmación: Oferta recibida para ${propertyAddress || 'propiedad'} - Goza Madrid`,
        text: `Estimado/a ${name},\n\nGracias por enviar su oferta (${clientFormattedPrice}) para la propiedad en ${propertyAddress || 'N/A'} a través de Goza Madrid. Hemos recibido su propuesta y nos pondremos en contacto pronto.\n\nSaludos,\nEl equipo de Goza Madrid`,
        html: clientOfferHtml
      };

      try {
        console.log('[PropertyOffer] Preparando email confirmación CLIENTE...');
        logToFile('Preparando email oferta CLIENTE', { to: clientOfferMsg.to, subject: clientOfferMsg.subject });
        const clientResponse = await sgMail.send(clientOfferMsg);
        console.log('[PropertyOffer] Email confirmación CLIENTE enviado:', clientResponse[0].statusCode);
        logToFile('Email oferta CLIENTE enviado', { response: clientResponse });
      } catch (clientError) {
        console.error('[PropertyOffer] Error enviando email confirmación CLIENTE:', clientError);
         if (clientError.response) {
           console.error('[PropertyOffer] SendGrid Error Body (Cliente):', clientError.response.body);
         }
        logToFile('Error email oferta CLIENTE', { error: clientError.message, responseBody: clientError.response?.body });
      }
    } else {
       console.warn('[PropertyOffer] No se envió confirmación al cliente: Email inválido o no proporcionado.');
      logToFile('Confirmación oferta cliente omitida', { reason: 'Email inválido o no proporcionado', email });
    }

    // Respuesta final al cliente (basada en el éxito del envío ADMIN)
    return res.status(emailSent ? 200 : 500).json({
      success: emailSent, 
      message: emailSent ? 'Oferta procesada correctamente' : 'Error al procesar la oferta',
      data: { 
        offerId: savedOffer ? savedOffer._id : null,
        emailSent // Indica si el correo principal (admin) se envió
      }
    });
    
  } catch (error) {
    console.error('[PropertyOffer] Error general procesando oferta:', error);
    logToFile('Error general procesando oferta', { error: error.message, stack: error.stack });
    
    // A pesar del error, devolvemos éxito al cliente
    // para evitar una mala experiencia de usuario
    return res.status(200).json({
      success: true,
      message: 'Oferta recibida correctamente',
      received: {
        property: req.body.property,
        email: req.body.email
      }
    });
  }
}; 