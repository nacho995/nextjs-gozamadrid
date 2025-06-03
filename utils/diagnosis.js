/**
 * Utilidad para realizar diagnósticos del sistema
 */

export async function runDiagnostics() {
  const results = {
    environment: await checkEnvironment(),
    config: await checkConfiguration(),
    endpoints: await checkEndpoints(),
    recommendations: []
  };

  // Analizar resultados y generar recomendaciones
  generateRecommendations(results);

  return results;
}

async function checkEnvironment() {
  return {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'local',
    buildTime: new Date().toISOString(),
    nextVersion: process.env.NEXT_VERSION || 'unknown',
    runtime: typeof window !== 'undefined' ? 'client' : 'server'
  };
}

async function checkConfiguration() {
  return {
    apiEndpoints: {
      wordpress: !!process.env.WORDPRESS_API_URL,
      mongodb: !!process.env.MONGODB_URI,
      woocommerce: !!(process.env.WOOCOMMERCE_KEY && process.env.WOOCOMMERCE_SECRET)
    },
    features: {
      ssg: process.env.NEXT_STATIC_GENERATION === 'true',
      isr: process.env.NEXT_INCREMENTAL_GENERATION === 'true',
      api: process.env.NEXT_API_ENABLED !== 'false'
    }
  };
}

async function checkEndpoints() {
  const endpoints = [
    '/api/wordpress',
    '/api/mongodb',
    '/api/woocommerce',
    '/api/proxy'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      results[endpoint] = {
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      results[endpoint] = {
        status: 'error',
        error: error.message
      };
    }
  }

  return results;
}

function generateRecommendations(results) {
  const { environment, config, endpoints } = results;

  // Verificar el entorno
  if (environment.nodeEnv !== 'production') {
    results.recommendations.push(
      'Considera cambiar a entorno de producción para mejor rendimiento'
    );
  }

  // Verificar la configuración de API
  if (!config.apiEndpoints.wordpress) {
    results.recommendations.push(
      'Configura la URL de la API de WordPress para habilitar el blog'
    );
  }

  if (!config.apiEndpoints.mongodb) {
    results.recommendations.push(
      'Configura la URI de MongoDB para habilitar la base de datos'
    );
  }

  // Verificar endpoints
  Object.entries(endpoints).forEach(([endpoint, status]) => {
    if (status.status === 'error' || !status.ok) {
      results.recommendations.push(
        `Revisa el endpoint ${endpoint}: ${status.error || status.status}`
      );
    }
  });

  return results;
} 