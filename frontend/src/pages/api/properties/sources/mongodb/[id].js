// Este endpoint sirve como proxy para obtener una propiedad específica de MongoDB
export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID de propiedad' });
  }
  
  try {
    // Usar la URL de Render que funciona
    const url = `https://nextjs-gozamadrid-qrfk.onrender.com/api/properties/${id}`;
    
    console.log(`[API] Solicitando propiedad MongoDB con ID ${id} desde ${url}`);
    
    // Configurar la solicitud con un timeout adecuado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Si la solicitud no es exitosa, lanzar un error
      if (!response.ok) {
        throw new Error(`Error al obtener propiedad: ${response.status} ${response.statusText}`);
      }
      
      // Obtener los datos de la propiedad
      const property = await response.json();
      
      // Si no hay propiedad o está vacía
      if (!property) {
        return res.status(404).json({ 
          error: 'Propiedad no encontrada',
          id,
          source: 'mongodb'
        });
      }
      
      // Si todo es correcto, devolver la propiedad
      return res.status(200).json({
        ...property,
        source: 'mongodb' // Asegurarse de que tenga la fuente correcta
      });
    } catch (fetchError) {
      console.error(`[API] Error de fetch al obtener propiedad MongoDB ${id}:`, fetchError);
      
      // Proporcionar una propiedad de fallback para que la aplicación no falle
      const fallbackProperty = {
        _id: id,
        title: `Propiedad ${id}`,
        description: "Información temporal. Estamos experimentando problemas al conectar con la base de datos. Por favor, inténtelo de nuevo más tarde.",
        source: 'mongodb',
        price: "Consultar",
        images: [],
        _fallback: true,
        features: {
          bedrooms: 0,
          bathrooms: 0,
          area: 0
        },
        bedrooms: 0,
        bathrooms: 0,
        size: 0,
        location: 'Madrid',
        type: 'Propiedad',
        error: fetchError.message
      };
      
      // Devolver una respuesta 207 (Multi-Status) - Éxito parcial
      return res.status(207).json(fallbackProperty);
    }
    
  } catch (error) {
    console.error(`[API] Error general al obtener propiedad MongoDB ${id}:`, error);
    
    // Si el error es de timeout
    if (error.name === 'AbortError') {
      // Proporcionar una propiedad de fallback básica
      const timeoutFallbackProperty = {
        _id: id,
        title: `Propiedad ${id} (Tiempo de espera agotado)`,
        description: "Se agotó el tiempo de espera al intentar cargar la información. Por favor, inténtelo de nuevo más tarde.",
        source: 'mongodb',
        price: "Consultar",
        images: [],
        _fallback: true,
        features: {
          bedrooms: 0,
          bathrooms: 0,
          area: 0
        },
        bedrooms: 0,
        bathrooms: 0,
        size: 0,
        location: 'Madrid',
        type: 'Propiedad',
        error: 'Tiempo de espera agotado'
      };
      
      return res.status(207).json(timeoutFallbackProperty);
    }
    
    // Para cualquier otro error, también devolver datos de fallback
    const errorFallbackProperty = {
      _id: id,
      title: `Propiedad ${id} (Error de servidor)`,
      description: "Ocurrió un error al intentar cargar la información. Por favor, inténtelo de nuevo más tarde.",
      source: 'mongodb',
      price: "Consultar",
      images: [],
      _fallback: true,
      features: {
        bedrooms: 0,
        bathrooms: 0,
        area: 0
      },
      bedrooms: 0,
      bathrooms: 0,
      size: 0,
      location: 'Madrid',
      type: 'Propiedad',
      error: error.message || 'Error interno del servidor'
    };
    
    return res.status(207).json(errorFallbackProperty);
  }
} 