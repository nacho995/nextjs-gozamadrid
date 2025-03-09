/**
 * API Proxy para WordPress simplificado
 */
export default async function handler(req, res) {
  try {
    const { path, slug } = req.query;
    
    // Construir la URL de la API de WordPress
    let wpApiUrl = `https://realestategozamadrid.com/wp-json/wp/v2/${path || 'posts'}`;
    
    // Añadir _embed para obtener medios relacionados (imágenes destacadas)
    wpApiUrl += wpApiUrl.includes('?') ? '&_embed' : '?_embed';
    
    // Tratamiento especial para slug - es un caso común
    if (slug) {
      wpApiUrl += `&slug=${encodeURIComponent(slug)}`;
      console.log(`Buscando post con slug: ${slug}`);
    }
    
    // Añadir resto de parámetros de la consulta
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && key !== 'slug') {
        wpApiUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    console.log('Conectando a la API de WordPress:', wpApiUrl);
    
    // Realizar la petición a la API de WordPress
    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Node.js API Proxy)'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      console.error(`Error en la respuesta de WordPress: ${response.status} ${response.statusText}`);
      console.error('URL que falló:', wpApiUrl);
      
      // Intentar leer el cuerpo del error si está disponible
      try {
        const errorBody = await response.text();
        console.error('Cuerpo del error:', errorBody);
      } catch (e) {
        console.error('No se pudo leer el cuerpo del error');
      }
      
      return res.status(response.status).json({ 
        error: `Error en la respuesta de WordPress: ${response.status}`,
        message: response.statusText
      });
    }
    
    // Obtener los datos y devolverlos
    const data = await response.json();
    
    // Logs más detallados según el tipo de respuesta
    if (Array.isArray(data)) {
      console.log(`Recibidos ${data.length} posts de WordPress`);
      if (data.length > 0 && slug) {
        console.log(`Post encontrado con slug "${slug}": ${data[0].title?.rendered || 'Sin título'}`);
      } else if (data.length === 0 && slug) {
        console.log(`No se encontró ningún post con slug "${slug}"`);
      }
    } else {
      console.log(`Recibido objeto singular de WordPress: ${data.title?.rendered || 'Sin título'}`);
    }
    
    // Pasar headers de paginación si existen
    if (response.headers.get('X-WP-Total')) {
      res.setHeader('X-WP-Total', response.headers.get('X-WP-Total'));
    }
    if (response.headers.get('X-WP-TotalPages')) {
      res.setHeader('X-WP-TotalPages', response.headers.get('X-WP-TotalPages'));
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WordPress:', error);
    return res.status(500).json({ 
      error: 'Error al obtener datos de WordPress',
      message: error.message
    });
  }
} 