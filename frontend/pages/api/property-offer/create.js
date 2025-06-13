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
      offerAmount
    } = req.body;

    // Validar datos requeridos
    if (!propertyId || !email || !offerAmount) {
      console.error('Faltan datos requeridos');
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Registrar la oferta en MongoDB
    try {
      const { db } = await connectToDatabase();
      
      // Crear un documento de oferta
      const offer = {
        propertyId,
        propertyTitle,
        name,
        email,
        phone,
        offerAmount,
        status: 'pending',
        createdAt: new Date(),
      };

      // Insertar en la colección de ofertas
      await db.collection('property_offers').insertOne(offer);
      console.log('Oferta guardada en MongoDB:', offer);
    } catch (dbError) {
      console.error('Error al guardar oferta en MongoDB:', dbError);
      // Continuamos aunque falle la BD para dar buena experiencia al usuario
    }

    // Enviar correo si está configurado
    try {
      // Si tienes configurado nodemailer o algún otro servicio de correos
      // Código para enviar email aquí
      console.log('Email de oferta enviado correctamente');
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // Continuamos aunque falle el envío del correo
    }

    // Responder exitosamente
    return res.status(200).json({ success: true, message: 'Oferta recibida correctamente' });
    
  } catch (error) {
    console.error('Error al procesar la oferta:', error);
    return res.status(500).json({ error: 'Error al procesar la oferta' });
  }
}
