/**
 * API para obtener posts del blog desde WordPress y MongoDB
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
import config from '@/config/config';

export default async function handler(req, res) {
  console.log('[blogs] Recibida petición para obtener posts del blog');
  
  // Configurar headers CORS y caché
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Variables para contar fuentes
    let sources = {
      wordpress: 0,
      mongodb: 0
    };
    
    // Array para guardar todos los blogs
    let allBlogs = [];
    
    // 1. Intentar obtener blogs de WordPress a través del proxy interno
    try {
      const wordpressUrl = `${config.getWordPressBaseUrl()}/posts?_embed`;
      console.log('[blogs] Intentando obtener blogs desde WordPress:', wordpressUrl);

      const wpResponse = await fetch(wordpressUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        console.log(`[blogs] ${wpData.length} blogs obtenidos de WordPress`);
        
        // Transformar datos de WordPress al formato estándar
        const wpBlogs = wpData.map(post => {
          // Extraer imagen destacada si existe
          let featuredImage = null;
          if (post._embedded && 
              post._embedded['wp:featuredmedia'] && 
              post._embedded['wp:featuredmedia'][0]) {
              
              const media = post._embedded['wp:featuredmedia'][0];
              featuredImage = {
                  src: media.source_url || media.guid?.rendered,
                  alt: media.alt_text || post.title?.rendered || 'Imagen del blog'
              };
          } else {
              featuredImage = {
                  src: '/img/default-blog-image.jpg',
                  alt: post.title?.rendered || 'Imagen del blog'
              };
          }
          
          return {
            _id: `wp-${post.id}`,
            id: post.id,
            title: post.title?.rendered || 'Sin título',
            content: post.content?.rendered || '',
            excerpt: post.excerpt?.rendered || '',
            date: post.date || new Date().toISOString(),
            author: post._embedded?.author?.[0]?.name || 'Goza Madrid',
            slug: post.slug,
            image: featuredImage,
            categories: post.categories || [],
            tags: post.tags || [],
            link: post.link,
            source: 'wordpress'
          };
        });
        
        allBlogs = [...allBlogs, ...wpBlogs];
        sources.wordpress = wpBlogs.length;
      } else {
        console.warn(`[blogs] Error obteniendo blogs de WordPress: ${wpResponse.status} ${wpResponse.statusText}`);
      }
    } catch (wpError) {
      console.error('[blogs] Error al obtener blogs de WordPress:', wpError);
    }
    
    // 2. Intentar obtener blogs de MongoDB
    try {
      const mongoUrl = `${config.getBaseUrl()}/api/properties/blogs`;
      console.log('[blogs] Intentando obtener blogs desde MongoDB:', mongoUrl);
      
      const mongoResponse = await fetch(mongoUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (mongoResponse.ok) {
        const mongoData = await mongoResponse.json();
        console.log(`[blogs] ${mongoData.length} blogs obtenidos de MongoDB`);
        
        // Transformar y filtrar datos de MongoDB (ya deberían tener el formato correcto)
        const mongoBlogs = mongoData.map(blog => ({
          ...blog,
          source: 'mongodb'
        }));
        
        allBlogs = [...allBlogs, ...mongoBlogs];
        sources.mongodb = mongoBlogs.length;
      } else {
        console.warn(`[blogs] Error obteniendo blogs de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
      }
    } catch (mongoError) {
      console.error('[blogs] Error al obtener blogs de MongoDB:', mongoError);
    }
    
    // 3. Ordenar todos los blogs por fecha (más recientes primero)
    allBlogs.sort((a, b) => {
      const dateA = new Date(a.date || '2000-01-01');
      const dateB = new Date(b.date || '2000-01-01');
      return dateB - dateA;
    });
    
    console.log(`[blogs] Total de ${allBlogs.length} blogs combinados (${sources.wordpress} de WordPress, ${sources.mongodb} de MongoDB)`);
    
    // Devolver los blogs combinados
    return res.status(200).json({
      blogs: allBlogs,
      sources,
      total: allBlogs.length
    });
    
  } catch (error) {
    console.error('[blogs] Error en el endpoint combinado de blogs:', error);
    res.status(500).json({ 
      error: error.message,
      blogs: []
    });
  }
} 