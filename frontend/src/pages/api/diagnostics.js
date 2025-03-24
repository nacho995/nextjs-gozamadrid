import axios from 'axios';

// Configuración
const ENDPOINTS = {
  mongodb: {
    url: process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
    endpoint: '/api/properties',
    timeout: 10000,
    method: 'get'
  },
  woocommerce: {
    url: process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
    endpoint: '/products',
    timeout: 10000,
    method: 'get',
    params: {
      consumer_key: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85',
      consumer_secret: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e',
      per_page: 1
    }
  },
  wordpress: {
    url: process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2',
    endpoint: '/posts',
    timeout: 10000,
    method: 'get',
    params: {
      per_page: 1
    }
  }
};

// Función para verificar un endpoint
const checkEndpoint = async (name, config) => {
  try {
    console.log(`[Diagnóstico] Verificando endpoint ${name}: ${config.url}${config.endpoint}`);
    
    const fullUrl = `${config.url}${config.endpoint}`;
    const startTime = Date.now();
    
    const response = await axios({
      method: config.method,
      url: fullUrl,
      params: config.params,
      timeout: config.timeout,
      validateStatus: () => true // Aceptar cualquier código de estado
    });
    
    const responseTime = Date.now() - startTime;
    
    // Determinar si la respuesta es exitosa basado en el código de estado
    const success = response.status >= 200 && response.status < 300;
    
    // Intentar determinar el tipo de datos de respuesta
    let dataType = 'unknown';
    let dataCount = 0;
    
    if (Array.isArray(response.data)) {
      dataType = 'array';
      dataCount = response.data.length;
    } else if (response.data && typeof response.data === 'object') {
      dataType = 'object';
      if (response.data.properties && Array.isArray(response.data.properties)) {
        dataCount = response.data.properties.length;
        dataType = 'object.properties[]';
      } else {
        dataCount = Object.keys(response.data).length;
      }
    }
    
    return {
      name,
      url: fullUrl,
      status: response.status,
      success,
      responseTime,
      dataType,
      dataCount,
      error: null
    };
  } catch (error) {
    console.error(`[Diagnóstico] Error al verificar ${name}:`, error.message);
    
    // Construir objeto de error
    let errorObj = {
      message: error.message,
      code: error.code || 'UNKNOWN'
    };
    
    if (error.response) {
      errorObj.status = error.response.status;
      errorObj.statusText = error.response.statusText;
      
      // Intentar incluir datos de respuesta si existen y no son demasiado grandes
      try {
        const responseData = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data).substring(0, 500) 
          : String(error.response.data).substring(0, 500);
        
        errorObj.responseData = responseData;
      } catch (e) {
        errorObj.responseData = 'Error al serializar datos de respuesta';
      }
    }
    
    return {
      name,
      url: `${config.url}${config.endpoint}`,
      status: error.response?.status || 0,
      success: false,
      responseTime: 0,
      dataType: null,
      dataCount: 0,
      error: errorObj
    };
  }
};

// Información del sistema
const getSystemInfo = () => {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: {
      environment: process.env.VERCEL_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown'
    },
    env: {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
      NEXT_PUBLIC_WP_API_URL: process.env.NEXT_PUBLIC_WP_API_URL || 'not set',
      NEXT_PUBLIC_WC_API_URL: process.env.NEXT_PUBLIC_WC_API_URL || 'not set'
    }
  };
};

// Manejador principal
export default async function handler(req, res) {
  console.log('[Diagnóstico] Iniciando verificación de endpoints');
  
  try {
    // Verificar todos los endpoints de forma paralela
    const results = await Promise.all(
      Object.entries(ENDPOINTS).map(([name, config]) => checkEndpoint(name, config))
    );
    
    // Generar informe de diagnóstico
    const diagnostic = {
      system: getSystemInfo(),
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
    
    // Devolver resultados
    return res.status(200).json(diagnostic);
  } catch (error) {
    console.error('[Diagnóstico] Error general:', error);
    return res.status(500).json({
      error: 'Error al realizar el diagnóstico',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 