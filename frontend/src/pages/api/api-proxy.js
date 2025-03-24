// Proxy para evitar problemas de mixed content (HTTPS a HTTP)
export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  try {
    // URL base del API backend
    const API_URL = 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    
    // Extraer la ruta y los parámetros de la solicitud
    const { path, ...queryParams } = req.query;
    
    // Construir la URL del API
    let targetUrl = `${API_URL}${path ? `/${path}` : ''}`;
    
    // Añadir parámetros de consulta si existen
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'path') {
          searchParams.append(key, value);
        }
      }
      targetUrl += `?${searchParams.toString()}`;
    }
    
    console.log(`[Proxy] Redirigiendo solicitud a: ${targetUrl}`);
    
    // Configurar las opciones de fetch
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    // Si hay un cuerpo en la solicitud, modificarlo para añadir copia
    // y luego añadirlo a las opciones de fetch
    if (req.body && Object.keys(req.body).length > 0) {
      // Clonar el cuerpo para no modificar el original
      const modifiedBody = { ...req.body };
      
      // Para rutas específicas, añadir email adicional como copia
      if (path === 'api/contact') {
        // Añadir un campo adicional para indicar que debe enviarse copia
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com';
        console.log('[Proxy] Añadido email adicional en copia para contacto:', modifiedBody);
      } else if (path === 'api/property-visit/create') {
        // Añadir un campo adicional para indicar que debe enviarse copia
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com';
        console.log('[Proxy] Añadido email adicional en copia para visita:', modifiedBody);
      } else if (path === 'api/property-offer/create') {
        // Añadir un campo adicional para indicar que debe enviarse copia
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com';
        
        // Asegurarse de que los datos tienen el formato correcto para ofertas
        if (modifiedBody.offerAmount && !modifiedBody.offerPrice) {
          modifiedBody.offerPrice = modifiedBody.offerAmount;
          console.log('[Proxy] Convertido offerAmount a offerPrice para compatibilidad');
        }
        
        console.log('[Proxy] Añadido email adicional en copia para oferta:', modifiedBody);
      }
      
      fetchOptions.body = JSON.stringify(modifiedBody);
    }
    
    // Log detallado de lo que estamos enviando
    console.log('[Proxy] Opciones de fetch:', {
      method: fetchOptions.method,
      headers: fetchOptions.headers,
      body: fetchOptions.body ? JSON.parse(fetchOptions.body) : null
    });
    
    // Realizar la solicitud al API backend
    const response = await fetch(targetUrl, fetchOptions);
    
    // Obtener los datos de la respuesta
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Log detallado de la respuesta
    console.log('[Proxy] Respuesta del backend:', {
      status: response.status,
      headers: Object.fromEntries([...response.headers.entries()]),
      data: data
    });
    
    // Responder con los datos y el mismo código de estado
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(500).json({ 
      error: 'Error en el proxy',
      message: error.message
    });
  }
} 