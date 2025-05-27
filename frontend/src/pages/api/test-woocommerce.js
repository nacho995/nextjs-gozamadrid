import axios from 'axios';

export default async function handler(req, res) {
  console.log('🧪 TEST WOOCOMMERCE - Probando credenciales directas');
  
  // Credenciales directas para prueba
  const testCredentials = {
    key: 'ck_75c5940bfae6a9dd63f1489da71e43b576999633',
    secret: 'cs_f194d11b41ca92cdd356145705fede711cd233e5'
  };
  
  // Variables de entorno
  const envCredentials = {
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  };
  
  console.log('🔍 DIAGNÓSTICO COMPLETO:');
  console.log(`- Test key: ${testCredentials.key.substring(0, 10)}...`);
  console.log(`- Test secret: ${testCredentials.secret.substring(0, 10)}...`);
  console.log(`- Env key: ${envCredentials.key ? envCredentials.key.substring(0, 10) + '...' : 'NULL'}`);
  console.log(`- Env secret: ${envCredentials.secret ? envCredentials.secret.substring(0, 10) + '...' : 'NULL'}`);
  console.log(`- Keys match: ${testCredentials.key === envCredentials.key}`);
  console.log(`- Secrets match: ${testCredentials.secret === envCredentials.secret}`);
  
  const results = {};
  
  // Prueba 1: Con credenciales directas
  try {
    console.log('🧪 Prueba 1: Credenciales directas');
    const response1 = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: testCredentials.key,
        consumer_secret: testCredentials.secret,
        per_page: 5
      },
      timeout: 15000
    });
    
    results.direct = {
      status: response1.status,
      count: response1.data.length,
      firstId: response1.data[0]?.id,
      success: true
    };
    console.log(`✅ Credenciales directas: ${response1.data.length} propiedades`);
  } catch (error) {
    results.direct = {
      error: error.message,
      success: false
    };
    console.log(`❌ Credenciales directas: ${error.message}`);
  }
  
  // Prueba 2: Con variables de entorno
  try {
    console.log('🧪 Prueba 2: Variables de entorno');
    const response2 = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: envCredentials.key,
        consumer_secret: envCredentials.secret,
        per_page: 5
      },
      timeout: 15000
    });
    
    results.env = {
      status: response2.status,
      count: response2.data.length,
      firstId: response2.data[0]?.id,
      success: true
    };
    console.log(`✅ Variables de entorno: ${response2.data.length} propiedades`);
  } catch (error) {
    results.env = {
      error: error.message,
      success: false
    };
    console.log(`❌ Variables de entorno: ${error.message}`);
  }
  
  // Prueba 3: Sin credenciales
  try {
    console.log('🧪 Prueba 3: Sin credenciales');
    const response3 = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        per_page: 5
      },
      timeout: 10000
    });
    
    results.public = {
      status: response3.status,
      count: response3.data.length,
      firstId: response3.data[0]?.id,
      success: true
    };
    console.log(`✅ Sin credenciales: ${response3.data.length} propiedades`);
  } catch (error) {
    results.public = {
      error: error.message,
      success: false
    };
    console.log(`❌ Sin credenciales: ${error.message}`);
  }
  
  console.log('🎯 RESULTADOS FINALES:', results);
  
  res.status(200).json({
    message: 'Test WooCommerce completado',
    credentials: {
      testKey: testCredentials.key.substring(0, 10) + '...',
      envKey: envCredentials.key ? envCredentials.key.substring(0, 10) + '...' : 'NULL',
      keysMatch: testCredentials.key === envCredentials.key,
      secretsMatch: testCredentials.secret === envCredentials.secret
    },
    results
  });
} 