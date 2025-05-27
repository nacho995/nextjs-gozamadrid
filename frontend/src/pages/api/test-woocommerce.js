import axios from 'axios';

export default async function handler(req, res) {
  console.log('🧪 TEST WOOCOMMERCE - Probando múltiples métodos de conexión');
  
  // Credenciales
  const credentials = {
    key: process.env.WC_CONSUMER_KEY || 'ck_75c5940bfae6a9dd63f1489da71e43b576999633',
    secret: process.env.WC_CONSUMER_SECRET || 'cs_f194d11b41ca92cdd356145705fede711cd233e5'
  };
  
  console.log(`🔑 Usando credenciales: ${credentials.key.substring(0, 10)}...`);
  
  const results = {};
  
  // Lista de endpoints alternativos
  const endpoints = [
    'https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products',
    'https://realestategozamadrid.com/wp-json/wc/v3/products',
    'https://www.realestategozamadrid.com/wp-json/wc/v3/products'
  ];
  
  // Método 1: Query parameters (actual)
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      console.log(`🧪 Probando endpoint ${i + 1}: ${endpoint} (query params)`);
      const response = await axios.get(endpoint, {
        params: {
          consumer_key: credentials.key,
          consumer_secret: credentials.secret,
          per_page: 10
        },
        timeout: 20000,
        headers: {
          'User-Agent': 'Goza Madrid Real Estate/1.0',
          'Accept': 'application/json'
        }
      });
      
      results[`endpoint_${i + 1}_query`] = {
        endpoint,
        method: 'query_params',
        status: response.status,
        count: response.data.length,
        firstId: response.data[0]?.id,
        success: true
      };
      console.log(`✅ Endpoint ${i + 1} query: ${response.data.length} propiedades`);
      
      // Si encontramos uno que funciona, no necesitamos probar más
      if (response.data.length > 0) {
        console.log(`🎉 ¡ÉXITO! Encontrado endpoint funcional: ${endpoint}`);
        break;
      }
    } catch (error) {
      results[`endpoint_${i + 1}_query`] = {
        endpoint,
        method: 'query_params',
        error: error.message,
        status: error.response?.status,
        success: false
      };
      console.log(`❌ Endpoint ${i + 1} query: ${error.message} (${error.response?.status})`);
    }
  }
  
  // Método 2: Basic Auth (alternativo)
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      console.log(`🧪 Probando endpoint ${i + 1}: ${endpoint} (basic auth)`);
      const response = await axios.get(endpoint, {
        params: {
          per_page: 10
        },
        auth: {
          username: credentials.key,
          password: credentials.secret
        },
        timeout: 20000,
        headers: {
          'User-Agent': 'Goza Madrid Real Estate/1.0',
          'Accept': 'application/json'
        }
      });
      
      results[`endpoint_${i + 1}_auth`] = {
        endpoint,
        method: 'basic_auth',
        status: response.status,
        count: response.data.length,
        firstId: response.data[0]?.id,
        success: true
      };
      console.log(`✅ Endpoint ${i + 1} auth: ${response.data.length} propiedades`);
      
      if (response.data.length > 0) {
        console.log(`🎉 ¡ÉXITO AUTH! Encontrado endpoint funcional: ${endpoint}`);
        break;
      }
    } catch (error) {
      results[`endpoint_${i + 1}_auth`] = {
        endpoint,
        method: 'basic_auth',
        error: error.message,
        status: error.response?.status,
        success: false
      };
      console.log(`❌ Endpoint ${i + 1} auth: ${error.message} (${error.response?.status})`);
    }
  }
  
  // Método 3: Headers personalizados
  try {
    console.log('🧪 Probando con headers personalizados');
    const response = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: credentials.key,
        consumer_secret: credentials.secret,
        per_page: 10
      },
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    });
    
    results.custom_headers = {
      method: 'custom_headers',
      status: response.status,
      count: response.data.length,
      firstId: response.data[0]?.id,
      success: true
    };
    console.log(`✅ Headers personalizados: ${response.data.length} propiedades`);
  } catch (error) {
    results.custom_headers = {
      method: 'custom_headers',
      error: error.message,
      status: error.response?.status,
      success: false
    };
    console.log(`❌ Headers personalizados: ${error.message} (${error.response?.status})`);
  }
  
  console.log('🎯 RESULTADOS FINALES:', results);
  
  // Encontrar el primer método exitoso
  const successfulMethod = Object.values(results).find(r => r.success && r.count > 0);
  
  res.status(200).json({
    message: 'Test WooCommerce completado',
    summary: {
      totalTests: Object.keys(results).length,
      successfulTests: Object.values(results).filter(r => r.success).length,
      bestMethod: successfulMethod || null
    },
    results
  });
} 