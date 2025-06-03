import axios from 'axios';

const EXTERNAL_API_URL = 'https://api.realestategozamadrid.com';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID no proporcionado' });
  }

  try {
    // Primero intentar con MongoDB
    try {
      console.log(`[API Properties] Intentando obtener propiedad de MongoDB con ID: ${id}`);
      const mongoResponse = await axios.get(`${EXTERNAL_API_URL}/api/properties/sources/mongodb/${id}`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (mongoResponse.data) {
        console.log('[API Properties] Propiedad encontrada en MongoDB');
        return res.status(200).json({
          ...mongoResponse.data,
          source: 'mongodb'
        });
      }
    } catch (mongoError) {
      console.log('[API Properties] No se encontró en MongoDB, intentando endpoint general');
    }

    // Si no se encuentra en MongoDB, intentar con el endpoint general
    const response = await axios.get(`${EXTERNAL_API_URL}/api/properties/${id}`, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    console.log('[API Properties] Propiedad encontrada en endpoint general');
    return res.status(200).json({
      ...response.data,
      source: 'general'
    });

  } catch (error) {
    console.error('[API Properties] Error al obtener propiedad:', error.message);
    
    // Si es un error 404, devolver ese estado específico
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        error: 'Propiedad no encontrada',
        details: error.message
      });
    }

    // Para otros errores, devolver 500
    return res.status(500).json({
      error: 'Error al obtener propiedad',
      details: error.message
    });
  }
} 