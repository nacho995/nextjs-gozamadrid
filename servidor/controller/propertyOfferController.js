import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PropertyOffer from '../models/PropertyOffer.js';

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

// Función para enviar notificación de oferta de propiedad
export const sendPropertyOfferNotification = async (req, res) => {
  try {
    console.log('Recibida solicitud de oferta de propiedad:', req.body);
    
    // Validar datos requeridos
    const { property, propertyAddress, offerPrice, offerPercentage, name, email, phone } = req.body;
    
    if (!property || !email || !name || !phone || !offerPrice) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la oferta'
      });
    }
    
    // Crear nueva oferta en la base de datos
    const newOffer = new PropertyOffer({
      property,
      propertyAddress,
      offerPrice,
      offerPercentage,
      name,
      email,
      phone,
      status: 'pending'
    });
    
    // Guardar la oferta en la base de datos
    const savedOffer = await newOffer.save();
    
    // Configurar el correo
    const mailOptions = {
      from: `"Goza Madrid Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com',
      subject: `Nueva oferta para propiedad: ${propertyAddress}`,
      html: `
        <h1>Nueva oferta de propiedad</h1>
        <p><strong>Propiedad:</strong> ${propertyAddress}</p>
        <p><strong>Precio ofertado:</strong> ${offerPrice}€</p>
        <p><strong>Porcentaje de oferta:</strong> ${offerPercentage || 'No especificado'}</p>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
      `
    };
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de oferta enviado:', info.messageId);
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Oferta enviada correctamente',
      data: { 
        offerId: savedOffer._id,
        messageId: info.messageId 
      }
    });
    
  } catch (error) {
    console.error('Error al procesar oferta de propiedad:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la oferta',
      error: error.message
    });
  }
}; 