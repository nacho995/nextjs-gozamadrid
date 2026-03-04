import nodemailer from 'nodemailer';
import dbConnect from '../../lib/dbConnect';
import Contact from '../../models/Contact';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  try {
    const { nombre, telefono, email, localInteres, mensaje } = req.body;

    // Validacion basica
    if (!nombre || !telefono || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos (nombre, telefono, email)' });
    }

    // Configurar transporte de nodemailer
    const emailUser = process.env.EMAIL_USER || 'ignaciodalesiolopez@gmail.com';
    const emailPass = process.env.EMAIL_PASSWORD || 'htko euiv bjhf iplk';

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Contenido del email
    const mailOptions = {
      from: `"Landing Locales en Venta" <${emailUser}>`,
      to: 'marta@gozamadrid.com',
      subject: `[LOCALES] Nueva consulta de ${nombre} - ${localInteres || 'Informacion general'}`,
      text: `
NUEVA CONSULTA SOBRE LOCALES EN VENTA
======================================

Nombre: ${nombre}
Telefono: ${telefono}
Email: ${email}
Local de interes: ${localInteres || 'No especificado'}

Mensaje:
${mensaje || 'No hay mensaje adicional'}

---
Este email ha sido enviado desde la landing page de Locales en Venta.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000 0%, #C7A336 100%); padding: 20px 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">Nueva Consulta sobre Locales</h1>
            <p style="color: #ffd700; margin: 5px 0 0; font-size: 14px;">Landing Page - Locales en Venta</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #000; border-bottom: 2px solid #C7A336; padding-bottom: 10px; margin-top: 0;">Datos del interesado</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 140px;">Nombre:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Telefono:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0;">
                  <a href="tel:${telefono}" style="color: #C7A336; text-decoration: none; font-weight: bold;">${telefono}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0;">
                  <a href="mailto:${email}" style="color: #C7A336; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Local de interes:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0;">
                  <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px;">${localInteres || 'No especificado'}</span>
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <h3 style="color: #000; margin-bottom: 8px;">Mensaje:</h3>
              <p style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; color: #555; line-height: 1.6; border-left: 3px solid #C7A336;">${mensaje || 'No hay mensaje adicional'}</p>
            </div>
          </div>
          
          <div style="background: #f8f8f8; padding: 15px 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none;">
            <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
              Este email ha sido enviado automaticamente desde la landing page de Locales en Venta de Goza Madrid.
            </p>
          </div>
        </div>
      `,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    // Guardar o actualizar contacto en la base de datos (solo si MONGODB_URI esta configurado)
    if (process.env.MONGODB_URI) {
      try {
        await dbConnect();
        let contact = await Contact.findOne({ email });

        if (contact) {
          contact.nombre = nombre;
          contact.telefono = telefono;
          if (localInteres) contact.localInteres = localInteres;
          contact.ultimoContacto = new Date();
          await contact.save();
        } else {
          await Contact.create({
            nombre,
            email,
            telefono,
            localInteres,
            intereses: ['locales-venta'],
            estado: 'activo',
          });
        }
      } catch (dbError) {
        console.error('Error al guardar contacto en la base de datos:', dbError);
        // No fallamos la solicitud si hay un error en la BD, el email ya se envio
      }
    } else {
      console.warn('MONGODB_URI no configurado, omitiendo guardado en base de datos');
    }

    return res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return res.status(500).json({ error: 'Error al enviar el email', details: error.message });
  }
}
