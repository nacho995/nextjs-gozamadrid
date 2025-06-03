import nodemailer from 'nodemailer';
import dbConnect from '../../lib/dbConnect';
import Contact from '../../models/Contact';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Conectar a la base de datos
    await dbConnect();
    
    const { nombre, telefono, email, tipoPropiedad, zonaPropiedad, rangoValor, mensaje } = req.body;

    // Validación básica
    if (!nombre || !telefono || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Configurar transporte de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Contenido del email
    const mailOptions = {
      from: `"Formulario Web Propiedades Lujo" <${process.env.EMAIL_USER}>`,
      to: 'marta@gozamadrid.com',
      subject: `Nueva solicitud de valoración: ${nombre}`,
      text: `
        Nombre: ${nombre}
        Teléfono: ${telefono}
        Email: ${email}
        Tipo de propiedad: ${tipoPropiedad || 'No especificado'}
        Zona de la propiedad: ${zonaPropiedad || 'No especificada'}
        Rango de valor: ${rangoValor || 'No especificado'}
        
        Mensaje:
        ${mensaje || 'No hay mensaje adicional'}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #000; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Nueva Solicitud de Valoración</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nombre:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${telefono}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tipo de propiedad:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${tipoPropiedad || 'No especificado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Zona:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${zonaPropiedad || 'No especificada'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Rango de valor:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${rangoValor || 'No especificado'}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #000;">Mensaje:</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${mensaje || 'No hay mensaje adicional'}</p>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
            Este email ha sido enviado desde el formulario de contacto de la página de propiedades de lujo.
          </div>
        </div>
      `
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    // Guardar o actualizar contacto en la base de datos
    try {
      // Verificar si el contacto ya existe
      let contact = await Contact.findOne({ email });
      
      if (contact) {
        // Actualizar contacto existente
        contact.nombre = nombre;
        contact.telefono = telefono;
        if (tipoPropiedad) contact.tipoPropiedad = tipoPropiedad;
        if (zonaPropiedad) contact.zonaPropiedad = zonaPropiedad;
        if (rangoValor) contact.rangoValor = rangoValor;
        contact.ultimoContacto = new Date();
        await contact.save();
      } else {
        // Crear nuevo contacto
        await Contact.create({
          nombre,
          email,
          telefono,
          tipoPropiedad,
          zonaPropiedad,
          rangoValor,
          intereses: ['valoración'],
          estado: 'activo'
        });
      }
    } catch (dbError) {
      console.error('Error al guardar contacto en la base de datos:', dbError);
      // No fallamos la solicitud si hay un error en la base de datos, el email ya se envió
    }

    // Responder al cliente
    return res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return res.status(500).json({ error: 'Error al enviar el email', details: error.message });
  }
}
