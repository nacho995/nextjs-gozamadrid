import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import PropertyVisit from '../models/PropertyVisit.js';

dotenv.config();

// Configurar SendGrid API Key (Asegúrate que esté definida en el entorno)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[PropertyVisit] SendGrid API Key configurada.');
} else {
  console.error('[PropertyVisit] ¡ERROR CRÍTICO! Falta SENDGRID_API_KEY.');
}

// Función auxiliar para parsear fechas de manera segura
const safeParseDate = (dateInput) => {
  try {
    if (!dateInput) return new Date();
    
    // Si ya es un objeto Date, devolverlo
    if (dateInput instanceof Date && !isNaN(dateInput)) return dateInput;
    
    // Intentar convertir string a Date
    const parsedDate = new Date(dateInput);
    
    // Verificar si la fecha es válida
    if (parsedDate instanceof Date && !isNaN(parsedDate)) {
      return parsedDate;
    }
    
    // Si no es válida, devolver la fecha actual
    return new Date();
  } catch (error) {
    console.error('Error al parsear fecha:', error);
    return new Date();
  }
};

// Función para escribir logs (puedes reutilizar la de contactController o definirla aquí)
const logToFile = (message, data) => { 
    // Implementa o importa la lógica de logging si la necesitas aquí 
    console.log(`[PropertyVisit Log] ${message}`, data); 
};

