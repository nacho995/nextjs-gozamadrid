import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PropertyVisit from '../models/PropertyVisit.js';

dotenv.config();

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar notificación de visita de propiedad
export const sendPropertyNotification = async (req, res) => {
  try {
    console.log('Recibida solicitud de visita de propiedad:', req.body);
    
    // Validar datos requeridos
    const { property, propertyAddress, date, time, name, email, phone, message } = req.body;
    
    if (!property || !email || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la visita'
      });
    }
    
    // Crear nueva visita en la base de datos
    const newVisit = new PropertyVisit({
      property,
      propertyAddress,
      date: date || new Date(),
      time: time || new Date(),
      name,
      email,
      phone,
      message: message || '',
      status: 'pending'
    });
    
    // Guardar la visita en la base de datos
    const savedVisit = await newVisit.save();
    
    // Formatear fecha y hora para el correo
    const formattedDate = new Date(date || new Date()).toLocaleDateString('es-ES');
    const formattedTime = new Date(time || new Date()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Configurar el correo
    const mailOptions = {
      from: `"Goza Madrid Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com',
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
      `
    };
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de visita enviado:', info.messageId);
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Solicitud de visita enviada correctamente',
      data: { 
        visitId: savedVisit._id,
        messageId: info.messageId 
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