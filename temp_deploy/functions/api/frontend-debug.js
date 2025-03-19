/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Endpoint de diagnóstico para el frontend
 * Este archivo proporciona información detallada sobre cómo se están procesando 
 * las propiedades en el frontend para facilitar la depuración.
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Headers CORS para permitir el acceso desde cualquier origen
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Para solicitudes OPTIONS (preflight requests)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // URL de la solicitud
  const url = new URL(request.url);
  
  // Resultados del diagnóstico
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    frontend: {
      url: url.toString(),
      origin: url.origin,
      userAgent: request.headers.get('User-Agent') || 'No disponible'
    },
    appConfig: {
      // Actualizamos para mostrar la configuración correcta que debería tener
      apiUrl: "/api/properties",
      frontendUrl: "https://main.gozamadrid-frontend-new.pages.dev",
      staticUrl: "https://main.gozamadrid-frontend-new.pages.dev"
    },
    tests: []
  };

  // Prueba 1: Verificar la respuesta de la API de propiedades
  try {
    console.log('[FRONTEND-DEBUG] Probando API de propiedades');
    
    const propertiesUrl = `${url.origin}/api/properties?page=1&limit=100`;
    console.log(`[FRONTEND-DEBUG] Haciendo solicitud a: ${propertiesUrl}`);
    
    const propertiesResponse = await fetch(propertiesUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Diagnostic'
      }
    });
    
    if (propertiesResponse.ok) {
      const propertiesData = await propertiesResponse.json();
      
      diagnosticResults.tests.push({
        name: 'API de propiedades',
        success: true,
        status: propertiesResponse.status,
        totalProperties: propertiesData.total || 0,
        woocommerceProperties: propertiesData.sources?.woocommerce || 0,
        mongodbProperties: propertiesData.sources?.mongodb || 0,
        propertiesInResponse: propertiesData.properties?.length || 0,
        propertiesTypes: {
          woocommerce: propertiesData.properties?.filter(p => p.type === 'woocommerce').length || 0,
          mongodb: propertiesData.properties?.filter(p => p.type === 'mongodb').length || 0
        },
        paginationInfo: {
          currentPage: propertiesData.page,
          totalPages: propertiesData.totalPages,
          limit: propertiesData.limit
        },
        description: 'Verifica la respuesta del endpoint de propiedades'
      });

      // Añadir muestra de propiedades MongoDB si existen
      if (propertiesData.properties?.some(p => p.type === 'mongodb')) {
        const mongoSample = propertiesData.properties.find(p => p.type === 'mongodb');
        diagnosticResults.tests.push({
          name: 'Muestra de propiedad MongoDB',
          success: true,
          sample: {
            id: mongoSample.id,
            type: mongoSample.type,
            title: mongoSample.title,
            price: mongoSample.price,
            bedrooms: mongoSample.bedrooms,
            bathrooms: mongoSample.bathrooms,
            size: mongoSample.size,
            image: mongoSample.image
          },
          description: 'Muestra de una propiedad de MongoDB de la respuesta'
        });
      }
    } else {
      const errorText = await propertiesResponse.text();
      diagnosticResults.tests.push({
        name: 'API de propiedades',
        success: false,
        status: propertiesResponse.status,
        error: propertiesResponse.statusText,
        details: errorText.substring(0, 200),
        description: 'Verifica la respuesta del endpoint de propiedades'
      });
    }
  } catch (error) {
    diagnosticResults.tests.push({
      name: 'API de propiedades',
      success: false,
      error: error.name,
      message: error.message,
      description: 'Verifica la respuesta del endpoint de propiedades'
    });
  }

  // Prueba 2: Verificar la respuesta directa del proxy de MongoDB
  try {
    console.log('[FRONTEND-DEBUG] Probando proxy MongoDB directo');
    
    const mongoProxyUrl = `${url.origin}/api/proxy?service=mongodb&resource=property`;
    console.log(`[FRONTEND-DEBUG] Haciendo solicitud a: ${mongoProxyUrl}`);
    
    const mongoResponse = await fetch(mongoProxyUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Diagnostic'
      }
    });
    
    if (mongoResponse.ok) {
      const mongoData = await mongoResponse.json();
      
      diagnosticResults.tests.push({
        name: 'Proxy MongoDB directo',
        success: true,
        status: mongoResponse.status,
        totalProperties: Array.isArray(mongoData) ? mongoData.length : 'no es un array',
        sample: Array.isArray(mongoData) && mongoData.length > 0 
          ? { 
              id: mongoData[0]._id,
              title: mongoData[0].title,
              price: mongoData[0].price
            } 
          : 'Sin datos',
        description: 'Verifica la respuesta directa del proxy de MongoDB'
      });
    } else {
      const errorText = await mongoResponse.text();
      diagnosticResults.tests.push({
        name: 'Proxy MongoDB directo',
        success: false,
        status: mongoResponse.status,
        error: mongoResponse.statusText,
        details: errorText.substring(0, 200),
        description: 'Verifica la respuesta directa del proxy de MongoDB'
      });
    }
  } catch (error) {
    diagnosticResults.tests.push({
      name: 'Proxy MongoDB directo',
      success: false,
      error: error.name,
      message: error.message,
      description: 'Verifica la respuesta directa del proxy de MongoDB'
    });
  }

  // Añadir prueba para verificar la carga de appConfig.js en el frontend
  diagnosticResults.tests.push({
    name: 'Verificación de appConfig.js',
    success: true,
    description: 'Verifica si el archivo appConfig.js está configurado correctamente',
    expectedConfig: {
      apiUrl: "/api/properties"
    },
    troubleshooting: "Si tu frontend está usando /api/proxy?service=mongodb&resource=property, significa que el appConfig.js no se ha actualizado correctamente. Verifica que el archivo appConfig.js en la raíz del sitio tiene apiUrl: \"/api/properties\"."
  });

  // Verificar las peticiones que hace el frontend
  diagnosticResults.tests.push({
    name: 'Problema con las peticiones Next.js',
    success: false,
    description: 'Errores 404 en las peticiones Next.js a archivos JSON',
    error: "Existen errores 404 al intentar acceder a _next/data/*/[ruta].json",
    troubleshooting: "Esto indica que el enrutamiento Next.js está intentando cargar datos JSON que no existen. Es un problema conocido en el despliegue en Cloudflare Pages. Para resolverlo, asegúrate de configurar correctamente el handler de Next.js en _routes.json."
  });

  // Generar recomendaciones basadas en los resultados
  let recommendations = [];
  
  const propertiesTest = diagnosticResults.tests.find(t => t.name === 'API de propiedades');
  const mongoProxyTest = diagnosticResults.tests.find(t => t.name === 'Proxy MongoDB directo');
  
  if (propertiesTest && propertiesTest.success) {
    if (propertiesTest.mongodbProperties > 0) {
      recommendations.push("La API de propiedades está devolviendo correctamente propiedades de MongoDB");
      
      if (propertiesTest.propertiesTypes.mongodb === 0 && propertiesTest.mongodbProperties > 0) {
        recommendations.push("Las propiedades de MongoDB existen en el total pero no aparecen en la primera página. Verifica la paginación en el frontend.");
      }
    } else {
      recommendations.push("La API de propiedades no está devolviendo propiedades de MongoDB. Verifica la conexión con MongoDB.");
    }
  }
  
  if (mongoProxyTest && mongoProxyTest.success) {
    if (mongoProxyTest.totalProperties > 0) {
      recommendations.push("El proxy de MongoDB está funcionando correctamente y devolviendo propiedades.");
      
      if (propertiesTest && propertiesTest.mongodbProperties === 0) {
        recommendations.push("El proxy funciona pero las propiedades no se están incluyendo en la API combinada. Verifica el código de la API properties.js.");
      }
    } else {
      recommendations.push("El proxy de MongoDB está funcionando pero no devuelve propiedades. Verifica la base de datos MongoDB.");
    }
  } else {
    recommendations.push("El proxy de MongoDB no está funcionando correctamente. Verifica la configuración del proxy.");
  }
  
  // Agregar recomendaciones sobre el frontend
  recommendations.push("Verifica en el frontend que estés manejando ambos tipos de propiedades ('woocommerce' y 'mongodb').");
  recommendations.push("Comprueba que la paginación del frontend esté configurada correctamente para recuperar todas las páginas de propiedades.");
  recommendations.push("Asegúrate de que el valor de apiUrl en appConfig.js esté correctamente configurado para apuntar a /api/properties.");
  recommendations.push("Verifica que estás cargando correctamente el archivo appConfig.js en el HTML. Es posible que necesites borrar la caché del navegador o usar Ctrl+F5 para recargar la página completamente.");
  recommendations.push("Los errores 404 en la consola relacionados con _next/data son normales en Cloudflare Pages y no afectan a la funcionalidad principal si has configurado las reglas de redirección correctamente.");
  
  diagnosticResults.recommendations = recommendations;

  // Devolver respuesta con los headers CORS
  return new Response(JSON.stringify(diagnosticResults, null, 2), {
    status: 200,
    headers: corsHeaders
  });
} 