import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PropertyVisit from '../models/PropertyVisit.js';

dotenv.config();

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

// Función para crear un transportador de correo con manejo de errores
const createTransporter = () => {
  try {
    // Valores por defecto seguros
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
      }
    };
    
    console.log('Configuración de correo:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user ? 'Configurado' : 'No configurado',
      pass: emailConfig.auth.pass ? 'Configurado' : 'No configurado'
    });
    
    return nodemailer.createTransport(emailConfig);
  } catch (error) {
    console.error('Error al crear transportador de correo:', error);
    return null;
  }
};

// Función para enviar notificación de visita de propiedad
export const sendPropertyNotification = async (req, res) => {
  let savedVisit = null;
  let emailSent = false;
  
  try {
    console.log('Recibida solicitud de visita de propiedad:', req.body);
    
    // Validar datos requeridos
    const { property, propertyAddress, date, time, name, email, phone, message, ccEmail } = req.body;
    
    if (!property || !email || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la visita'
      });
    }
    
    try {
      // Crear nueva visita en la base de datos con manejo seguro de fechas
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
      
      // Guardar la visita en la base de datos
      savedVisit = await newVisit.save();
      console.log('Visita guardada en la base de datos:', savedVisit._id);
    } catch (dbError) {
      console.error('Error al guardar la visita en la base de datos:', dbError);
      // No salimos de la función, continuamos para intentar enviar el correo
    }
    
    try {
      // Formatear fecha y hora para el correo
      const formattedDate = safeParseDate(date).toLocaleDateString('es-ES');
      const formattedTime = safeParseDate(time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      // Destinatario por defecto si no está configurado
      const defaultRecipient = 'marta@gozamadrid.com';
      const recipient = process.env.EMAIL_RECIPIENT || process.env.EMAIL_TO || defaultRecipient;
      
      // Si se proporcionó un ccEmail, añadirlo como CC
      let cc = [];
      if (ccEmail) {
        cc.push(ccEmail);
        console.log('Añadiendo destinatario CC:', ccEmail);
      }
      
      // También agregar ignaciodalesio1995@gmail.com si no está ya incluido
      if (!cc.includes('ignaciodalesio1995@gmail.com')) {
        cc.push('ignaciodalesio1995@gmail.com');
        console.log('Añadiendo destinatario CC adicional: ignaciodalesio1995@gmail.com');
      }
      
      // Configurar el correo
      const mailOptions = {
        from: `"Goza Madrid Web" <${process.env.EMAIL_USER || 'notificaciones@gozamadrid.com'}>`,
        to: recipient,
        cc: cc.length > 0 ? cc.join(',') : undefined,
        subject: `Nueva solicitud de visita para: ${propertyAddress}`,
        html: `
          <h1>Nueva solicitud de visita</h1>
          <p><strong>Propiedad:</strong> ${propertyAddress}</p>
          <p><strong>Fecha solicitada:</strong> ${formattedDate}</p>
          <p><strong>Hora solicitada:</strong> ${formattedTime}</p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Mensaje:</strong> ${message || 'No proporcionado'}</p>
          <p>ID de visita: ${savedVisit ? savedVisit._id : 'No disponible'}</p>
        `
      };
      
      // Crear transportador y enviar el correo
      const transporter = createTransporter();
      
      if (!transporter) {
        throw new Error('No se pudo crear el transportador de correo');
      }
      
      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log('Correo de visita enviado:', info.messageId);
    } catch (emailError) {
      console.error('Error al enviar el correo:', emailError);
      // No salimos de la función, continuamos para responder al cliente
    }
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Solicitud de visita procesada',
      data: { 
        visitId: savedVisit ? savedVisit._id : null,
        emailSent 
      }
    });
    
  } catch (error) {
    console.error('Error al procesar solicitud de visita:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de visita',
      error: error.message
    });
  }
}; 