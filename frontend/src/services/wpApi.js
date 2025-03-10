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
      // En el servidor, usamos directamente la API de WordPress para evitar problemas con URLs relativas
      baseUrl = 'https://realestategozamadrid.com/wp-json/wp/v2';
    } else {
      // En el cliente, usamos nuestro proxy
      baseUrl = '/api/wordpress-proxy?endpoint=wp&path=';
    }
    
    // Construir la URL completa
    const url = isServer 
      ? `${baseUrl}/posts?page=${page}&per_page=${perPage}&_embed` 
      : `${baseUrl}posts&page=${page}&per_page=${perPage}&_embed=true`;
    
    console.log(`WP API: URL de petición (${isServer ? 'servidor' : 'cliente'}): ${url}`);
    
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Evitar caché en Next.js
      }
    );
    
    if (!response.ok) {
      console.error(`Error en la respuesta de WordPress: ${response.status} ${response.statusText}`);
      throw new Error('Error al obtener los posts');
    }
    
    const postsData = await response.json();
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    
    console.log(`Obtenidos ${postsData.length} posts de WordPress con éxito`);
    
    // Procesar los posts para garantizar que no hay objetos directos en ningún campo
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
    return { posts: [], totalPages: 0 };
  }
};

/**
 * Obtiene un post específico por su slug
 * @param {string} slug - Slug del post
 * @returns {Promise} - Promesa con el post
 */
export async function getBlogPostBySlug(slug) {
  try {
    console.log(`WP API: Buscando blog con slug "${slug}"`);
    
    // Determinar si estamos en el servidor o en el cliente
    const isServer = typeof window === 'undefined';
    
    // Construir la URL base según el entorno
    let baseUrl = '';
    if (isServer) {
      // En el servidor, usamos directamente la API de WordPress para evitar problemas con URLs relativas
      baseUrl = 'https://realestategozamadrid.com/wp-json/wp/v2';
    } else {
      // En el cliente, usamos nuestro proxy
      baseUrl = '/api/wordpress-proxy?endpoint=wp&path=';
    }
    
    // Construir la URL completa
    const url = isServer 
      ? `${baseUrl}/posts?slug=${encodeURIComponent(slug)}&_embed` 
      : `${baseUrl}posts&slug=${encodeURIComponent(slug)}&_embed=true`;
    
    console.log(`WP API: URL de petición (${isServer ? 'servidor' : 'cliente'}): ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Evitar caché en Next.js
    });
    
    if (!response.ok) {
      console.error(`Error al obtener el post: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener el post: ${response.status}`);
    }
    
    const posts = await response.json();
    console.log(`WP API: Respuesta recibida, posts encontrados: ${posts.length}`);
    
    // Si encontramos el post, procesar sus campos
    if (posts && posts.length > 0) {
      const post = posts[0];
      console.log(`WP API: Post encontrado: ID=${post.id}, título="${post.title?.rendered}"`);
      
      // Procesar todos los campos que podrían ser objetos
      post.title = safeRenderValue(post.title);
      post.content = safeRenderValue(post.content);
      post.excerpt = safeRenderValue(post.excerpt);
      
      // Obtener la imagen destacada correctamente
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const featuredMedia = post._embedded['wp:featuredmedia'][0];
        
        // Añadir un campo de imagen más accesible usando la API simple
        if (featuredMedia.source_url) {
          post.imageUrl = `/api?url=${encodeURIComponent(featuredMedia.source_url)}`;
        }
      }
      
      // Procesar contenido para usar el proxy en todas las imágenes
      if (post.content && post.content.rendered) {
        // Reemplazar todas las imágenes en el contenido HTML para usar el proxy
        post.content.rendered = post.content.rendered.replace(
          /<img(.+?)src="([^"]+)"(.+?)>/g,
          (match, prefix, src, suffix) => {
            // No procesar imágenes que ya son locales
            if (src.startsWith('/') || src.startsWith('data:')) {
              return match;
            }
            return `<img${prefix}src="/api?url=${encodeURIComponent(src)}"${suffix}>`;
          }
        );
      }
      
      return post;
    }
    
    console.log(`WP API: No se encontró ningún post con slug "${slug}"`);
    return null;
  } catch (error) {
    console.error('Error en getBlogPostBySlug:', error);
    return null;
  }
}

// En la función que transforma los posts de WordPress
export function transformWordPressPost(wpPost, cleanSlug) {
  // Código existente...
  
  // Reemplazar la función getImageUrl para asegurar que todas las imágenes usen el proxy
  const getImageUrl = (post) => {
    let imageUrl = null;
    
    // Intentar obtener la imagen destacada
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
      const media = post._embedded['wp:featuredmedia'][0];
      
      // Intentar diferentes tamaños de imagen
      if (media.media_details && media.media_details.sizes) {
        // Preferir tamaños en este orden
        const sizes = ['large', 'medium_large', 'medium', 'thumbnail', 'full'];
        
        for (const size of sizes) {
          if (media.media_details.sizes[size]) {
            imageUrl = media.media_details.sizes[size].source_url;
            break;
          }
        }
      }
      
      // Si no se encontró ningún tamaño específico, usar la URL estándar
      if (!imageUrl && media.source_url) {
        imageUrl = media.source_url;
      }
    }
    
    // Buscar en uagb_featured_image_src como alternativa
    if (!imageUrl && post.uagb_featured_image_src) {
      for (const size in post.uagb_featured_image_src) {
        if (post.uagb_featured_image_src[size] && Array.isArray(post.uagb_featured_image_src[size])) {
          imageUrl = post.uagb_featured_image_src[size][0];
          break;
        }
      }
    }
    
    // Buscar en el contenido como último recurso
    if (!imageUrl && post.content && post.content.rendered) {
      const imgMatch = post.content.rendered.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }
    }
    
    // Siempre utilizar el proxy para URLs externas
    return imageUrl ? proxyImage(imageUrl) : '/img/default-logo.png';
  };

  // Resto del código de transformación...
  
  return {
    // Resto de las propiedades...
    imageUrl: getImageUrl(wpPost),
    // ...
  };
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