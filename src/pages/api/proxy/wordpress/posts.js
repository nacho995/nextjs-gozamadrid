import axios from 'axios';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';

export default async function handler(req, res) {
  // Establecer headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('[WordPress Proxy] Obteniendo posts...');
    
    // Parámetros de consulta
    const { per_page = 10, page = 1, search, categories, tags } = req.query;
    
    // Construir URL con parámetros
    const params = new URLSearchParams({
      per_page: Math.min(parseInt(per_page), 100), // Limitar a 100 max
      page: parseInt(page),
      _embed: 'true', // Incluir datos embebidos como featured media
      status: 'publish',
      orderby: 'date',
      order: 'desc'
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (categories) {
      params.append('categories', categories);
    }
    
    if (tags) {
      params.append('tags', tags);
    }
    
    const url = `${WP_API_URL}/posts?${params.toString()}`;
    console.log('[WordPress Proxy] URL:', url);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GozaMadrid-Website/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log(`[WordPress Proxy] Obtenidos ${response.data.length} posts`);
    
    // Procesar los posts para asegurar compatibilidad
    const processedPosts = response.data.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug,
      date: post.date,
      date_gmt: post.date_gmt,
      modified: post.modified,
      status: post.status,
      link: post.link,
      author: post.author,
      featured_media: post.featured_media,
      categories: post.categories,
      tags: post.tags,
      _embedded: post._embedded,
      // Campos adicionales para compatibilidad
      author_name: post._embedded?.author?.[0]?.name || 'Equipo Goza Madrid',
      featured_image_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
    }));
    
    return res.status(200).json(processedPosts);
    
  } catch (error) {
    console.error('[WordPress Proxy] Error:', error.message);
    
    // Detectar tipo de error
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Servicio WordPress no disponible',
        code: 'SERVICE_UNAVAILABLE',
        message: 'No se pudo conectar con el servidor de WordPress'
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Endpoint no encontrado',
        code: 'NOT_FOUND',
        message: 'El endpoint de WordPress no existe'
      });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        code: 'FORBIDDEN',
        message: 'No tienes permisos para acceder a este recurso'
      });
    }
    
    // Error genérico
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      message: error.message || 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 