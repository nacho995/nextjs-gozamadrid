import nodemailer from 'nodemailer';
import dbConnect from '../../lib/dbConnect';
import Contact from '../../models/Contact';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const {
      nombre,
      telefono,
      email,
      tipoPropiedad,
      direccion,
      codigoPostal,
      superficie,
      habitaciones,
      banos,
      planta,
      ascensor,
      garaje,
      trastero,
      estadoConservacion,
      anosConstruccion,
      extras,
      mensaje,
    } = req.body;

    // Validacion basica
    if (!nombre || !telefono || !email || !tipoPropiedad || !direccion) {
      return res.status(400).json({ error: 'Faltan campos requeridos (nombre, teléfono, email, tipo de propiedad, dirección)' });
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

    // Formatear extras
    const extrasText = extras && extras.length > 0 ? extras.join(', ') : 'Ninguno';

    // Contenido del email
    const mailOptions = {
      from: `"Valoración Web GozaMadrid" <${emailUser}>`,
      to: 'marta@gozamadrid.com',
      subject: `[VALORACIÓN] Solicitud de ${nombre} - ${tipoPropiedad} en ${direccion}`,
      text: `
SOLICITUD DE VALORACIÓN DE PROPIEDAD
======================================

DATOS DEL PROPIETARIO
---------------------
Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}

DATOS DE LA PROPIEDAD
---------------------
Tipo: ${tipoPropiedad}
Dirección: ${direccion}
Código Postal: ${codigoPostal || 'No especificado'}
Superficie: ${superficie ? superficie + ' m²' : 'No especificada'}
Habitaciones: ${habitaciones || 'No especificado'}
Baños: ${banos || 'No especificado'}
Planta: ${planta || 'No especificada'}
Ascensor: ${ascensor || 'No especificado'}
Garaje: ${garaje || 'No especificado'}
Trastero: ${trastero || 'No especificado'}
Estado de conservación: ${estadoConservacion || 'No especificado'}
Año de construcción: ${anosConstruccion || 'No especificado'}
Extras: ${extrasText}

MENSAJE ADICIONAL
-----------------
${mensaje || 'Sin mensaje adicional'}

---
Este email ha sido enviado desde la página de Valoración Gratuita de gozamadrid.com
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 0; max-width: 650px; margin: 0 auto; background: #fafafa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 60%, #C7A336 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">Solicitud de Valoración</h1>
            <p style="color: #C7A336; margin: 8px 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Goza Madrid Real Estate</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
            <!-- Datos del propietario -->
            <h2 style="color: #000; border-bottom: 2px solid #C7A336; padding-bottom: 10px; margin-top: 0; font-size: 18px;">Datos del Propietario</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 160px;">Nombre:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Teléfono:</td>
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
            </table>
            
            <!-- Datos de la propiedad -->
            <h2 style="color: #000; border-bottom: 2px solid #C7A336; padding-bottom: 10px; font-size: 18px;">Datos de la Propiedad</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333; width: 160px;">Tipo:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0;">
                  <span style="background: #C7A336; color: #000; padding: 4px 14px; border-radius: 20px; font-weight: bold; font-size: 13px;">${tipoPropiedad}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Dirección:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${direccion}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Código Postal:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${codigoPostal || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Superficie:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${superficie ? superficie + ' m<sup>2</sup>' : 'No especificada'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Habitaciones:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${habitaciones || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Baños:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${banos || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Planta:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${planta || 'No especificada'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Ascensor:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${ascensor || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Garaje:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${garaje || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Trastero:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${trastero || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Conservación:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${estadoConservacion || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Año de construcción:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${anosConstruccion || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">Extras:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; color: #555;">${extrasText}</td>
              </tr>
            </table>
            
            <!-- Mensaje -->
            <div style="margin-top: 10px;">
              <h3 style="color: #000; margin-bottom: 8px; font-size: 16px;">Mensaje adicional:</h3>
              <p style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; color: #555; line-height: 1.6; border-left: 3px solid #C7A336;">${mensaje || 'Sin mensaje adicional'}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f0f0f0; padding: 15px 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">
              Este email ha sido enviado automáticamente desde la página de Valoración Gratuita de gozamadrid.com
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
          if (tipoPropiedad) contact.tipoPropiedad = tipoPropiedad;
          if (direccion) contact.direccion = direccion;
          contact.ultimoContacto = new Date();
          await contact.save();
        } else {
          await Contact.create({
            nombre,
            email,
            telefono,
            tipoPropiedad,
            direccion,
            intereses: ['valoracion'],
            estado: 'activo',
          });
        }
      } catch (dbError) {
        console.error('Error al guardar contacto en la base de datos:', dbError);
      }
    } else {
      console.warn('MONGODB_URI no configurado, omitiendo guardado en base de datos');
    }

    return res.status(200).json({ success: true, message: 'Solicitud de valoración enviada correctamente' });
  } catch (error) {
    console.error('Error al enviar solicitud de valoracion:', error);
    return res.status(500).json({ error: 'Error al enviar la solicitud', details: error.message });
  }
}
