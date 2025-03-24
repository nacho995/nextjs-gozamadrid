#!/usr/bin/env node

/**
 * Script para verificar la conexión con el Backend API
 * 
 * Uso:
 * node scripts/check-backend-connection.js
 */

require('dotenv').config();
const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// URLs a probar
const URLS = [
  {
    name: 'API Principal (Root HTTP)',
    url: 'http://api.realestategozamadrid.com/',
    expected: [200, 301, 302, 307, 308], // Aceptar redirecciones o éxito
    follow: true
  },
  {
    name: 'API Principal (Root HTTPS)',
    url: 'https://api.realestategozamadrid.com/',
    expected: 200,
    follow: true
  },
  {
    name: 'API Principal (Health)',
    url: 'http://api.realestategozamadrid.com/api/health',
    expected: [200, 301, 302, 307, 308],
    follow: true
  },
  {
    name: 'API Alternativa (Root HTTP)',
    url: 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/',
    expected: [200, 301, 302, 307, 308],
    follow: true
  },
  {
    name: 'API Alternativa (Root HTTPS)',
    url: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/',
    expected: 200,
    follow: true
  },
  {
    name: 'API Properties (HTTP)',
    url: 'http://api.realestategozamadrid.com/api/properties',
    expected: [200, 301, 302, 307, 308],
    follow: true
  }
];

// Función para verificar una URL
async function checkUrl(endpoint) {
  console.log(`\n🔍 Verificando: ${endpoint.name}`);
  console.log(`URL: ${endpoint.url}`);
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);
    
    const start = performance.now();
    
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid/1.0',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal,
      redirect: endpoint.follow ? 'follow' : 'manual' // Seguir redirecciones si está configurado
    });
    
    clearTimeout(timeout);
    const time = Math.round(performance.now() - start);
    
    const finalUrl = response.url;
    console.log(`Estado: ${response.status} ${response.statusText}`);
    console.log(`Tiempo: ${time}ms`);
    
    if (finalUrl !== endpoint.url) {
      console.log(`Redirección: ${endpoint.url} → ${finalUrl}`);
    }
    
    // Verificar si el status está en el array de status esperados o coincide exactamente
    const isExpectedStatus = Array.isArray(endpoint.expected) 
      ? endpoint.expected.includes(response.status)
      : response.status === endpoint.expected;
    
    if (isExpectedStatus) {
      console.log(`✅ Conexión exitosa`);
      
      try {
        const data = await response.text();
        let jsonData = null;
        
        try {
          jsonData = JSON.parse(data);
          console.log(`📊 Respuesta: JSON válido con ${Object.keys(jsonData).length} propiedades`);
        } catch (e) {
          console.log(`📄 Respuesta: ${data.substring(0, 50)}...`);
        }
        
        return {
          success: true,
          status: response.status,
          time,
          url: finalUrl,
          redirected: finalUrl !== endpoint.url
        };
      } catch (e) {
        console.log(`📄 Respuesta: No se pudo leer el cuerpo de la respuesta`);
        return {
          success: true,
          status: response.status,
          time,
          url: finalUrl,
          redirected: finalUrl !== endpoint.url
        };
      }
    } else {
      console.log(`❌ Estado incorrecto. Esperado: ${JSON.stringify(endpoint.expected)}, recibido: ${response.status}`);
      return {
        success: false,
        status: response.status,
        time,
        url: finalUrl,
        redirected: finalUrl !== endpoint.url
      };
    }
  } catch (error) {
    console.error(`❌ Error: ${error.name} - ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log('⏱️ La conexión se canceló por timeout (>15s)');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Función principal
async function main() {
  console.log('🌐 Verificación de conexiones Backend');
  console.log('====================================');
  
  let results = [];
  
  for (const endpoint of URLS) {
    const result = await checkUrl(endpoint);
    results.push({
      ...endpoint,
      ...result
    });
  }
  
  // Mostrar resumen
  console.log('\n📊 Resumen de conexiones:');
  console.log('====================================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const redirected = results.filter(r => r.redirected).length;
  
  console.log(`✅ Exitosas: ${successful}/${results.length}`);
  console.log(`🔄 Redirigidas: ${redirected}/${results.length}`);
  console.log(`❌ Fallidas: ${failed}/${results.length}`);
  
  if (successful === 0) {
    console.log('\n❌ ERROR: No se pudo conectar a ningún endpoint.');
    console.log('Posibles causas:');
    console.log('1. Problemas de red o firewall');
    console.log('2. El backend está caído');
    console.log('3. Problemas de DNS');
    process.exit(1);
  } else if (failed > 0) {
    console.log('\n⚠️ ADVERTENCIA: Algunas conexiones fallaron.');
    
    // Verificar si al menos una de cada tipo funciona
    const httpConnections = results.filter(r => r.url?.startsWith('http://') && r.success);
    const httpsConnections = results.filter(r => r.url?.startsWith('https://') && r.success);
    
    // Mostrar URLs accesibles
    console.log('\nURLs accesibles:');
    results.filter(r => r.success).forEach(r => {
      console.log(`✓ ${r.name} (${r.time}ms)${r.redirected ? ' - Redirigido' : ''}`);
      if (r.redirected) {
        console.log(`  Original: ${r.url} → Final: ${r.finalUrl || 'N/A'}`);
      }
    });
    
    // Mostrar URLs no accesibles
    console.log('\nURLs no accesibles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`✗ ${r.name} - ${r.error || `HTTP ${r.status}`}`);
    });
    
    if (httpConnections.length > 0) {
      console.log('✅ Las conexiones HTTP están funcionando');
    } else {
      console.log('❌ Las conexiones HTTP no están disponibles');
    }
    
    if (httpsConnections.length > 0) {
      console.log('✅ Las conexiones HTTPS están funcionando');
    } else {
      console.log('❌ Las conexiones HTTPS no están disponibles');
    }
    
    process.exit(2);
  } else {
    console.log('\n✅ Todas las conexiones fueron exitosas');
    
    // Mostrar información de redirección
    if (redirected > 0) {
      console.log('\nInformación de redirecciones:');
      results.filter(r => r.redirected).forEach(r => {
        console.log(`🔄 ${r.name}: ${r.url} → ${r.finalUrl || 'N/A'}`);
      });
    }
    
    process.exit(0);
  }
}

// Ejecutar
main().catch(error => {
  console.error(`\n❌ Error general: ${error.message}`);
  process.exit(1);
}); 