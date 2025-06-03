import axios from 'axios';

// Función para obtener todas las propiedades desde las APIs
export const fetchAllProperties = async () => {
  try {
    console.log('[Properties] Iniciando peticiones a las APIs...');
    console.log('[Properties] Intentando conectar con el backend en puerto 8081...');
    
    // Llamar solo a la API de MongoDB
    try {
      const mongoResponse = await axios.get('/api/properties/sources/mongodb', { timeout: 30000 });
      const mongoProperties = mongoResponse?.data || [];
      
      console.log('[Properties] Respuesta de MongoDB recibida:', mongoResponse.status);
      console.log('[Properties] Propiedades extraídas:', {
        mongo: mongoProperties.length
      });
      
      // Asegurarse de que sean arrays válidos
      const safeMongoProps = Array.isArray(mongoProperties) ? mongoProperties : [];

      // Marcar la fuente explícitamente
      const taggedMongoProps = safeMongoProps.map(p => ({ ...p, source: p.source || 'mongodb' }));

      console.log(`[Properties] Se obtuvieron ${taggedMongoProps.length} propiedades en total (MongoDB: ${taggedMongoProps.length})`);
      
      // Si no hay propiedades, devolver array vacío
      if (taggedMongoProps.length === 0) {
        console.warn('[Properties] No se encontraron propiedades en MongoDB');
        return [];
      }
      
      return taggedMongoProps;
      
    } catch (mongoError) {
      console.error('[Properties] Error API MongoDB:', mongoError.response?.data || mongoError.message);
      if (mongoError.code === 'ECONNREFUSED') {
        console.error('[Properties] No se puede conectar al backend. ¿Está corriendo en el puerto 8081?');
      }
      return [];
    }
    
  } catch (error) {
    console.error('[Properties] Error al obtener propiedades:', error);
    // Devolver array vacío en caso de error
    return [];
  }
};

// Función para normalizar las propiedades y asegurar que tengan la estructura correcta
export const normalizeProperty = (property) => {
  // Función auxiliar para obtener coordenadas
  const getCoordinates = (prop) => {
    // Intentar obtener coordenadas de diferentes campos posibles
    if (prop.coordinates) {
      return prop.coordinates;
    }
    if (prop.lat && prop.lng) {
      return { lat: parseFloat(prop.lat), lng: parseFloat(prop.lng) };
    }
    if (prop.latitude && prop.longitude) {
      return { lat: parseFloat(prop.latitude), lng: parseFloat(prop.longitude) };
    }
    if (prop.location && prop.location.lat && prop.location.lng) {
      return { lat: parseFloat(prop.location.lat), lng: parseFloat(prop.location.lng) };
    }
    
    // Coordenadas por defecto para Madrid centro si no hay datos
    return { lat: 40.4168, lng: -3.7038 };
  };

  // Función auxiliar para obtener imagen
  const getImage = (prop) => {
    if (prop.image) return prop.image;
    if (prop.images && Array.isArray(prop.images) && prop.images.length > 0) {
      const firstImage = prop.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage.url) return firstImage.url;
      if (firstImage.src) return firstImage.src;
    }
    if (prop.featured_image) return prop.featured_image;
    if (prop.thumbnail) return prop.thumbnail;
    
    // Imagen por defecto
    return "/analisis.png";
  };

  // Función auxiliar para obtener precio
  const getPrice = (prop) => {
    if (prop.price) return prop.price.toString();
    if (prop.regular_price) return prop.regular_price.toString();
    if (prop.sale_price) return prop.sale_price.toString();
    if (prop.meta && prop.meta.price) return prop.meta.price.toString();
    
    return "Consultar";
  };

  // Función auxiliar para obtener ubicación
  const getLocation = (prop) => {
    if (prop.location && typeof prop.location === 'string') return prop.location;
    if (prop.address) return prop.address;
    if (prop.meta && prop.meta.location) return prop.meta.location;
    if (prop.meta && prop.meta.address) return prop.meta.address;
    
    // Buscar en meta_data
    if (prop.meta_data && Array.isArray(prop.meta_data)) {
      const addressMeta = prop.meta_data.find(meta => 
        meta.key === 'address' || meta.key === 'direccion' || meta.key === 'ubicacion' || meta.key === 'Ubicación'
      );
      if (addressMeta && addressMeta.value) {
        if (typeof addressMeta.value === 'string') {
          return addressMeta.value;
        } else if (typeof addressMeta.value === 'object' && addressMeta.value.address) {
          return addressMeta.value.address;
        }
      }
    }
    
    // Extraer ubicación del título si contiene "en"
    if (prop.title || prop.name) {
      const title = prop.title || prop.name;
      const locationMatch = title.match(/en\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
      if (locationMatch && locationMatch[1]) {
        return `${locationMatch[1]}, Madrid, España`;
      }
    }
    
    return "Madrid, España";
  };

  // Función auxiliar para obtener número de habitaciones
  const getBedrooms = (prop) => {
    if (prop.features && prop.features.bedrooms) return parseInt(prop.features.bedrooms);
    if (prop.bedrooms) return parseInt(prop.bedrooms);
    if (prop.rooms) return parseInt(prop.rooms);
    if (prop.meta && prop.meta.bedrooms) return parseInt(prop.meta.bedrooms);
    if (prop.meta && prop.meta.rooms) return parseInt(prop.meta.rooms);
    
    // Buscar en meta_data
    if (prop.meta_data && Array.isArray(prop.meta_data)) {
      const bedroomMeta = prop.meta_data.find(meta => 
        meta.key === 'bedrooms' || meta.key === 'habitaciones' || meta.key === 'dormitorios'
      );
      if (bedroomMeta && bedroomMeta.value) return parseInt(bedroomMeta.value);
    }
    
    // Buscar en la descripción
    if (prop.description) {
      const bedroomMatch = prop.description.match(/(\d+)\s*(?:habitacion|dormitorio|bedroom)/i);
      if (bedroomMatch) return parseInt(bedroomMatch[1]);
    }
    
    return 2; // Por defecto
  };

  // Función auxiliar para obtener número de baños
  const getBathrooms = (prop) => {
    if (prop.features && prop.features.bathrooms) return parseInt(prop.features.bathrooms);
    if (prop.bathrooms) return parseInt(prop.bathrooms);
    if (prop.baths) return parseInt(prop.baths);
    if (prop.meta && prop.meta.bathrooms) return parseInt(prop.meta.bathrooms);
    if (prop.meta && prop.meta.baths) return parseInt(prop.meta.baths);
    
    // Buscar en meta_data
    if (prop.meta_data && Array.isArray(prop.meta_data)) {
      const bathroomMeta = prop.meta_data.find(meta => 
        meta.key === 'baños' || meta.key === 'banos' || meta.key === 'bathrooms' || meta.key === 'wc'
      );
      if (bathroomMeta && bathroomMeta.value) return parseInt(bathroomMeta.value);
    }
    
    // Buscar en la descripción
    if (prop.description) {
      const bathroomMatch = prop.description.match(/(\d+)\s*(?:baño|bath|aseo)/i);
      if (bathroomMatch) return parseInt(bathroomMatch[1]);
    }
    
    return 1; // Por defecto
  };

  // Función auxiliar para obtener superficie
  const getSize = (prop) => {
    if (prop.features && prop.features.area) return parseInt(prop.features.area);
    if (prop.size) return parseInt(prop.size);
    if (prop.area) return parseInt(prop.area);
    if (prop.surface) return parseInt(prop.surface);
    if (prop.meta && prop.meta.size) return parseInt(prop.meta.size);
    if (prop.meta && prop.meta.area) return parseInt(prop.meta.area);
    
    // Buscar en meta_data
    if (prop.meta_data && Array.isArray(prop.meta_data)) {
      const areaMeta = prop.meta_data.find(meta => 
        meta.key === 'living_area' || meta.key === 'area' || meta.key === 'm2' || meta.key === 'metros' || meta.key === 'superficie'
      );
      if (areaMeta && areaMeta.value) return parseInt(areaMeta.value);
    }
    
    // Buscar en la descripción
    if (prop.description) {
      const areaMatch = prop.description.match(/(\d+)\s*m[²2]?/i);
      if (areaMatch) return parseInt(areaMatch[1]);
    }
    
    return 80; // Por defecto
  };

  return {
    id: property.id || property._id || Math.random().toString(36).substr(2, 9),
    title: property.title || property.name || "Propiedad en Madrid",
    location: getLocation(property),
    price: getPrice(property),
    bedrooms: getBedrooms(property),
    bathrooms: getBathrooms(property),
    size: getSize(property),
    coordinates: getCoordinates(property),
    image: getImage(property),
    source: property.source || 'unknown'
  };
};

