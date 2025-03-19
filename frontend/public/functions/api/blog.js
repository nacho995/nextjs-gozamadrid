// API combinada para obtener blogs de MongoDB y WordPress
import { handleCors, applyCorsHeaders } from './cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // Obtener el ID del blog si se especifica
  const url = new URL(request.url);
  const blogId = url.searchParams.get('id');
  
  try {
    console.log('Ejecutando API para obtener blogs' + (blogId ? ` con ID: ${blogId}` : ''));
    
    // URLs de las APIs - usar env o config centralizado
    const mongodbUrl = env.MONGODB_API_URL || config.MONGODB_API_URL || 'https://goza-madrid.onrender.com';
    const wpApiUrl = env.WP_API_URL || config.WP_API_URL;
    
    // Construir URLs específicas
    const mongodbBlogsUrl = `${mongodbUrl}/blog${blogId ? `/${blogId}` : ''}`;
    const wordpressUrl = `${wpApiUrl}/posts${blogId ? `/${blogId}` : ''}`;
    const wordpressParams = '?_embed=true&per_page=10';
    
    // Solicitudes a ambas APIs con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT || 60000); // 60 segundos por defecto
    
    const [mongodbRequest, wordpressRequest] = await Promise.allSettled([
      fetch(mongodbBlogsUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cloudflare-Workers'
        },
        signal: controller.signal
      }),
      fetch(`${wordpressUrl}${wordpressParams}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cloudflare-Workers'
        },
        signal: controller.signal
      })
    ]).finally(() => {
      clearTimeout(timeoutId);
    });
    
    // Variables para almacenar resultados
    let mongodbBlogs = [];
    let wordpressBlogs = [];
    let errors = [];
    
    // Procesar resultados de MongoDB
    if (mongodbRequest.status === 'fulfilled' && mongodbRequest.value.ok) {
      try {
        const mongodbData = await mongodbRequest.value.json();
        console.log(`Obtenidos ${mongodbData.length} blogs de MongoDB`);
        
        // Transformar datos de MongoDB
        mongodbBlogs = mongodbData.map(blog => ({
          ...blog,
          source: 'mongodb'
        }));
      } catch (error) {
        console.error('Error al procesar datos de MongoDB:', error);
        errors.push({
          source: 'mongodb',
          error: error.message
        });
      }
    } else {
      console.error('Error al obtener blogs de MongoDB:', 
                   mongodbRequest.status === 'fulfilled' ? mongodbRequest.value.status : mongodbRequest.reason);
      errors.push({
        source: 'mongodb',
        error: mongodbRequest.status === 'fulfilled' ? 
              `HTTP ${mongodbRequest.value.status}` : 
              mongodbRequest.reason
      });
    }
    
    // Procesar resultados de WordPress
    if (wordpressRequest.status === 'fulfilled' && wordpressRequest.value.ok) {
      try {
        // Verificar si la respuesta es HTML
        const contentType = wordpressRequest.value.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('WordPress devolvió HTML en lugar de JSON');
          errors.push({
            source: 'wordpress',
            error: 'Respuesta en formato HTML (no es JSON válido)'
          });
        } else {
          const wordpressData = await wordpressRequest.value.json();
          console.log(`Obtenidos ${wordpressData.length} blogs de WordPress`);
          
          // Transformar datos de WordPress al formato común
          wordpressBlogs = wordpressData.map(post => ({
            _id: `wp-${post.id}`,
            id: `wp-${post.id}`,
            title: post.title.rendered,
            description: post.excerpt.rendered,
            content: post.content.rendered,
            author: post._embedded?.author?.[0]?.name || 'Anónimo',
            category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'General',
            tags: post._embedded?.['wp:term']?.[1]?.map(tag => tag.name) || [],
            date: post.date,
            dateFormatted: new Date(post.date).toLocaleDateString('es-ES'),
            readTime: '5',
            images: post._embedded?.['wp:featuredmedia'] ? 
              [{
                src: post._embedded['wp:featuredmedia'][0].source_url,
                alt: post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered
              }] : [],
            image: post._embedded?.['wp:featuredmedia'] ? 
              {
                src: post._embedded['wp:featuredmedia'][0].source_url,
                alt: post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered
              } : null,
            imageUrl: post._embedded?.['wp:featuredmedia'] ? 
              post._embedded['wp:featuredmedia'][0].source_url : null,
            source: 'wordpress'
          }));
        }
      } catch (error) {
        console.error('Error al procesar datos de WordPress:', error);
        errors.push({
          source: 'wordpress',
          error: error.message
        });
      }
    } else {
      console.error('Error al obtener blogs de WordPress:', 
                   wordpressRequest.status === 'fulfilled' ? wordpressRequest.value.status : wordpressRequest.reason);
      errors.push({
        source: 'wordpress',
        error: wordpressRequest.status === 'fulfilled' ? 
              `HTTP ${wordpressRequest.value.status}` : 
              wordpressRequest.reason
      });
    }
    
    // Combinar resultados
    const allBlogs = [...mongodbBlogs, ...wordpressBlogs];
    
    // Ordenar por fecha (más recientes primero)
    allBlogs.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });
    
    // Preparar respuesta
    const response = {
      total: allBlogs.length,
      mongodb: mongodbBlogs.length,
      wordpress: wordpressBlogs.length,
      blogs: allBlogs,
      errors: errors.length > 0 ? errors : undefined
    };
    
    // Devolver respuesta combinada
    return new Response(JSON.stringify(response), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }, request)
    });
    
  } catch (error) {
    // Manejar errores generales
    console.error('Error en API combinada de blogs:', error);
    
    // Detectar si es un error de timeout
    const isTimeout = error.name === 'AbortError';
    const errorMessage = isTimeout ? 
      'La solicitud excedió el tiempo de espera' : 
      `Error al procesar la solicitud: ${error.message}`;
    
    return new Response(JSON.stringify({
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }, request)
    });
  }
} 