// Función para enviar notificación de visita de propiedad
export const sendPropertyNotification = async (req, res) => {
  let savedVisit = null;
  let emailSent = false;
  
  // **¡IMPORTANTE! Remitente verificado de SendGrid**
  const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
  if (!verifiedSender) {
      console.error("[PropertyVisit] Error: Falta SENDGRID_VERIFIED_SENDER.");
      // Considera devolver un error 500 aquí si el email es crítico
  }

  try {
    console.log('[PropertyVisit] Recibida solicitud:', req.body);
    const { property, propertyAddress, date, time, name, email, phone, message } = req.body;
    
    if (!property || !email || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la visita'
      });
    }
    
    // Guardar visita en DB (se mantiene igual)
    try {
      const newVisit = new PropertyVisit({
        property,
        propertyAddress,
        date: safeParseDate(date),
        time: safeParseDate(time),
        name,
        email,
        phone,
        message: message || '',
        status: 'pending'
      });
      savedVisit = await newVisit.save();
      console.log('[PropertyVisit] Visita guardada DB:', savedVisit._id);
    } catch (dbError) {
      console.error('[PropertyVisit] Error guardando visita DB:', dbError);
      logToFile('Error DB guardando visita', { error: dbError.message });
      // Continuamos para intentar enviar email
    }
    
    // Enviar email con SendGrid
    try {
        if (!verifiedSender) throw new Error('Remitente SendGrid no configurado.');

        // Parsear fechas dentro del try-catch para capturar errores
        const parsedDate = safeParseDate(date);
        const parsedTime = safeParseDate(time);
        
        // Verificar que las fechas se parsearon correctamente
        if (!parsedDate || !parsedTime) {
            throw new Error('Error al parsear fecha o hora');
        }
        
        const formattedDate = parsedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = parsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const recipientString = process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com';
        const adminRecipients = recipientString.split(',').map(e => e.trim()).filter(e => e);
        if (!adminRecipients.includes('ignaciodalesio1995@gmail.com')) {
             adminRecipients.push('ignaciodalesiolopez@gmail.com');
        }

        // **PLANTILLA HTML ELEGANTE PARA VISITA**
        const visitHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Solicitud de Visita - Goza Madrid</title>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #e9e9e9; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; height: 100% !important; width: 100% !important;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
<tr>
<td align="center" style="padding: 40px 0 !important;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important; max-width: 680px;">
<!-- HEADER -->
<tr>
<td align="center" style="background-color: #1a1a1a; padding: 30px 20px; border-top-left-radius: 12px; border-top-right-radius: 12px; border-bottom: 5px solid #C7A336;">
<h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: 1px;">GOZA MADRID</h1>
<p style="font-size: 16px; color: #cccccc; margin: 5px 0 0 0;">Nueva Solicitud de Visita</p>
</td>
</tr>
<!-- CUERPO -->
<tr>
<td align="center" style="background-color: #ffffff; padding: 40px 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse !important;">
<!-- SECCIÓN: DETALLES VISITA -->
<tr>
<td align="left" style="padding-bottom: 30px;">
<h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">DETALLES DE LA VISITA SOLICITADA</h2>
<table border="0" cellpadding="5" cellspacing="0" width="100%" style="font-size: 15px; color: #333333;">
<tr>
<td width="130" style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Propiedad:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;">${propertyAddress || 'No especificada'} (<a href="${property ? 'https://www.realestategozamadrid.com/property/' + property : '#'}" target="_blank" style="color: #C7A336; text-decoration: none;">ID: ${property || 'N/A'}</a>)</td>
</tr>
<tr>
<td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Fecha Sugerida:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;">${parsedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
</tr>
<tr>
<td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Hora Sugerida:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;">${parsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
</tr>
</table>
</td>
</tr>
<!-- SECCIÓN: DATOS CLIENTE -->
<tr>
<td align="left" style="padding-bottom: 30px;">
<h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">DATOS DEL SOLICITANTE</h2>
<table border="0" cellpadding="5" cellspacing="0" width="100%" style="font-size: 15px; color: #333333;">
<tr>
<td width="130" style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Nombre:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;">${name}</td>
</tr>
<tr>
<td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Email:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;"><a href="mailto:${email}" style="color: #C7A336; text-decoration: none; font-weight: bold;">${email}</a></td>
</tr>
<tr>
<td style="padding: 0 0 15px 0; font-weight: bold; color: #555; padding-right: 15px; vertical-align: top;">Teléfono:</td>
<td style="padding: 0 0 15px 0; vertical-align: top;">${phone}</td>
</tr>
</table>
</td>
</tr>
<!-- SECCIÓN: MENSAJE ADICIONAL -->
<tr>
<td align="left">
<h2 style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin: 0 0 20px 0; border-bottom: 1px solid #dddddd; padding-bottom: 10px;">MENSAJE ADICIONAL</h2>
<div style="background-color: #f9f9f9; border: 1px solid #eeeeee; border-left: 4px solid #C7A336; padding: 20px; border-radius: 5px; font-size: 15px; line-height: 1.7; white-space: pre-wrap; min-height: 50px;">
${message || 'Sin mensaje adicional.'}
</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
        `;
        
        const adminVisitMsg = {
            to: adminRecipients,
            from: { 
                email: verifiedSender, 
                name: "Goza Madrid - Solicitud Visita" 
            },
            subject: `Solicitud de Visita: ${propertyAddress || 'Propiedad sin dirección'} por ${name}`,
            text: `Nueva solicitud de visita:\nPropiedad: ${propertyAddress || 'N/A'} (ID: ${property || 'N/A'})\nFecha: ${parsedDate.toLocaleDateString('es-ES')}\nHora: ${parsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nMensaje: ${message || 'No'}\nID Visita DB: ${savedVisit ? savedVisit._id : 'N/A'}`,
            html: visitHtml
        };

        console.log('[PropertyVisit] Preparando email notificación ADMIN...');
        const response = await sgMail.send(adminVisitMsg);
        emailSent = true;
        console.log('[PropertyVisit] Email notificación ADMIN enviado:', response[0].statusCode);
        logToFile('Email visita ADMIN enviado', { to: adminRecipients, subject: adminVisitMsg.subject, response });

    } catch (emailError) {
      console.error('[PropertyVisit] Error enviando email:', emailError);
      if (emailError.response) {
        console.error('[PropertyVisit] SendGrid Error Body:', emailError.response.body);
      }
      logToFile('Error enviando email visita', { error: emailError.message, responseBody: emailError.response?.body });
      
      // Fallback nodemailer para admin
      console.log('[PropertyVisit] Intentando fallback nodemailer para admin...');
      try {
        const fallbackRecipientString = process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com';
        const fallbackAdminRecipients = fallbackRecipientString.split(',').map(e => e.trim()).filter(e => e);
        if (!fallbackAdminRecipients.includes('ignaciodalesio1995@gmail.com')) {
             fallbackAdminRecipients.push('ignaciodalesiolopez@gmail.com');
        }
        
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
            pass: process.env.GMAIL_PASS
          }
        });

        // Redefinir parsedDate para el fallback
        const fallbackParsedDate = date || 'Fecha no especificada';
        
        const fallbackMsg = {
          from: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
          to: fallbackAdminRecipients.join(','),
          subject: `Nueva Visita: ${propertyAddress || 'propiedad sin dirección'} - ${fallbackParsedDate} a las ${time} por ${name}`,
          text: `Nueva solicitud de visita:\nPropiedad: ${propertyAddress || 'N/A'} (ID: ${property || 'N/A'})\nFecha: ${fallbackParsedDate}\nHora: ${time}\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nMensaje: ${message || 'No'}\nID Visita DB: ${savedVisit ? savedVisit._id : 'N/A'}`
        };

        await transporter.sendMail(fallbackMsg);
        console.log('[PropertyVisit] Email admin enviado via fallback nodemailer');
        emailSent = true;
      } catch (fallbackError) {
        console.error('[PropertyVisit] Error en fallback nodemailer admin:', fallbackError);
        emailSent = false;
      }
    }
    
    // --- Envío de Confirmación al Cliente --- 
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // Asegurar que parsedDate y parsedTime estén disponibles aquí también
      const clientParsedDate = safeParseDate(date);
      const clientParsedTime = safeParseDate(time);
      
      const clientVisitHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Solicitud de Visita Recibida - Goza Madrid</title>
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
              <p style="font-size: 16px; color: #888888; margin: 5px 0 0 0;">Confirmación de Solicitud de Visita</p>
            </td>
          </tr>
          <!-- CUERPO DEL MENSAJE -->
          <tr>
            <td align="left" style="padding: 35px 40px; font-size: 16px; line-height: 1.8;">
              <p style="margin: 0 0 25px 0;">Estimado/a ${name},</p>
              <p style="margin: 0 0 25px 0;">Hemos recibido correctamente su solicitud para visitar la propiedad ubicada en <strong>${propertyAddress || 'Dirección no especificada'}</strong>.</p>
              <p style="margin: 0 0 25px 0;">Nos pondremos en contacto con usted a la brevedad posible para confirmar los detalles de la visita, utilizando la información proporcionada:</p>
              <blockquote style="margin: 0 0 25px 20px; padding: 15px; border-left: 3px solid #C7A336; background-color: #f9f9f9; font-size: 15px; color: #555;">
                <strong>Email:</strong> ${email}<br>
                <strong>Teléfono:</strong> ${phone}<br>
                <strong>Fecha/Hora Sugerida:</strong> ${clientParsedDate.toLocaleDateString('es-ES')} ${clientParsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </blockquote>
              <p style="margin: 0 0 25px 0;">Si necesita realizar alguna modificación o tiene alguna consulta adicional, no dude en contactarnos.</p>
              <p style="margin: 0;">Agradecemos su interés en nuestras propiedades.</p>
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

      const clientVisitMsg = {
        to: email,
        from: { email: verifiedSender, name: "Goza Madrid" }, 
        subject: `Confirmación: Solicitud de visita para ${propertyAddress || 'propiedad'} - Goza Madrid`,
        text: `Estimado/a ${name},\n\nGracias por solicitar una visita con Goza Madrid para la propiedad en ${propertyAddress || 'N/A'}. Hemos recibido tu solicitud y nos pondremos en contacto pronto para confirmar los detalles.\n\nFecha Sugerida: ${clientParsedDate.toLocaleDateString('es-ES')} ${clientParsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n\nSaludos,\nEl equipo de Goza Madrid`,
        html: clientVisitHtml
      };

      try {
        console.log('[PropertyVisit] Preparando email confirmación CLIENTE...');
        logToFile('Preparando email visita CLIENTE', { to: clientVisitMsg.to, subject: clientVisitMsg.subject });
        const clientResponse = await sgMail.send(clientVisitMsg);
        console.log('[PropertyVisit] Email confirmación CLIENTE enviado:', clientResponse[0].statusCode);
        logToFile('Email visita CLIENTE enviado', { response: clientResponse });
      } catch (clientError) {
        console.error('[PropertyVisit] Error enviando email confirmación CLIENTE:', clientError);
        if (clientError.response) {
          console.error('[PropertyVisit] SendGrid Error Body (Cliente):', clientError.response.body);
        }
        logToFile('Error email visita CLIENTE', { error: clientError.message, responseBody: clientError.response?.body });
        
        // Fallback nodemailer para email de confirmación cliente
        console.log('[PropertyVisit] Intentando fallback nodemailer para cliente...');
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.default.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
              pass: process.env.GMAIL_PASS
            }
          });

          const fallbackClientMsg = {
            from: process.env.GMAIL_USER || 'gozamadrid@gmail.com',
            to: email,
            subject: `Confirmación: Solicitud de visita para ${propertyAddress || 'propiedad'} - Goza Madrid`,
            text: `Estimado/a ${name},\n\nGracias por solicitar una visita con Goza Madrid para la propiedad en ${propertyAddress || 'N/A'}. Hemos recibido tu solicitud y nos pondremos en contacto pronto para confirmar los detalles.\n\nFecha Sugerida: ${clientParsedDate.toLocaleDateString('es-ES')} ${clientParsedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n\nSaludos,\nEl equipo de Goza Madrid`
          };

          await transporter.sendMail(fallbackClientMsg);
          console.log('[PropertyVisit] Email cliente enviado via fallback nodemailer');
        } catch (fallbackClientError) {
          console.error('[PropertyVisit] Error en fallback nodemailer cliente:', fallbackClientError);
        }
      }
    } else {
       console.warn('[PropertyVisit] No se envió confirmación al cliente: Email inválido o no proporcionado.');
      logToFile('Confirmación visita cliente omitida', { reason: 'Email inválido o no proporcionado', email });
    }

    // Respuesta final al frontend (basada en el éxito del envío ADMIN)
    return res.status(emailSent ? 200 : 500).json({
      success: emailSent,
      message: emailSent ? 'Solicitud de visita procesada' : 'Error al procesar la solicitud de visita',
      data: { 
        visitId: savedVisit ? savedVisit._id : null,
        emailSent: emailSent // Indica si el correo principal (admin) se envió
      }
    });
    
  } catch (error) {
    console.error('[PropertyVisit] Error general procesando visita:', error);
    logToFile('Error general visita', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de visita',
      error: error.message
    });
  }
}; 