/**
 * Integración con APIs a través de proxies en Cloudflare Pages
 * 
 * Este archivo utiliza los proxies de Cloudflare Pages para
 * acceder a las APIs externas de forma segura y optimizada.
 */

// URLs para proxies
const WP_PROXY_URL = '/api/proxy?service=wordpress';
const WC_PROXY_URL = '/api/proxy?service=woocommerce';

// Timeout para solicitudes API
const API_TIMEOUT = 60000; // 60 segundos

/**
 * Función para manejar el timeout en fetch
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);
  
  try {
    console.log(`Realizando petición a: ${url}`);
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('La petición ha excedido el tiempo máximo');
    }
    throw error;
  }
};

/**
 * Función para obtener propiedades inmobiliarias (productos de WooCommerce)
 */
export const getProperties = async (filters = {}) => {
  // Construir URL para el proxy de WooCommerce
  let url = `${WC_PROXY_URL}&resource=products`;
  
  // Añadir filtros como parámetros de consulta
  Object.entries(filters).forEach(([key, value]) => {
    url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  });
  
  try {
    console.log(`Solicitando propiedades desde: ${url}`);
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    // En caso de error, devolver array vacío en lugar de lanzar error
    return [];
  }
};

/**
 * Función para obtener una propiedad específica por ID
 */
export const getProperty = async (id) => {
  if (!id) return null;
  
  const url = `${WC_PROXY_URL}&resource=products&id=${encodeURIComponent(id)}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching property #${id}:`, error);
    return null;
  }
};

/**
 * Función para obtener los posts del blog
 */
export const getBlogPosts = async (page = 1, perPage = 10) => {
  // Construir URL para el proxy de WordPress
  const url = `${WP_PROXY_URL}&resource=posts&page=${page}&per_page=${perPage}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    });
    
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const posts = await response.json();
    
    return { posts, totalPages };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // En caso de error, devolver array vacío en lugar de lanzar error
    return { posts: [], totalPages: 0 };
  }
};

/**
 * Función para obtener un post específico del blog
 */
export const getBlogPost = async (slug) => {
  if (!slug) return null;
  
  // Construir URL para el proxy de WordPress
  const url = `${WP_PROXY_URL}&resource=posts&slug=${encodeURIComponent(slug)}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    });
    
    const posts = await response.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    // En caso de error, devolver null en lugar de lanzar error
    return null;
  }
};

/**
 * Función para obtener categorías del blog
 */
export const getBlogCategories = async () => {
  const url = `${WP_PROXY_URL}&resource=categories`;
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }
};

/**
 * Envía un formulario de contacto
 * @param {Object} formData - Datos del formulario (nombre, email, mensaje)
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const submitContactForm = async (formData) => {
  try {
    const response = await fetchWithTimeout('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al enviar el formulario de contacto:', error);
    throw error;
  }
};

// Exportar objeto con funciones de API
const api = {
  getProperties,
  getProperty,
  getBlogPosts,
  getBlogPost,
  getBlogCategories,
  submitContactForm
};

export default api; 