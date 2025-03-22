/**
 * API para obtener posts del blog desde WordPress
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
import config from '@/config/config';

export default async function handler(req, res) {
  console.log('[blogs] Recibida petición para obtener posts del blog');
  
  // Configurar headers CORS y caché
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const baseUrl = config.getWordPressBaseUrl();
    const url = `${baseUrl}/posts`;

    console.log('Intentando obtener blogs desde:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error de WordPress: ${response.status} ${response.statusText}`);
    }

    // Obtener los headers para el total de páginas
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
    
    // Enviar headers de paginación
    if (totalItems) {
      res.setHeader('X-WP-Total', totalItems);
    }
    if (totalPages) {
      res.setHeader('X-WP-TotalPages', totalPages);
    }
    
    console.log(`[blogs] ${data.length} blogs obtenidos correctamente`);
    
    // Devolver los datos
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error en blogs endpoint:', error);
    res.status(500).json({ error: error.message });
  }
} 