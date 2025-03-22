import fetch from 'node-fetch';

const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeout = 15000 * (attempt + 1);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      console.log(`[MongoDB Proxy] Intento ${attempt + 1} para ${url}`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'GozaMadrid/1.0 (Node.js)',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[MongoDB Proxy] Error en intento ${attempt + 1}:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const MONGODB_API_URL = process.env.NEXT_PUBLIC_MONGODB_API_URL || 'https://gozamadrid-backend.onrender.com/api/properties';
    
    console.log('[MongoDB Proxy] Iniciando petición a:', MONGODB_API_URL);

    const data = await fetchWithRetry(MONGODB_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://www.realestategozamadrid.com'
      }
    });

    // Verificar que la respuesta es un array
    if (!Array.isArray(data)) {
      console.error('[MongoDB Proxy] Respuesta no es un array:', data);
      return res.status(500).json({ 
        error: 'Formato de respuesta inválido',
        details: typeof data
      });
    }

    // Añadir source y type a cada propiedad
    const properties = data.map(property => ({
      ...property,
      source: 'mongodb',
      type: 'mongodb'
    }));

    console.log(`[MongoDB Proxy] Obtenidas ${properties.length} propiedades`);

    // Cachear la respuesta por 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(properties);

  } catch (error) {
    console.error('[MongoDB Proxy] Error:', error);
    return res.status(500).json({ 
      error: 'Error al obtener propiedades de MongoDB',
      details: error.message 
    });
  }
} 