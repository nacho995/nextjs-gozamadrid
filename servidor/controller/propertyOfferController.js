import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PropertyOffer from '../models/PropertyOffer.js';

dotenv.config();

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

// Configuración del transporte de correo
const createTransporter = () => {
  // Usar el usuario y contraseña configurados
  const user = process.env.EMAIL_USER || 'ignaciodalesiolopez@gmail.com';
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || 'tjlt deip zhwe mkzm';
  
  const options = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: user,
      pass: pass
    },
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false // Para evitar errores de certificado
    }
  };
  
  console.log('Configuración de transporte de correo para ofertas:', {
    host: options.host,
    port: options.port,
    secure: options.secure,
    auth: {
      user: options.auth.user,
      pass: '******' // No mostrar contraseña en logs
    }
  });
  
  // Probar configuración directa primero
  try {
    const directTransporter = nodemailer.createTransport(options);
    console.log('Usando configuración de transporte directa para ofertas');
    return directTransporter;
  } catch (error) {
    console.error('Error al crear transporte directo para ofertas, probando con smtpTransport:', error);
    
    // Si falla, intentar con el módulo smtpTransport
    try {
      const smtp = smtpTransport(options);
      console.log('Usando configuración con smtpTransport para ofertas');
      return nodemailer.createTransport(smtp);
    } catch (smtpError) {
      console.error('Error al crear transporte SMTP para ofertas:', smtpError);
      
      // Como último recurso, usar servicio de Gmail directamente
      console.log('Usando configuración de Gmail directamente para ofertas');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass
        },
        debug: true
      });
    }
  }
};

// Función para enviar notificación de oferta de propiedad
export const sendPropertyOfferNotification = async (req, res) => {
  let savedOffer = null;
  let emailSent = false;
  
  try {
    console.log('Recibida solicitud de oferta de propiedad:', req.body);
    logToFile('Recibida solicitud de oferta', req.body);
    
    // Validar datos requeridos
    const { property, propertyAddress, offerPrice, offerPercentage, name, email, phone, message, ccEmail } = req.body;
    
    if (!property || !email || !name || !phone || !offerPrice) {
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
      console.log('Oferta guardada en la base de datos:', savedOffer._id);
      logToFile('Oferta guardada en la base de datos', { offerId: savedOffer._id });
    } catch (dbError) {
      console.error('Error al guardar la oferta en la base de datos:', dbError);
      logToFile('Error al guardar oferta en DB', { error: dbError.message, stack: dbError.stack });
      // No salimos de la función, continuamos para intentar enviar el correo
    }
    
    try {
      // Destinatario principal - usuario original y cualquier destinatario adicional
      const destinatarioPrincipal = process.env.EMAIL_RECIPIENT || 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
      
      // Si se proporcionó un ccEmail, añadirlo como CC
      let cc = [];
      if (ccEmail) {
        cc.push(ccEmail);
        console.log('Añadiendo destinatario CC para oferta:', ccEmail);
      }
      
      // También agregar ignaciodalesio1995@gmail.com si no está ya incluido
      if (!destinatarioPrincipal.includes('ignaciodalesio1995@gmail.com') && !cc.includes('ignaciodalesio1995@gmail.com')) {
        cc.push('ignaciodalesio1995@gmail.com');
        console.log('Añadiendo destinatario CC adicional para oferta: ignaciodalesio1995@gmail.com');
      }
      
      // Configurar el correo
      const mailOptions = {
        from: `"Goza Madrid Web" <${process.env.EMAIL_USER || 'ignaciodalesiolopez@gmail.com'}>`,
        to: destinatarioPrincipal,
        cc: cc.length > 0 ? cc.join(',') : undefined,
        subject: `Nueva oferta para propiedad: ${propertyAddress}`,
        text: `
Nueva oferta de propiedad

Propiedad: ${propertyAddress}
Precio ofertado: ${offerPrice}€
Porcentaje de oferta: ${offerPercentage || 'No especificado'}
Nombre: ${name}
Email: ${email}
Teléfono: ${phone}
Mensaje: ${message || 'No proporcionado'}
ID de oferta: ${savedOffer ? savedOffer._id : 'No disponible'}
        `,
        html: `
          <h1>Nueva oferta de propiedad</h1>
          <p><strong>Propiedad:</strong> ${propertyAddress}</p>
          <p><strong>Precio ofertado:</strong> ${offerPrice}€</p>
          <p><strong>Porcentaje de oferta:</strong> ${offerPercentage || 'No especificado'}</p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Mensaje:</strong> ${message || 'No proporcionado'}</p>
          <p>ID de oferta: ${savedOffer ? savedOffer._id : 'No disponible'}</p>
        `
      };
      
      // Log detallado de las opciones de correo
      console.log('Enviando correo de oferta con opciones:', {
        from: mailOptions.from,
        to: mailOptions.to,
        cc: mailOptions.cc,
        subject: mailOptions.subject
      });
      logToFile('Opciones de correo de oferta configuradas', mailOptions);
      
      // Crear transportador y enviar correo
      const transporter = createTransporter();
      
      if (!transporter) {
        throw new Error('No se pudo crear el transportador de correo para ofertas');
      }
      
      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log('Correo de oferta enviado:', info.messageId);
      logToFile('Correo de oferta enviado con éxito', {
        messageId: info.messageId,
        response: info.response
      });
    } catch (emailError) {
      console.error('Error al enviar el correo de oferta:', emailError);
      logToFile('Error al enviar correo de oferta', {
        error: emailError.message,
        stack: emailError.stack
      });
      // No salimos de la función, continuamos para responder al cliente
    }
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Oferta procesada',
      data: { 
        offerId: savedOffer ? savedOffer._id : null,
        emailSent 
      }
    });
    
  } catch (error) {
    console.error('Error al procesar oferta de propiedad:', error);
    logToFile('Error general al procesar oferta', {
      error: error.message,
      stack: error.stack
    });
    
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