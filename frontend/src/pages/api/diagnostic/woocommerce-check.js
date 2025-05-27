import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    credentials: {
      WC_CONSUMER_KEY: {
        exists: !!process.env.WC_CONSUMER_KEY,
        length: process.env.WC_CONSUMER_KEY?.length || 0,
        prefix: process.env.WC_CONSUMER_KEY?.substring(0, 8) || 'NOT_SET'
      },
      WC_CONSUMER_SECRET: {
        exists: !!process.env.WC_CONSUMER_SECRET,
        length: process.env.WC_CONSUMER_SECRET?.length || 0,
        prefix: process.env.WC_CONSUMER_SECRET?.substring(0, 8) || 'NOT_SET'
      },
      WC_API_URL: {
        exists: !!process.env.WC_API_URL,
        value: process.env.WC_API_URL || 'NOT_SET'
      }
    },
    endpoints: [],
    tests: []
  };

  // Usar la URL de la variable de entorno o el default
  const mainEndpoint = process.env.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
  
  // Test 1: Verificar conectividad básica
  try {
    console.log('🔍 Test 1: Verificando conectividad básica...');
    const basicResponse = await axios.get(mainEndpoint, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Goza Madrid Diagnostic/1.0'
      }
    });
    
    diagnosticResults.tests.push({
      name: 'Conectividad básica',
      endpoint: mainEndpoint,
      success: true,
      status: basicResponse.status,
      message: 'Endpoint accesible'
    });
  } catch (error) {
    diagnosticResults.tests.push({
      name: 'Conectividad básica',
      endpoint: mainEndpoint,
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status,
      responseData: error.response?.data
    });
  }

  // Test 2: Verificar autenticación con credenciales
  if (process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET) {
    try {
      console.log('🔐 Test 2: Verificando autenticación...');
      const authResponse = await axios.get(`${mainEndpoint}/products`, {
        params: {
          consumer_key: process.env.WC_CONSUMER_KEY,
          consumer_secret: process.env.WC_CONSUMER_SECRET,
          per_page: 1
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Goza Madrid Diagnostic/1.0',
          'Accept': 'application/json'
        }
      });
      
      diagnosticResults.tests.push({
        name: 'Autenticación WooCommerce',
        endpoint: `${mainEndpoint}/products`,
        success: true,
        status: authResponse.status,
        productsFound: Array.isArray(authResponse.data) ? authResponse.data.length : 0,
        message: 'Autenticación exitosa'
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Autenticación WooCommerce',
        endpoint: `${mainEndpoint}/products`,
        success: false,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        headers: error.response?.headers
      });
    }
  } else {
    diagnosticResults.tests.push({
      name: 'Autenticación WooCommerce',
      success: false,
      error: 'Credenciales no configuradas',
      missingCredentials: {
        key: !process.env.WC_CONSUMER_KEY,
        secret: !process.env.WC_CONSUMER_SECRET
      }
    });
  }

  // Test 3: Verificar si es un problema de CORS o certificado SSL
  if (process.env.WC_API_URL?.startsWith('https://')) {
    const httpEndpoint = process.env.WC_API_URL.replace('https://', 'http://');
    try {
      console.log('🔄 Test 3: Verificando endpoint HTTP sin SSL...');
      const httpResponse = await axios.get(httpEndpoint, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Goza Madrid Diagnostic/1.0'
        }
      });
      
      diagnosticResults.tests.push({
        name: 'Endpoint HTTP sin SSL',
        endpoint: httpEndpoint,
        success: true,
        status: httpResponse.status,
        message: 'Endpoint HTTP accesible - posible problema con SSL'
      });
    } catch (error) {
      diagnosticResults.tests.push({
        name: 'Endpoint HTTP sin SSL',
        endpoint: httpEndpoint,
        success: false,
        error: error.message,
        status: error.response?.status
      });
    }
  }

  // Resumen
  const successfulTests = diagnosticResults.tests.filter(t => t.success).length;
  const totalTests = diagnosticResults.tests.length;
  
  diagnosticResults.summary = {
    totalTests,
    successfulTests,
    failedTests: totalTests - successfulTests,
    recommendation: successfulTests === 0 
      ? 'El endpoint de WooCommerce no está accesible. Verificar la URL, el estado del servidor y las credenciales.'
      : successfulTests < totalTests
      ? 'Algunos tests fallaron. Revisar credenciales, configuración SSL y permisos de la API.'
      : 'Todo funcionando correctamente.'
  };

  // Determinar código de estado HTTP
  const httpStatus = successfulTests === 0 ? 503 : successfulTests < totalTests ? 206 : 200;

  return res.status(httpStatus).json(diagnosticResults);
}
