/**
 * Servicio para gestionar las peticiones a la API de WordPress a través del proxy
 */

import config from '@/config/config';

// API URLs con fallback para desarrollo
const WORDPRESS_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://www.realestategozamadrid.com/wp-json/wp/v2';

// URL del proxy moderno para WordPress - usar el endpoint simple que funciona
const WP_PROXY_URL = process.env.NEXT_PUBLIC_WP_PROXY_URL || 'https://www.realestategozamadrid.com/api/wordpress-proxy';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

// Añadir esta función de utilidad en la parte superior del archivo
const proxyImage = (url) => {
  if (!url) return '/img/default-logo.png';
  
  // Si la URL ya es un proxy o una ruta local, devuélvela tal cual
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  
  // Devolver la URL tal cual, sin proxy adicional
  return url;
};

// Añade esta función de seguridad en la parte superior del archivo
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // Caso especial para objetos de WordPress
    if (value.rendered) return value.rendered;
    // Para otros objetos, convertirlos a JSON
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * SERVICIO CENTRALIZADO PARA BLOGS
 * Implementa retry logic, cache inteligente y fallbacks robustos
 * Autor: Senior Developer con 40 años de experiencia
 */

class BlogApiService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo base
  }

  /**
   * Implementa exponential backoff para retry
   */
  async withRetry(fn, maxAttempts = this.retryAttempts) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`[BlogAPI] Retry ${attempt}/${maxAttempts} en ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cache inteligente con TTL
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * MÉTODO PRINCIPAL: Obtiene blogs con estrategia robusta
   */
  async getBlogPosts(limit = 10) {
    const cacheKey = `blogs-${limit}`;
    
    // Verificar cache primero
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('[BlogAPI] ✅ Datos desde cache');
      return cached;
    }

    console.log('[BlogAPI] 🔄 Iniciando obtención de blogs...');

    // ESTRATEGIA 1: WordPress directo con retry - TEMPORALMENTE DESACTIVADO
    try {
      console.log('[BlogAPI] ⚠️ WordPress API temporalmente desactivada para Fast Refresh');
      // COMENTADO TEMPORALMENTE: const wpBlogs = await this.withRetry(async () => {
      // COMENTADO TEMPORALMENTE:   const response = await fetch('/api/wordpress-proxy', {
      // COMENTADO TEMPORALMENTE:     method: 'GET',
      // COMENTADO TEMPORALMENTE:     headers: {
      // COMENTADO TEMPORALMENTE:       'Accept': 'application/json',
      // COMENTADO TEMPORALMENTE:       'User-Agent': 'GozaMadrid-BlogAPI/2.0',
      // COMENTADO TEMPORALMENTE:       'Cache-Control': 'no-cache'
      // COMENTADO TEMPORALMENTE:     },
      // COMENTADO TEMPORALMENTE:     signal: AbortSignal.timeout(15000) // 15 segundos más generoso
      // COMENTADO TEMPORALMENTE:   });
      // COMENTADO TEMPORALMENTE: 
      // COMENTADO TEMPORALMENTE:   if (!response.ok) {
      // COMENTADO TEMPORALMENTE:     throw new Error(`WordPress API failed: ${response.status}`);
      // COMENTADO TEMPORALMENTE:   }
      // COMENTADO TEMPORALMENTE: 
      // COMENTADO TEMPORALMENTE:   const data = await response.json();
      // COMENTADO TEMPORALMENTE:   if (!Array.isArray(data) || data.length === 0) {
      // COMENTADO TEMPORALMENTE:     throw new Error('WordPress returned empty data');
      // COMENTADO TEMPORALMENTE:   }
      // COMENTADO TEMPORALMENTE: 
      // COMENTADO TEMPORALMENTE:   return data;
      // COMENTADO TEMPORALMENTE: });

      // COMENTADO TEMPORALMENTE: if (wpBlogs && wpBlogs.length > 0) {
      // COMENTADO TEMPORALMENTE:   console.log(`[BlogAPI] ✅ WordPress exitoso: ${wpBlogs.length} blogs`);
      // COMENTADO TEMPORALMENTE:   const result = { posts: wpBlogs, source: 'wordpress' };
      // COMENTADO TEMPORALMENTE:   this.setCache(cacheKey, result);
      // COMENTADO TEMPORALMENTE:   return result;
      // COMENTADO TEMPORALMENTE: }
      
      // Simular que WordPress falló para ir directo a fallback
      throw new Error('WordPress API temporalmente desactivada');
    } catch (wpError) {
      console.log(`[BlogAPI] ⚠️ WordPress falló: ${wpError.message}`);
    }

    // ESTRATEGIA 2: AWS Backend con retry - TEMPORALMENTE DESACTIVADO
    /*
    try {
      const awsBlogs = await this.withRetry(async () => {
        const response = await fetch('https://gw.estateinsight.zone/api/estates/blogs?limit=100', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GozaMadrid-BlogAPI/2.0',
            'X-API-Key': process.env.AWS_API_KEY || ''
          },
          signal: AbortSignal.timeout(12000) // 12 segundos
        });

        if (!response.ok) {
          throw new Error(`AWS API failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('AWS returned invalid data');
        }

        return data.data;
      });

      if (awsBlogs && awsBlogs.length > 0) {
        console.log(`[BlogAPI] ✅ AWS exitoso: ${awsBlogs.length} blogs`);
        
        // Transformar formato AWS a WordPress compatible
        const transformedBlogs = awsBlogs.slice(0, limit).map(blog => ({
          id: blog.id || Math.random().toString(36).substr(2, 9),
          title: { rendered: blog.title || 'Sin título' },
          excerpt: { rendered: blog.description || '' },
          content: { rendered: blog.content || '' },
          date: blog.date || new Date().toISOString(),
          slug: blog.slug || 'blog-post',
          featured_media: 0,
          featured_image_url: blog.image?.src || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
          author_name: blog.author || 'Equipo Goza Madrid',
          source: 'aws'
        }));

        const result = { posts: transformedBlogs, source: 'aws' };
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (awsError) {
      console.log(`[BlogAPI] ⚠️ AWS falló: ${awsError.message}`);
    }
    */
    console.log(`[BlogAPI] ⚠️ AWS API temporalmente desactivada`);

    // ESTRATEGIA 3: Respaldo local - SIEMPRE FUNCIONA
    try {
      const backupResponse = await fetch('/api/blogs-backup', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (backupResponse.ok) {
        const backupBlogs = await backupResponse.json();
        if (Array.isArray(backupBlogs) && backupBlogs.length > 0) {
          console.log(`[BlogAPI] ✅ Respaldo exitoso: ${backupBlogs.length} blogs`);
          const result = { posts: backupBlogs.slice(0, limit), source: 'backup' };
          // Cache por menos tiempo para backup
          this.setCache(cacheKey, result);
          return result;
        }
      }
    } catch (backupError) {
      console.error(`[BlogAPI] ❌ Respaldo falló: ${backupError.message}`);
    }

    // ÚLTIMO RECURSO: Blogs hardcoded
    console.log('[BlogAPI] 🆘 Usando blogs hardcoded como último recurso');
    const fallbackBlogs = [
      {
        id: 'fallback-1',
        title: { rendered: 'Bienvenido a Goza Madrid' },
        excerpt: { rendered: 'Estamos preparando contenido increíble para ti.' },
        content: { rendered: '<p>Muy pronto tendrás acceso a nuestros blogs sobre el mercado inmobiliario en Madrid.</p>' },
        date: new Date().toISOString(),
        slug: 'bienvenido-goza-madrid',
        featured_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        author_name: 'Equipo Goza Madrid',
        source: 'fallback'
      }
    ];

    return { posts: fallbackBlogs, source: 'fallback' };
  }

  /**
   * Limpia el cache manualmente
   */
  clearCache() {
    this.cache.clear();
    console.log('[BlogAPI] Cache limpiado');
  }
}

