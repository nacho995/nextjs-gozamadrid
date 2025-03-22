/**
 * Script de prueba para verificar la conexión a las APIs
 * 
 * Este script intenta conectarse a cada API y muestra los resultados
 * para ayudar a diagnosticar problemas de conexión.
 */

async function testApiConnections() {
  console.log('=== TEST DE CONEXIONES A APIS ===');
  console.log('Fecha y hora:', new Date().toISOString());
  console.log('----------------------------------------');
  
  // Test de API WordPress
  console.log('1. Probando conexión a WordPress API...');
  try {
    const wpResponse = await fetch('https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/posts?per_page=1');
    const wpStatus = wpResponse.status;
    const wpData = wpResponse.ok ? await wpResponse.json() : null;
    
    console.log(`   Status: ${wpStatus} (${wpResponse.ok ? 'OK' : 'ERROR'})`);
    if (wpData) {
      console.log(`   Datos recibidos: ${wpData.length} posts`);
      console.log(`   Primer post: "${wpData[0]?.title?.rendered || 'Sin título'}"`);
    }
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
  console.log('----------------------------------------');
  
  // Test de API WooCommerce
  console.log('2. Probando conexión a WooCommerce API...');
  try {
    const wcResponse = await fetch('https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products?consumer_key=ck_d69e61427264a7beea70ca9ee543b45dd00cae85&consumer_secret=cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e&per_page=1');
    const wcStatus = wcResponse.status;
    const wcData = wcResponse.ok ? await wcResponse.json() : null;
    
    console.log(`   Status: ${wcStatus} (${wcResponse.ok ? 'OK' : 'ERROR'})`);
    if (wcData) {
      console.log(`   Datos recibidos: ${wcData.length} productos`);
      console.log(`   Primer producto: "${wcData[0]?.name || 'Sin nombre'}"`);
    }
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
  console.log('----------------------------------------');
  
  // Test de API MongoDB
  console.log('3. Probando conexión a MongoDB API...');
  try {
    const mongoResponse = await fetch('https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/health');
    const mongoStatus = mongoResponse.status;
    const mongoData = mongoResponse.ok ? await mongoResponse.json() : null;
    
    console.log(`   Status: ${mongoStatus} (${mongoResponse.ok ? 'OK' : 'ERROR'})`);
    if (mongoData) {
      console.log(`   Respuesta: ${JSON.stringify(mongoData)}`);
    }
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
  console.log('----------------------------------------');

  console.log('Test completado. Revisa los resultados para diagnosticar problemas.');
}

// Ejecutar prueba si estamos en un navegador
if (typeof window !== 'undefined') {
  console.log('Ejecutando test de conexión a APIs...');
  testApiConnections();
}

// Exportar función para uso en Node.js
module.exports = { testApiConnections };
