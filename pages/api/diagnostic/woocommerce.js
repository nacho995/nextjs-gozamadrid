import axios from 'axios';

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const WC_API_URL = process.env.WC_API_URL || process.env.NEXT_PUBLIC_WC_API_URL;
  const WC_KEY = process.env.WC_CONSUMER_KEY;
  const WC_SECRET = process.env.WC_CONSUMER_SECRET;

  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      region: process.env.VERCEL_REGION,
      url: process.env.VERCEL_URL
    },
    woocommerce: {
      api_url: WC_API_URL ? 'CONFIGURADA' : 'NO CONFIGURADA',
      api_url_value: WC_API_URL,
      consumer_key: WC_KEY ? `CONFIGURADA (${WC_KEY.length} chars)` : 'NO CONFIGURADA',
      consumer_secret: WC_SECRET ? `CONFIGURADA (${WC_SECRET.length} chars)` : 'NO CONFIGURADA',
      consumer_key_preview: WC_KEY ? `${WC_KEY.substring(0, 10)}...` : 'N/A',
      consumer_secret_preview: WC_SECRET ? `${WC_SECRET.substring(0, 10)}...` : 'N/A'
    },
    all_env_vars: Object.keys(process.env).filter(key => 
      key.includes('WC') || 
      key.includes('CONSUMER') || 
      key.includes('WORDPRESS') ||
      key.includes('API')
    ).reduce((acc, key) => {
      acc[key] = process.env[key] ? 'CONFIGURADA' : 'NO CONFIGURADA';
      return acc;
    }, {})
  };

  // Si tenemos credenciales, intentar hacer una petición de prueba
  if (WC_API_URL && WC_KEY && WC_SECRET) {
    try {
      console.log('[Diagnostic] Intentando petición de prueba a WooCommerce...');
      
      const testUrl = `${WC_API_URL}/products`;
      const testResponse = await axios.get(testUrl, {
        params: {
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
          per_page: 1
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Goza Madrid Diagnostic/1.0',
          'Accept': 'application/json'
        }
      });

      diagnosticInfo.test_request = {
        success: true,
        status: testResponse.status,
        data_type: typeof testResponse.data,
        is_array: Array.isArray(testResponse.data),
        data_length: testResponse.data?.length || 0,
        headers: testResponse.headers,
        sample_data: testResponse.data?.slice(0, 1) || null
      };

    } catch (error) {
      diagnosticInfo.test_request = {
        success: false,
        error: error.message,
        status: error.response?.status,
        error_data: error.response?.data,
        error_headers: error.response?.headers,
        error_code: error.code
      };
    }
  } else {
    diagnosticInfo.test_request = {
      success: false,
      error: 'Credenciales no configuradas'
    };
  }

  return res.status(200).json(diagnosticInfo);
} 