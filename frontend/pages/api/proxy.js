import axios from 'axios';

// Configuración de las API externas
const API_CONFIGS = {
  mongodb: {
    baseUrl: process.env.MONGODB_URL || 'https://api.realestategozamadrid.com',
    pathPrefix: '/api'
  },
  woocommerce: {
    baseUrl: process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
    pathPrefix: ''
  }
};

/**
 * API proxy para evitar problemas CORS y HEAD
 * 
 * Ejemplo de uso:
 * - /api/proxy?source=mongodb&path=/properties&page=1&limit=12
 * - /api/proxy?source=woocommerce&path=/products
 */
export default async function handler(req, res) {
  // Solo permitir peticiones GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { source, path, ...params } = req.query;
    
    // Validar fuente
    if (!source || !API_CONFIGS[source]) {
      return res.status(400).json({ error: 'Fuente no válida' });
    }
    
    // Validar ruta
    if (!path) {
      return res.status(400).json({ error: 'Ruta no especificada' });
    }
    
    // Construir URL
    const config = API_CONFIGS[source];
    const targetPath = `${config.pathPrefix}${path.startsWith('/') ? path : `/${path}`}`;
    const targetUrl = `${config.baseUrl}${targetPath}`;
    
    console.log(`[Proxy API] Redirigiendo petición a: ${targetUrl}`);
    
    // Realizar petición
    const response = await axios.get(targetUrl, { 
      params,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Devolver respuesta
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('[Proxy API] Error:', error.message);
    
    // Devolver error formateado
    return res.status(error.response?.status || 500).json({
      error: error.message,
      source: error.response?.data || 'No hay datos adicionales'
    });
  }
} 