// Función para calcular similitud entre ubicaciones
const calculateLocationSimilarity = (propertyLocation, searchLocation) => {
  if (!propertyLocation || !searchLocation) return 0;
  
  const propLoc = propertyLocation.toLowerCase().trim();
  const searchLoc = searchLocation.toLowerCase().trim();
  
  // Coincidencia exacta
  if (propLoc === searchLoc) return 1;
  
  // Contiene la búsqueda
  if (propLoc.includes(searchLoc) || searchLoc.includes(propLoc)) return 0.9;
  
  // Dividir en palabras y buscar coincidencias
  const propWords = propLoc.split(/[,\s]+/).filter(w => w.length > 2);
  const searchWords = searchLoc.split(/[,\s]+/).filter(w => w.length > 2);
  
  let matchCount = 0;
  searchWords.forEach(searchWord => {
    propWords.forEach(propWord => {
      if (propWord.includes(searchWord) || searchWord.includes(propWord)) {
        matchCount++;
      }
    });
  });
  
  if (matchCount > 0) {
    return 0.7 * (matchCount / Math.max(propWords.length, searchWords.length));
  }
  
  return 0;
};

// Función para filtrar propiedades según criterios de búsqueda
export const filterProperties = (properties, filters) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.filter(property => {
    const normalizedProperty = normalizeProperty(property);
    
    // Filtro por ubicación inteligente
    let matchesLocation = true;
    if (filters.location && filters.location.trim()) {
      const locationSimilarity = calculateLocationSimilarity(
        normalizedProperty.location, 
        filters.location
      );
      
      // También buscar en el título
      const titleSimilarity = normalizedProperty.title ? 
        calculateLocationSimilarity(normalizedProperty.title, filters.location) : 0;
      
      // Considerar que coincide si la similitud es mayor a 0.3
      matchesLocation = locationSimilarity > 0.3 || titleSimilarity > 0.3;
    }
    
    // Filtro por precio mínimo
    const price = parseFloat(normalizedProperty.price.replace(/[^\d]/g, '')) || 0;
    const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
    
    // Filtro por precio máximo
    const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);
    
    // Filtro por dormitorios
    const matchesBedrooms = !filters.bedrooms || 
      normalizedProperty.bedrooms >= parseInt(filters.bedrooms);
    
    // Filtro por baños
    const matchesBathrooms = !filters.bathrooms || 
      normalizedProperty.bathrooms >= parseInt(filters.bathrooms);
    
    // Filtro por superficie
    const matchesSize = !filters.minSize || 
      normalizedProperty.size >= parseInt(filters.minSize);
    
    return matchesLocation && matchesMinPrice && matchesMaxPrice && 
           matchesBedrooms && matchesBathrooms && matchesSize;
  });
}; 