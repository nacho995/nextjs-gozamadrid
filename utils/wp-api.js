/**
 * Utilidad para hacer llamadas a la API de WordPress a través del proxy
 * Evita problemas de CORS y centraliza la lógica de las llamadas
 */

/**
 * Obtiene datos de la API de WordPress a través del proxy
 * @param {string} endpoint - El endpoint de la API de WordPress (sin la URL base)
 * @param {Object} params - Parámetros de consulta para la solicitud
 * @param {Object} options - Opciones adicionales (headers, método, etc.)
 * @returns {Promise<any>} - Los datos de la respuesta
 */
export async function fetchFromWordPress(endpoint, params = {}, options = {}) {
  try {
    // Preparar la URL del proxy con el endpoint
    const url = `/api/proxy/wordpress/${endpoint}`;
    
    // Configurar opciones por defecto
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Combinar opciones predeterminadas con las proporcionadas
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };
    
    // Añadir parámetros a la URL como query params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    // Construir URL final con parámetros
    const finalUrl = `${url}?${queryParams.toString()}`;
    
    // Realizar la solicitud
    const response = await fetch(finalUrl, fetchOptions);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error en la API de WordPress: ${response.status} ${response.statusText}`);
    }
    
    // Devolver datos en formato JSON
    return await response.json();
  } catch (error) {
    console.error('Error al obtener datos de WordPress:', error);
    throw error;
  }
}

/**
 * Obtiene un post específico por su ID
 * @param {string|number} id - ID del post a obtener
 * @returns {Promise<any>} - Datos del post
 */
export async function getPostById(id) {
  return fetchFromWordPress(`posts/${id}`, { _embed: 'true' });
}

/**
 * Obtiene un post específico por su slug
 * @param {string} slug - Slug del post a obtener
 * @returns {Promise<any>} - Datos del post
 */
export async function getPostBySlug(slug) {
  return fetchFromWordPress('posts', { slug, _embed: 'true' });
}

/**
 * Obtiene una lista de posts
 * @param {Object} options - Opciones para filtrar posts
 * @returns {Promise<any>} - Lista de posts
 */
export async function getPosts(options = {}) {
  const defaultOptions = {
    per_page: 10,
    page: 1,
    _embed: 'true',
  };
  
  return fetchFromWordPress('posts', { ...defaultOptions, ...options });
}

/**
 * Obtiene categorías de posts
 * @param {Object} options - Opciones para filtrar categorías
 * @returns {Promise<any>} - Lista de categorías
 */
export async function getCategories(options = {}) {
  return fetchFromWordPress('categories', options);
}

/**
 * Obtiene etiquetas de posts
 * @param {Object} options - Opciones para filtrar etiquetas
 * @returns {Promise<any>} - Lista de etiquetas
 */
export async function getTags(options = {}) {
  return fetchFromWordPress('tags', options);
}

/**
 * Busca posts
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<any>} - Resultados de la búsqueda
 */
export async function searchPosts(searchTerm, options = {}) {
  return fetchFromWordPress('posts', { search: searchTerm, ...options, _embed: 'true' });
} 