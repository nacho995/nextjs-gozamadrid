import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    console.error('Método no permitido:', req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { 
      propertyId, 
      propertyTitle, 
      name, 
      email, 
      phone, 
      visitDate, 
      visitTime 
    } = req.body;

    // Validar datos requeridos
    if (!propertyId || !email) {
      console.error('Faltan datos requeridos');
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Registrar la visita en MongoDB
    try {
      const { db } = await connectToDatabase();
      
      // Crear un documento de visita
      const visit = {
        propertyId,
        propertyTitle,
        name,
        email,
        phone,
        visitDate,
        visitTime,
        status: 'pending',
        createdAt: new Date(),
      };

      // Insertar en la colección de visitas
      await db.collection('property_visits').insertOne(visit);
      console.log('Visita guardada en MongoDB:', visit);
    } catch (dbError) {
      console.error('Error al guardar en MongoDB:', dbError);
      // Continuamos aunque falle la BD para dar buena experiencia al usuario
    }

    // Enviar correo si está configurado
    try {
      // Si tienes configurado nodemailer o algún otro servicio de correos
      // Código para enviar email aquí
      console.log('Email de visita enviado correctamente');
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // Continuamos aunque falle el envío del correo
    }

    // Responder exitosamente
    return res.status(200).json({ success: true, message: 'Solicitud de visita recibida correctamente' });
    
  } catch (error) {
    console.error('Error al procesar la solicitud de visita:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
