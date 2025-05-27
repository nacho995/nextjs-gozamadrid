import axios from 'axios';

// Función para obtener todas las propiedades desde las APIs
export const fetchAllProperties = async () => {
  try {
    console.log('[Properties] Iniciando peticiones a las APIs...');
    console.log('[Properties] Intentando conectar con el backend en puerto 8081...');
    
    // Llamar a las APIs del backend que se encargan de obtener datos de MongoDB y WooCommerce
    const [mongoResponse, wooResponse] = await Promise.allSettled([
      axios.get('/api/properties/sources/mongodb', { timeout: 30000 }).catch(err => {
        console.error('[Properties] Error API MongoDB:', err.response?.data || err.message);
        if (err.code === 'ECONNREFUSED') {
          console.error('[Properties] No se puede conectar al backend. ¿Está corriendo en el puerto 8081?');
        }
        throw err; // Lanzar el error para que Promise.allSettled lo capture
      }),
      axios.get('/api/properties/sources/woocommerce', { timeout: 30000 }).catch(err => {
        console.error('[Properties] Error API WooCommerce:', err.response?.data || err.message);
        if (err.code === 'ECONNREFUSED') {
          console.error('[Properties] No se puede conectar al backend. ¿Está corriendo en el puerto 8081?');
        }
        throw err; // Lanzar el error para que Promise.allSettled lo capture
      })
    ]);

    console.log('[Properties] Respuestas recibidas:', {
      mongo: mongoResponse.status,
      woo: wooResponse.status
    });

    // Solo procesar respuestas exitosas
    const mongoProperties = mongoResponse.status === 'fulfilled' ? (mongoResponse.value?.data || []) : [];
    const wooCommerceProperties = wooResponse.status === 'fulfilled' ? (wooResponse.value?.data || []) : [];
    
    console.log('[Properties] Propiedades extraídas:', {
      mongo: mongoProperties.length,
      woo: wooCommerceProperties.length
    });
    
    // Asegurarse de que sean arrays válidos
    const safeMongoProps = Array.isArray(mongoProperties) ? mongoProperties : [];
    const safeWooProps = Array.isArray(wooCommerceProperties) ? wooCommerceProperties : [];

    // Marcar la fuente explícitamente
    const taggedMongoProps = safeMongoProps.map(p => ({ ...p, source: p.source || 'mongodb' }));
    const taggedWooProps = safeWooProps.map(p => ({ ...p, source: p.source || 'woocommerce' }));

    const allProperties = [...taggedMongoProps, ...taggedWooProps];

    console.log(`[Properties] Se obtuvieron ${allProperties.length} propiedades en total (MongoDB: ${taggedMongoProps.length}, WooCommerce: ${taggedWooProps.length})`);
    
    // Si no hay propiedades de ninguna fuente, devolver array vacío
    if (allProperties.length === 0) {
      console.warn('[Properties] No se encontraron propiedades en ninguna API');
      return [];
    }
    
    return allProperties;
    
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
      if (firstImage.src) return firstImage.src;
      if (firstImage.url) return firstImage.url;
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
    
    return "Madrid, España";
  };

  // Función auxiliar para obtener número de habitaciones
  const getBedrooms = (prop) => {
    if (prop.bedrooms) return parseInt(prop.bedrooms);
    if (prop.rooms) return parseInt(prop.rooms);
    if (prop.meta && prop.meta.bedrooms) return parseInt(prop.meta.bedrooms);
    if (prop.meta && prop.meta.rooms) return parseInt(prop.meta.rooms);
    
    return 2; // Por defecto
  };

  // Función auxiliar para obtener número de baños
  const getBathrooms = (prop) => {
    if (prop.bathrooms) return parseInt(prop.bathrooms);
    if (prop.baths) return parseInt(prop.baths);
    if (prop.meta && prop.meta.bathrooms) return parseInt(prop.meta.bathrooms);
    if (prop.meta && prop.meta.baths) return parseInt(prop.meta.baths);
    
    return 1; // Por defecto
  };

  // Función auxiliar para obtener superficie
  const getSize = (prop) => {
    if (prop.size) return parseInt(prop.size);
    if (prop.area) return parseInt(prop.area);
    if (prop.surface) return parseInt(prop.surface);
    if (prop.meta && prop.meta.size) return parseInt(prop.meta.size);
    if (prop.meta && prop.meta.area) return parseInt(prop.meta.area);
    
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

// Función para filtrar propiedades según criterios de búsqueda
export const filterProperties = (properties, filters) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.filter(property => {
    const normalizedProperty = normalizeProperty(property);
    
    // Filtro por ubicación
    const matchesLocation = !filters.location || 
      normalizedProperty.location.toLowerCase().includes(filters.location.toLowerCase());
    
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