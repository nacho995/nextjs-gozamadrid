import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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

// Función para enviar correo de contacto
export const sendContactEmail = async (req, res) => {
  try {
    console.log('Recibida solicitud de contacto:', req.body);
    
    // Validar datos requeridos
    const { nombre, email, asunto, telefono, prefix } = req.body;
    
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre y email son obligatorios'
      });
    }
    
    // Formatear el teléfono con el prefijo
    const telefonoCompleto = telefono ? `${prefix || '+34'} ${telefono}` : 'No proporcionado';
    
    // Configurar el correo
    const mailOptions = {
      from: `"Goza Madrid Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || 'marta@gozamadrid.com',
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefonoCompleto}</p>
        <p><strong>Mensaje:</strong> ${asunto || 'No proporcionado'}</p>
      `
    };
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo enviado:', info.messageId);
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: { messageId: info.messageId }
    });
    
  } catch (error) {
    console.error('Error al enviar correo de contacto:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
}; 