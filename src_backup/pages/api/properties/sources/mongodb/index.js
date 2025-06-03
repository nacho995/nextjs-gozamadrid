import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Determinar la URL base de la API según el entorno - usar la URL que funciona
const BASE_URL = 'https://nextjs-gozamadrid-qrfk.onrender.com';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

// Cargar coordenadas desde el archivo JSON
let coordinatesData = {};
try {
  const coordinatesPath = path.join(process.cwd(), 'coordinates-data.json');
  if (fs.existsSync(coordinatesPath)) {
    const rawData = fs.readFileSync(coordinatesPath, 'utf8');
    coordinatesData = JSON.parse(rawData).propertyCoordinates || {};
    console.log(`📍 Coordenadas cargadas para ${Object.keys(coordinatesData).length} propiedades`);
  }
} catch (error) {
  console.log('⚠️ No se pudieron cargar las coordenadas:', error.message);
}

// Función para encontrar coordenadas por título
const findCoordinatesForProperty = (title) => {
  if (!title) return null;
  
  // Buscar coincidencia exacta
  if (coordinatesData[title]) {
    return coordinatesData[title];
  }
  
  // Buscar coincidencia parcial
  for (const [key, coords] of Object.entries(coordinatesData)) {
    // Limpiar títulos para comparación
    const cleanTitle = title.toLowerCase().trim();
    const cleanKey = key.toLowerCase().trim();
    
    if (cleanTitle.includes(cleanKey) || cleanKey.includes(cleanTitle.split(',')[0].trim())) {
      return coords;
    }
  }
  
  return null;
};

// Funciones auxiliares
const formatMongoDBProperties = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => {
    // Agregar un identificador explícito para la fuente
    property.source = 'mongodb';
    
    // Buscar y agregar coordenadas si no las tiene
    if (!property.coordinates && property.title) {
      const coords = findCoordinatesForProperty(property.title);
      if (coords) {
        property.coordinates = {
          lat: coords.lat,
          lng: coords.lng
        };
        console.log(`📍 Coordenadas agregadas para: ${property.title} -> ${coords.lat}, ${coords.lng}`);
      }
    }
    
    return property;
  });
};

export default async function handler(req, res) {
  const { limit = 100, page = 1 } = req.query;

  console.log(`[API Route MongoDB] Solicitando lista de propiedades. Página: ${page}, Límite: ${limit}`);
  console.log(`[API Route MongoDB] Conectando a backend en: ${BASE_URL}`); // Log para verificar URL

  try {
    // Intentar obtener propiedades de MongoDB desde el backend correcto
    const response = await axios.get(
      `${BASE_URL}/api/properties`, // Usar la variable BASE_URL correcta
      {
        params: {
          limit,
          page
        },
        timeout: TIMEOUT
      }
    );

    // Extraer las propiedades del objeto de respuesta
    let properties = [];
    if (response.data && Array.isArray(response.data)) {
      properties = response.data;
    } else if (response.data && response.data.properties && Array.isArray(response.data.properties)) {
      properties = response.data.properties;
    } else if (response.data) {
      console.log('[API Route MongoDB] Estructura de respuesta no reconocida:', JSON.stringify(response.data).substring(0, 200) + '...');
      // Intentar extraer propiedades si la respuesta es un objeto
      if (typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            properties = response.data[key];
            console.log(`[API Route MongoDB] Encontradas propiedades en clave '${key}'`);
            break;
          }
        }
      }
    }
    
    // Formatear las propiedades para uso en la aplicación (incluyendo coordenadas)
    const formattedProperties = formatMongoDBProperties(properties);
    
    console.log(`[API Route MongoDB] ${formattedProperties.length} propiedades encontradas desde ${BASE_URL}`);
    console.log(`📍 Propiedades con coordenadas: ${formattedProperties.filter(p => p.coordinates).length}`);
    
    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error(`[API Route MongoDB] Error conectando con ${BASE_URL}:`, error.message);
    
    return res.status(500).json({
      error: 'Error al conectar con MongoDB',
      message: error.message,
      backend_url: BASE_URL,
      timestamp: new Date().toISOString()
    });
  }
} 