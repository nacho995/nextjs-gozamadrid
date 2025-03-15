/**
 * Servicio para gestionar las peticiones a la API de WordPress
 */

// URL base de la API de WordPress (usando nuestro proxy)
const WP_API_URL = '/api/wordpress-proxy?endpoint=wp&path=posts';

// Añadir esta función de utilidad en la parte superior del archivo
const proxyImage = (url) => {
  if (!url) return '/img/default-logo.png';
  
  // Si la URL ya es un proxy o una ruta local, devuélvela tal cual
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  
  // Asegurarse de que todas las URLs externas pasen por el proxy
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
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
 * Obtiene los posts del blog
 * @param {number} page - Número de página
 * @param {number} perPage - Cantidad de posts por página
 * @returns {Promise} - Promesa con los posts
 */
export const getBlogPostsFromServer = async (page = 1, perPage = 9) => {
  try {
    // Determinar si estamos en el servidor o en el cliente
    const isServer = typeof window === 'undefined';
    
    // Construir la URL base según el entorno
    let baseUrl = '';
    if (isServer) {
      // En el servidor, usamos directamente la API de WordPress
      baseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
    } else {
      // En el cliente, usamos nuestro proxy
      baseUrl = '/api/wordpress-proxy?endpoint=wp&path=';
    }
    
    // Construir la URL completa
    const url = isServer 
      ? `${baseUrl}/posts?page=${page}&per_page=${perPage}&_embed` 
      : `${baseUrl}posts&page=${page}&per_page=${perPage}&_embed=true`;
    
    // Añadir un timeout para evitar bloqueos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Evitar caché en Next.js
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Error en la respuesta de WordPress: ${response.status} ${response.statusText}`);
      throw new Error('Error al obtener los posts');
    }
    
    const postsData = await response.json();
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    
    // Procesar los posts para garantizar que no hay objetos directos en ningún campo
    // Optimizar el procesamiento para que sea más rápido
    const processedPosts = postsData.map(post => {
      // Crear una copia sin referencias a objetos de WordPress
      return {
        ...post,
        title: safeRenderValue(post.title),
        content: safeRenderValue(post.content),
        excerpt: safeRenderValue(post.excerpt),
        // Usar nuestra nueva función getImageUrl para extraer correctamente la imagen
        image: {
          src: getImageUrl(post),
          alt: safeRenderValue(post.title)
        },
        source: 'wordpress',
        _id: `wp-${post.id}`,
        id: post.id
      };
    });
    
    // Mantener la estructura anterior
    return { posts: processedPosts, totalPages };
  } catch (error) {
    console.error('Error en getBlogPostsFromServer:', error);
    // Si es un error de timeout, proporcionar un mensaje más claro
    if (error.name === 'AbortError') {
      console.error('La solicitud a WordPress se canceló por timeout');
    }
    return { posts: [], totalPages: 0 };
  }
};

/**
 * Obtiene un post específico por su slug con reintentos
 * @param {string} slug - Slug del post
 * @param {number} retries - Número de reintentos (por defecto 5)
 * @returns {Promise} - Promesa con el post
 */
export async function getBlogPostBySlug(slug, retries = 5) {
  try {
    // Determinar si estamos en el servidor o en el cliente
    const isServer = typeof window === 'undefined';
    
    // Construir la URL base según el entorno
    let baseUrl = '';
    if (isServer) {
      // En el servidor, usamos directamente la API de WordPress
      baseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
    } else {
      // En el cliente, usamos nuestro proxy
      baseUrl = '/api/wordpress-proxy?endpoint=wp&path=';
    }
    
    // Construir la URL completa
    const url = isServer 
      ? `${baseUrl}/posts?slug=${encodeURIComponent(slug)}&_embed` 
      : `${baseUrl}posts&slug=${encodeURIComponent(slug)}&_embed=true`;
    
    // Añadir timeout para evitar que la petición se quede colgada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store', // Evitar caché en Next.js
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Si obtenemos un error 503, intentar de nuevo después de un retraso
    if (response.status === 503 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return getBlogPostBySlug(slug, retries - 1);
    }
    
    if (!response.ok) {
      console.error(`Error al obtener el post: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener el post: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Si encontramos el post, procesar sus campos
    if (posts && posts.length > 0) {
      const post = posts[0];
      
      // Procesar todos los campos que podrían ser objetos
      post.title = safeRenderValue(post.title);
      post.content = safeRenderValue(post.content);
      post.excerpt = safeRenderValue(post.excerpt);
      
      return post;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error en getBlogPostBySlug:`, error);
    
    // Si es un error de timeout o de red y aún tenemos reintentos, intentar de nuevo
    if ((error.name === 'AbortError' || error.name === 'TypeError') && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return getBlogPostBySlug(slug, retries - 1);
    }
    
    throw error;
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
  
  // Aplicar el proxy para URLs externas
  if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
    // Usar el proxy para imágenes externas
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }
  
  return imageUrl;
} 