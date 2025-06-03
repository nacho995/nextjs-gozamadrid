// Ya no necesitamos importar node-fetch, usamos el fetch nativo de Node.js 18+
// import fetch from 'node-fetch';

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
      
      // Intentar parsear como JSON primero
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        // Si no es JSON, intentar obtener como texto
        console.error(`[MongoDB Proxy] Error al parsear JSON: ${jsonError.message}`);
        const text = await response.text();
        console.log(`[MongoDB Proxy] Respuesta como texto: ${text.substring(0, 200)}...`);
        throw new Error(`Respuesta no es JSON válido: ${jsonError.message}`);
      }
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
    // URLs principales para AWS Elastic Beanstalk que sabemos que funcionan
    const MONGODB_API_URL = 'https://nextjs-gozamadrid-qrfk.onrender.com/api/properties';
    
    console.log('[MongoDB Proxy] Iniciando petición a:', MONGODB_API_URL);

    // Añadir los parámetros de consulta si existen
    let url = new URL(MONGODB_API_URL);
    
    // Pasar los parámetros de la petición original
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (key !== 'slug') {
          url.searchParams.append(key, req.query[key]);
        }
      });
    }

    // Intentar obtener los datos
    try {
      const data = await fetchWithRetry(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://www.realestategozamadrid.com',
          'Referer': 'https://www.realestategozamadrid.com/'
        }
      });

      // Verificar formato de respuesta
      if (Array.isArray(data)) {
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
      } else if (data && typeof data === 'object') {
        // Si es un objeto con propiedades
        if (data.properties && Array.isArray(data.properties)) {
          const properties = data.properties.map(property => ({
            ...property,
            source: 'mongodb',
            type: 'mongodb'
          }));

          console.log(`[MongoDB Proxy] Obtenidas ${properties.length} propiedades desde data.properties`);
          res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
          return res.status(200).json(properties);
        }

        // Si no tiene campo properties pero es un objeto, devolver tal cual
        console.log('[MongoDB Proxy] Respuesta es un objeto, devolviendo tal cual');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
        return res.status(200).json(data);
      }

      // Si llegamos aquí, la respuesta tiene un formato desconocido
      console.error('[MongoDB Proxy] Formato de respuesta desconocido:', typeof data);
      return res.status(500).json({ 
        error: 'Formato de respuesta desconocido',
        details: typeof data,
        sample: JSON.stringify(data).substring(0, 200) + '...'
      });
    } catch (fetchError) {
      console.error('[MongoDB Proxy] Error obteniendo datos:', fetchError);
      
      // Intentar con URL alternativa
      console.log('[MongoDB Proxy] Primer intento falló, intentando con URL alternativa...');
      const alternativeUrl = 'https://nextjs-gozamadrid-qrfk.onrender.com/api/properties/sources/mongodb';
      
      try {
        const alternativeData = await fetchWithRetry(alternativeUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://www.realestategozamadrid.com',
            'Referer': 'https://www.realestategozamadrid.com/'
          }
        });
        
        if (Array.isArray(alternativeData)) {
          const properties = alternativeData.map(property => ({
            ...property,
            source: 'mongodb',
            type: 'mongodb'
          }));
          
          console.log(`[MongoDB Proxy] (Alternativa) Obtenidas ${properties.length} propiedades`);
          res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
          return res.status(200).json(properties);
        }
        
        // Si llegamos aquí y la URL alternativa también falló, devolver respuesta de error
        throw new Error('Ambos endpoints fallaron');
      } catch (alternativeError) {
        console.error('[MongoDB Proxy] Error con URL alternativa:', alternativeError);
        throw fetchError; // Rethrow del error original
      }
    }
  } catch (error) {
    console.error('[MongoDB Proxy] Error general:', error);
    
    // Respuesta de fallback: Devolver un array vacío en lugar de un error
    // Esto permite que la interfaz de usuario siga funcionando aunque no haya datos
    console.log('[MongoDB Proxy] Devolviendo array vacío como fallback');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json([]);
  }
} 