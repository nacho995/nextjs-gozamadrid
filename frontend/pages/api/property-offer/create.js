// Reutilizamos el endpoint proxy de contacto para aprovechar la configuración existente
import handler from '../proxy/backend/contact';

export default async function offerHandler(req, res) {
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
      offerPrice, // Precio ofertado
      offerPercentage, // Porcentaje del precio original (opcional)
      message
    } = req.body;

    // Validar datos mínimos requeridos
    if (!email) {
      console.error('Email requerido', req.body);
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Formatear precio para presentación
    let formattedPrice = '';
    if (typeof offerPrice === 'number') {
      formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(offerPrice);
    } else {
      // Si no es un número, lo dejamos como está
      formattedPrice = offerPrice;
    }

    // Reformatear para el formato esperado por el proxy de contacto
    const formattedBody = {
      ...req.body,
      type: 'offer',
      propertyId: property,
      propertyTitle: propertyAddress,
      offerAmount: formattedPrice,
      offerLabel: offerPercentage,
      name,
      email,
      phone,
      message
    };

    // Adaptar la solicitud al formato esperado por el handler de contacto
    req.body = formattedBody;
    
    // Registrar para diagnóstico
    console.log('Oferta recibida:', {
      propertyId: property,
      propertyAddress,
      offerPrice: formattedPrice,
      offerPercentage,
      email
    });

    // Usar el handler existente que ya tiene toda la lógica de envío
    // y servicios de respaldo configurados
    return handler(req, res);
    
  } catch (error) {
    console.error('Error al procesar oferta:', error);
    return res.status(500).json({ error: 'Error al procesar la oferta' });
  }
}