// Singleton instance
const blogApiService = new BlogApiService();

// API pública simple y robusta
export async function getBlogPostsFromServer(page = 1, limit = 10) {
  try {
    return await blogApiService.getBlogPosts(limit);
  } catch (error) {
    console.error('[BlogAPI] Error fatal:', error);
    // Nunca devolver error, siempre devolver algo
    return { 
      posts: [], 
      source: 'error',
      error: error.message 
    };
  }
}

// Legacy compatibility
export async function getBlogPosts() {
  const result = await getBlogPostsFromServer(1, 10);
  return result.posts || [];
}

// Función para limpiar cache desde componentes
export function clearBlogCache() {
  blogApiService.clearCache();
}

export default blogApiService;

/**
 * Obtiene un post específico por su slug con reintentos
 * @param {string} slug - Slug del post
 * @param {number} retries - Número de reintentos (por defecto 5)
 * @returns {Promise} - Promesa con el post
 */
export async function getBlogPostBySlug(slug, retries = 5) {
  // Validar el slug para evitar problemas
  if (!slug || typeof slug !== 'string') {
    console.error('Slug inválido:', slug);
    return null;
  }

  const cleanSlug = slug.trim().replace(/\s+/g, '-').toLowerCase();
  
  try {
    // Construir URL para usar el proxy moderno
    const url = `${WP_PROXY_URL}/posts?slug=${encodeURIComponent(cleanSlug)}&_embed`;
    
    console.log(`Obteniendo post por slug desde ${url}`);
    
    // Añadir timeout para evitar que la petición se quede colgada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).catch(error => {
      clearTimeout(timeoutId);
      console.error(`Error de red al obtener el post:`, error);
      throw error; // Re-lanzar para el manejo posterior
    });
    
    clearTimeout(timeoutId);
    
    // Si obtenemos un error 503 o 502, intentar de nuevo después de un retraso
    if ((response.status === 503 || response.status === 502) && retries > 0) {
      console.log(`Recibido ${response.status}, reintentando en 5 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return getBlogPostBySlug(cleanSlug, retries - 1);
    }
    
    if (!response.ok) {
      console.error(`Error al obtener el post: ${response.status} ${response.statusText}`);
      // Si es un error de servidor y tenemos reintentos, intentar de nuevo
      if (response.status >= 500 && retries > 0) {
        console.log(`Reintentando debido a error ${response.status}...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return getBlogPostBySlug(cleanSlug, retries - 1);
      }
      throw new Error(`Error al obtener el post: ${response.status}`);
    }
    
    // Intentar parsear la respuesta JSON
    let posts;
    try {
      posts = await response.json();
    } catch (parseError) {
      console.error('Error al parsear la respuesta JSON:', parseError);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return getBlogPostBySlug(cleanSlug, retries - 1);
      }
      throw parseError;
    }
    
    // Verificar que posts sea un array
    if (!Array.isArray(posts)) {
      console.error('La respuesta no es un array:', posts);
      return null;
    }
    
    // Si encontramos el post, procesar sus campos
    if (posts && posts.length > 0) {
      const post = posts[0];
      
      // Verificar que post es un objeto válido
      if (!post || typeof post !== 'object') {
        console.error('Post no válido:', post);
        return null;
      }
      
      try {
        // Procesar todos los campos que podrían ser objetos con manejo de errores
        post.title = safeRenderValue(post.title);
        post.content = safeRenderValue(post.content);
        post.excerpt = safeRenderValue(post.excerpt);
        
        // Asegurar que los campos esenciales existan
        if (!post.title) post.title = 'Sin título';
        if (!post.content) post.content = 'Sin contenido';
        
        return post;
      } catch (processingError) {
        console.error('Error al procesar los campos del post:', processingError);
        // Devolver un post básico en caso de error
        return {
          title: 'Error al cargar post',
          content: 'No se pudo cargar el contenido del post correctamente.',
          date: new Date().toISOString(),
          slug: cleanSlug
        };
      }
    } else {
      console.log(`No se encontró ningún post con el slug: ${cleanSlug}`);
      return null;
    }
  } catch (error) {
    console.error(`Error en getBlogPostBySlug:`, error);
    
    // Si es un error de timeout o de red y aún tenemos reintentos, intentar de nuevo
    if ((error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('network')) && retries > 0) {
      console.log(`Reintentando debido a error de red (${retries} intentos restantes)...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return getBlogPostBySlug(cleanSlug, retries - 1);
    }
    
    // Devolver null para manejar el error en el nivel superior
    return null;
  }
}

// Función getImageUrl mejorada para no depender del proxy
export function getImageUrl(wpPost) {
  // Intentar obtener la URL desde diferentes fuentes
  let imageUrl = null;
  
  if (!wpPost) return "";
  
  // Buscar en datos embebidos (disponibles con _embed)
  if (wpPost._embedded && 
      wpPost._embedded['wp:featuredmedia'] && 
      wpPost._embedded['wp:featuredmedia'][0]) {
    
    const media = wpPost._embedded['wp:featuredmedia'][0];
    
    // Obtener imagen en tamaño mediano si está disponible
    if (media.media_details && media.media_details.sizes) {
      for (const size of ['medium_large', 'medium', 'large', 'full']) {
        if (media.media_details.sizes[size]) {
          imageUrl = media.media_details.sizes[size].source_url;
          break;
        }
      }
    }
    
    // Fallback a source_url
    if (!imageUrl && media.source_url) {
      imageUrl = media.source_url;
    }
  }
  
  // Otros métodos para encontrar la imagen
  if (!imageUrl) {
    imageUrl = wpPost.uagb_featured_image_src?.medium?.[0] || 
              wpPost.uagb_featured_image_src?.full?.[0] || 
              wpPost.image?.src ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='%23999999'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
  }
  
  // Devolver la URL directamente sin proxy
  return imageUrl;
}

export async function getPosts(page = 1, perPage = 10) {
  try {
    const { posts } = await getBlogPostsFromServer(page, perPage);
    return posts;
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
}

export async function getPost(slug) {
  try {
    return await getBlogPostBySlug(slug);
  } catch (error) {
    console.error('Error in getPost:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${WP_PROXY_URL}/categories`);
    if (!response.ok) throw new Error('Error fetching categories');
    return await response.json();
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export async function getPostsByCategory(categoryId, page = 1, perPage = 10) {
  try {
    const response = await fetch(
      `${WP_PROXY_URL}/posts?categories=${categoryId}&page=${page}&per_page=${perPage}&_embed`
    );
    if (!response.ok) throw new Error('Error fetching posts by category');
    return await response.json();
  } catch (error) {
    console.error('Error in getPostsByCategory:', error);
    return [];
  }
} 