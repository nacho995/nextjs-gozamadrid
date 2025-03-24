/**
 * Servicio para gestionar las peticiones a la API de WordPress a través del proxy
 */

import config from '@/config/config';

// URL base para el proxy de WordPress
const WP_PROXY_URL = config.getWordPressBaseUrl();

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
 * Obtiene los posts del blog usando el endpoint proxy moderno
 * @param {number} page - Número de página
 * @param {number} perPage - Cantidad de posts por página
 * @returns {Promise} - Promesa con los posts
 */
export async function getBlogPostsFromServer(page = 1, perPage = 10) {
  try {
    console.log(`Obteniendo posts de blog desde ${WP_PROXY_URL}/posts (página ${page}, ${perPage} por página)`);
    
    const url = `${WP_PROXY_URL}/posts?page=${page}&per_page=${perPage}&_embed`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en respuesta de WordPress: ${response.status}`, errorText);
      throw new Error(`Error en la respuesta de WordPress: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Obtener los headers para el total de páginas y posts
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || posts.length);
    
    return {
      posts,
      totalPages,
      totalPosts
    };
  } catch (error) {
    console.error('Error en getBlogPostsFromServer:', error);
    throw new Error('Error al obtener los posts');
  }
}

/**
 * Obtiene un post específico por su slug con reintentos
 * @param {string} slug - Slug del post
 * @param {number} retries - Número de reintentos (por defecto 5)
 * @returns {Promise} - Promesa con el post
 */
export async function getBlogPostBySlug(slug, retries = 5) {
  try {
    // Construir URL para usar el proxy moderno
    const url = `${WP_PROXY_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`;
    
    console.log(`Obteniendo post por slug desde ${url}`);
    
    // Añadir timeout para evitar que la petición se quede colgada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
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