import config from '@/config/config';

const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000');
const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '5');

const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'GozaMadrid-Frontend/1.0',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`La petición a ${url} excedió el tiempo límite de ${timeout}ms`);
    }
    throw error;
  }
};

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  let lastError;
  let delay = 1000; // Empezar con 1 segundo de retraso
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Intento ${i + 1} de ${retries} para ${url}`);
      const response = await fetchWithTimeout(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Petición exitosa a ${url}`);
      return data;
    } catch (error) {
      console.error(`Intento ${i + 1} fallido para ${url}:`, error);
      lastError = error;
      
      // Si no es el último intento, esperar antes de reintentar
      if (i < retries - 1) {
        console.log(`Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 10000); // Incremento exponencial hasta máximo 10 segundos
      }
    }
  }
  
  console.error(`Todos los intentos fallaron para ${url}`);
  throw lastError;
};

// Función para obtener propiedades
export const getProperties = async (page = 1, limit = 12) => {
  try {
    console.log(`Obteniendo propiedades: página ${page}, límite ${limit}`);
    
    // Usar ruta relativa para evitar problemas de Mixed Content
    const url = `/api/properties?page=${page}&limit=${limit}`;
    console.log('URL completa:', url);
    
    const data = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`Propiedades obtenidas:`, data);
    return data;
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    throw error;
  }
};

// Función para obtener una propiedad específica
export const getProperty = async (id) => {
  try {
    console.log(`Obteniendo propiedad con ID: ${id}`);
    // Usar ruta relativa para evitar problemas de Mixed Content
    const url = `/api/properties/${id}`;
    console.log('URL completa:', url);
    
    const data = await fetchWithRetry(url);
    console.log(`Propiedad obtenida:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener propiedad ${id}:`, error);
    throw error;
  }
};

// Función para obtener posts del blog
export const getBlogPosts = async () => {
  try {
    const data = await fetchWithRetry(`${config.WP_API_URL}/posts`);
    return data;
  } catch (error) {
    console.error('Error al obtener posts del blog:', error);
    throw error;
  }
};

// Función para obtener un post específico del blog
export const getBlogById = async (id) => {
  try {
    const data = await fetchWithRetry(`${config.WP_API_URL}/posts/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener post del blog:', error);
    throw error;
  }
};

// Función para enviar email de propiedad
export const sendPropertyEmail = async (data) => {
  try {
    const response = await fetchWithRetry(`${config.API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

// Exportar todo como un objeto por defecto
const api = {
  getProperties,
  getProperty,
  getBlogPosts,
  getBlogById,
  sendPropertyEmail,
};

export default api; 