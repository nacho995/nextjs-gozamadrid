import axios from 'axios';

// Usar la variable de entorno para la URL de WooCommerce
const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const BASE_URL = WOOCOMMERCE_URL ? WOOCOMMERCE_URL.split('/wp-json/wc/v3')[0] : 'https://wordpress-1430059-5339263.cloudwaysapps.com';
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY;
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;

console.log('WOOCOMMERCE_URL:', WOOCOMMERCE_URL);
console.log('BASE_URL:', BASE_URL);

async function testWooCommerceConnection() {
  try {
    console.log('Intentando conectar a WooCommerce:', `${WOOCOMMERCE_URL}/products`);
    const response = await axios.get(`${WOOCOMMERCE_URL}/products`, {
      params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        per_page: 1
      },
      timeout: 5000
    });
    return {
      success: true,
      status: response.status,
      headers: response.headers,
      data: response.data
    };
  } catch (error) {
    console.error('Error en testWooCommerceConnection:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : null
      }
    };
  }
}

async function testWordPressConnection() {
  try {
    console.log('Intentando conectar a WordPress:', `${BASE_URL}/wp-json`);
    const response = await axios.get(`${BASE_URL}/wp-json`, {
      timeout: 5000
    });
    return {
      success: true,
      status: response.status,
      headers: response.headers,
      data: response.data
    };
  } catch (error) {
    console.error('Error en testWordPressConnection:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : null
      }
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      woocommerce_url: WOOCOMMERCE_URL,
      has_consumer_key: !!CONSUMER_KEY,
      has_consumer_secret: !!CONSUMER_SECRET
    },
    tests: {}
  };

  // Test 1: Verificar configuración
  diagnosticResults.tests.configuration = {
    name: 'Verificación de Configuración',
    success: true,
    details: []
  };

  if (!WOOCOMMERCE_URL) {
    diagnosticResults.tests.configuration.success = false;
    diagnosticResults.tests.configuration.details.push('URL de WooCommerce no configurada');
  }
  if (!CONSUMER_KEY) {
    diagnosticResults.tests.configuration.success = false;
    diagnosticResults.tests.configuration.details.push('Consumer Key no configurada');
  }
  if (!CONSUMER_SECRET) {
    diagnosticResults.tests.configuration.success = false;
    diagnosticResults.tests.configuration.details.push('Consumer Secret no configurada');
  }

  // Test 2: Conectividad básica WordPress
  diagnosticResults.tests.wordpress = {
    name: 'Conectividad WordPress',
    ...(await testWordPressConnection())
  };

  // Test 3: Conectividad WooCommerce API
  diagnosticResults.tests.woocommerce = {
    name: 'Conectividad WooCommerce API',
    ...(await testWooCommerceConnection())
  };

  // Test 4: Análisis de datos
  if (diagnosticResults.tests.woocommerce.success) {
    const productData = diagnosticResults.tests.woocommerce.data;
    diagnosticResults.tests.dataAnalysis = {
      name: 'Análisis de Datos',
      success: true,
      details: {
        hasProducts: Array.isArray(productData) && productData.length > 0,
        firstProduct: Array.isArray(productData) && productData.length > 0 ? {
          id: productData[0].id,
          hasName: !!productData[0].name,
          hasPrice: !!productData[0].price,
          hasImages: Array.isArray(productData[0].images) && productData[0].images.length > 0,
          hasMetaData: Array.isArray(productData[0].meta_data) && productData[0].meta_data.length > 0,
          metaDataFields: Array.isArray(productData[0].meta_data) ? 
            productData[0].meta_data.map(meta => meta.key) : []
        } : null
      }
    };
  }

  // Test 5: Verificación de endpoints
  const endpoints = [
    '/products',
    '/products/categories'
  ];

  let endpointSuccessCount = 0;
  diagnosticResults.tests.endpoints = {
    name: 'Verificación de Endpoints',
    success: false,
    results: {}
  };

  for (const endpoint of endpoints) {
    try {
      console.log('Probando endpoint:', `${WOOCOMMERCE_URL}${endpoint}`);
      const response = await axios.get(`${WOOCOMMERCE_URL}${endpoint}`, {
        params: {
          consumer_key: CONSUMER_KEY,
          consumer_secret: CONSUMER_SECRET,
          per_page: 1
        },
        timeout: 5000
      });
      diagnosticResults.tests.endpoints.results[endpoint] = {
        success: true,
        status: response.status,
        hasData: !!response.data
      };
      endpointSuccessCount++;
    } catch (error) {
      console.error(`Error al probar endpoint ${endpoint}:`, error);
      diagnosticResults.tests.endpoints.results[endpoint] = {
        success: false,
        error: {
          message: error.message,
          status: error.response?.status
        }
      };
    }
  }

  // Actualizar el estado general de endpoints
  diagnosticResults.tests.endpoints.success = endpointSuccessCount > 0;
  diagnosticResults.tests.endpoints.details = {
    totalEndpoints: endpoints.length,
    successfulEndpoints: endpointSuccessCount,
    failedEndpoints: endpoints.length - endpointSuccessCount
  };

  // Test 6: Análisis de permisos (usando el endpoint de productos en su lugar)
  try {
    console.log('Verificando permisos a través de productos');
    const response = await axios.get(`${WOOCOMMERCE_URL}/products`, {
      params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        per_page: 1
      },
      timeout: 5000
    });
    
    diagnosticResults.tests.permissions = {
      name: 'Análisis de Permisos',
      success: true,
      details: {
        canRead: true,
        responseStatus: response.status,
        headers: response.headers
      }
    };
  } catch (error) {
    console.error('Error en análisis de permisos:', error);
    diagnosticResults.tests.permissions = {
      name: 'Análisis de Permisos',
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        details: 'Error al verificar permisos de lectura'
      }
    };
  }

  // Agregar recomendaciones basadas en los resultados
  diagnosticResults.recommendations = [];

  if (!diagnosticResults.tests.configuration.success) {
    diagnosticResults.recommendations.push({
      priority: 'ALTA',
      message: 'Configurar las variables de entorno faltantes',
      details: diagnosticResults.tests.configuration.details
    });
  }

  if (!diagnosticResults.tests.wordpress.success) {
    diagnosticResults.recommendations.push({
      priority: 'ALTA',
      message: 'Verificar la conectividad con WordPress',
      details: 'El sitio WordPress no está accesible'
    });
  }

  if (!diagnosticResults.tests.woocommerce.success) {
    diagnosticResults.recommendations.push({
      priority: 'ALTA',
      message: 'Verificar la configuración de WooCommerce API',
      details: diagnosticResults.tests.woocommerce.error
    });
  }

  if (diagnosticResults.tests.woocommerce.success && 
      diagnosticResults.tests.dataAnalysis.details.hasProducts === false) {
    diagnosticResults.recommendations.push({
      priority: 'MEDIA',
      message: 'No se encontraron productos en WooCommerce',
      details: 'Verificar que existan productos publicados'
    });
  }

  if (!diagnosticResults.tests.endpoints.success) {
    diagnosticResults.recommendations.push({
      priority: 'MEDIA',
      message: 'Algunos endpoints no están accesibles',
      details: `${diagnosticResults.tests.endpoints.details.failedEndpoints} de ${diagnosticResults.tests.endpoints.details.totalEndpoints} endpoints fallaron`
    });
  }

  // Agregar estado general
  diagnosticResults.overallStatus = {
    success: diagnosticResults.tests.configuration.success && 
             diagnosticResults.tests.wordpress.success && 
             diagnosticResults.tests.woocommerce.success,
    criticalIssues: diagnosticResults.recommendations.filter(r => r.priority === 'ALTA').length,
    warnings: diagnosticResults.recommendations.filter(r => r.priority === 'MEDIA').length
  };

  res.status(200).json(diagnosticResults);
} 