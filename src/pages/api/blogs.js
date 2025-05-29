import axios from 'axios';

/**
 * API específica para los blogs que soluciona los problemas de CORS
 * Proporciona un endpoint centralizado para obtener blogs de WordPress
 */
export default async function handler(req, res) {
  // Configurar CORS para desarrollo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método no permitido',
      message: 'Solo se permiten solicitudes GET'
    });
  }

  try {
    // URL de la API de WordPress
    const wpUrl = 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2/posts';
    
    // Parámetros de consulta
    const { limit = 10, page = 1, search } = req.query;
    
    // Construir URL con parámetros
    let targetUrl = `${wpUrl}?per_page=${limit}&page=${page}`;
    
    // Añadir término de búsqueda si se proporciona
    if (search) {
      targetUrl += `&search=${encodeURIComponent(search)}`;
    }
    
    console.log(`[Blogs API] Solicitando blogs de: ${targetUrl}`);
    
    // Hacer solicitud a la API de WordPress sin headers problemáticos
    const response = await axios.get(targetUrl, {
      headers: {
        'Accept': 'application/json',
        // No incluir Cache-Control ya que causa problemas CORS
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    // Procesar y transformar la respuesta para simplificar el uso en el frontend
    const blogs = response.data.map(post => ({
      id: post.id,
      title: post.title?.rendered || '',
      excerpt: post.excerpt?.rendered || '',
      content: post.content?.rendered || '',
      slug: post.slug,
      date: post.date,
      modified: post.modified,
      featuredImage: post.featured_media || null,
      // Extraer la URL de la imagen destacada si existe
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      categories: post.categories || [],
      author: post.author || null,
      source: 'wordpress'
    }));
    
    return res.status(200).json(blogs);
    
  } catch (error) {
    console.error('[Blogs API] Error:', error.message);
    
    // Respuesta de error detallada
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Error en la API de WordPress',
        message: error.message,
        status: error.response.status
      });
    } else if (error.request) {
      return res.status(504).json({
        error: 'Sin respuesta de WordPress',
        message: 'La API de WordPress no respondió a tiempo'
      });
    } else {
      return res.status(500).json({
        error: 'Error interno',
        message: error.message
      });
    }
  }
} 