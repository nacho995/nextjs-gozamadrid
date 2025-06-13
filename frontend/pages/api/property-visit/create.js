// Reutilizamos el endpoint proxy de contacto para aprovechar la configuración existente
import handler from '../proxy/backend/contact';

export default async function visitHandler(req, res) {
  // Asegurarnos de que es un POST
  if (req.method !== 'POST') {
    console.error('Método no permitido:', req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Extraer los campos del formulario
    const { 
      property, // ID de propiedad
      propertyAddress, // Título de propiedad 
      name, 
      email, 
      phone, 
      date, // Fecha de visita
      time, // Hora de visita
      message
    } = req.body;

    // Validar datos mínimos requeridos
    if (!email) {
      console.error('Email requerido', req.body);
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Reformatear para el formato esperado por el proxy de contacto
    const formattedBody = {
      ...req.body,
      type: 'visit',
      propertyId: property,
      propertyTitle: propertyAddress,
      visitDate: date,
      visitTime: time,
      name,
      email,
      phone,
      message
    };

    // Guardar la petición original para referencia
    const originalReqBody = req.body;
    
    // Adaptar la solicitud al formato esperado por el handler de contacto
    req.body = formattedBody;
    
    // Registrar para diagnóstico
    console.log('Solicitud de visita recibida:', {
      propertyId: property,
      propertyAddress,
      date,
      time,
      email
    });

    // Usar el handler existente que ya tiene toda la lógica de envío
    // y servicios de respaldo configurados
    return handler(req, res);
    
  } catch (error) {
    console.error('Error al procesar solicitud de visita:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
