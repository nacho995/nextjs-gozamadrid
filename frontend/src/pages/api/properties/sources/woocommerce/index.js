import axios from 'axios';

// 🏠 CONFIGURACIÓN SIMPLIFICADA PARA EVITAR TIMEOUTS
const REAL_ESTATE_CONFIG = {
  endpoints: [
    process.env.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3'
  ],
  credentials: {
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  },
  connection: {
    timeout: 5000, // 5 segundos - muy corto para evitar timeouts
    maxRetries: 1, // Solo 1 intento
    retryDelay: 500 // Delay mínimo
  }
};

// 🔧 Transformador ultra-simplificado
const transformRealProperty = (property) => {
  try {
    console.log(`🔧 Transformando propiedad ID: ${property.id}, Name: ${property.name}`);
    
    const transformed = {
      id: String(property.id),
      title: property.name || `Propiedad ${property.id}`,
      description: property.short_description || '',
      price: parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0,
      source: 'woocommerce',
      images: property.images?.slice(0, 1).map(img => ({
        url: img.url || img.src,
        alt: property.name || 'Imagen'
      })) || [],
      features: { 
        bedrooms: 2, 
        bathrooms: 1, 
        area: 80 
      },
      location: property.name || 'Madrid',
      address: property.name || '',
      createdAt: property.date_created || new Date().toISOString()
    };
    
    console.log(`✅ Propiedad transformada: ${transformed.title}`);
    return transformed;
  } catch (error) {
    console.error('❌ Error transformando:', error.message);
    return null;
  }
};

// 🚀 Función ultra-simplificada
export const loadRealProperties = async (page = 1, limit = 5) => {
  console.log(`🏠 Cargando propiedades SIMPLES - Página: ${page}, Límite: ${limit}`);
  
  const endpointToTry = REAL_ESTATE_CONFIG.endpoints[0];
  
  try {
    console.log(`🔄 Intento único: ${endpointToTry}`);
    
    const response = await axios.get(`${endpointToTry}/products`, {
      params: {
        consumer_key: REAL_ESTATE_CONFIG.credentials.key,
        consumer_secret: REAL_ESTATE_CONFIG.credentials.secret,
        per_page: Math.min(limit, 10), // Máximo 10
        page,
        status: 'publish'
      },
      timeout: REAL_ESTATE_CONFIG.connection.timeout,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`📊 Datos recibidos: ${response.data.length} productos`);
      console.log(`📊 Primer producto:`, JSON.stringify(response.data[0], null, 2));
      
      const realProperties = response.data
        .map(transformRealProperty)
        .filter(Boolean);
      
      console.log(`✅ ÉXITO: ${realProperties.length} propiedades cargadas de ${response.data.length} productos`);
      return realProperties;
    } else {
      console.error(`❌ Respuesta inválida: Status ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error cargando propiedades:`, error.message);
    return [];
  }
};

// 🎯 HANDLER ULTRA-SIMPLIFICADO
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 5, page = 1 } = req.query;

  console.log(`🏠 API Handler SIMPLE iniciada - Página: ${page}, Límite: ${limit}`);
  
  // Verificar credenciales
  if (!REAL_ESTATE_CONFIG.credentials.key || !REAL_ESTATE_CONFIG.credentials.secret) {
    console.warn('⚠️ Sin credenciales WooCommerce');
    res.setHeader('X-WooCommerce-Status', 'no-credentials');
    return res.status(200).json([]);
  }
  
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.setHeader('Content-Type', 'application/json');

  try {
    const realProperties = await loadRealProperties(parseInt(page), parseInt(limit));
    const duration = Date.now() - startTime;
    
    console.log(`🎉 ÉXITO: ${realProperties.length} propiedades en ${duration}ms`);
    res.setHeader('X-WooCommerce-Status', 'success');
    res.setHeader('X-Response-Time', `${duration}ms`);
    return res.status(200).json(realProperties);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR: ${error.message} en ${duration}ms`);
    
    res.setHeader('X-WooCommerce-Status', 'error');
    res.setHeader('X-Response-Time', `${duration}ms`);
    return res.status(200).json([]);
  }
}