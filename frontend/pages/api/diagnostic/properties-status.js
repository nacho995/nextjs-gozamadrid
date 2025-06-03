import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    sources: {
      mongodb: {
        configured: false,
        accessible: false,
        url: null,
        urlsTested: [],
        error: null,
        properties: 0
      },
      woocommerce: {
        configured: false,
        accessible: false,
        url: null,
        urlsTested: [],
        hasCredentials: false,
        error: null,
        properties: 0
      }
    }
  };

  // 1. Verificar MongoDB con múltiples URLs
  const MONGO_URLS = [
    'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com', // URL que funciona
    process.env.NEXT_PUBLIC_API_URL,
    'http://api.realestategozamadrid.com', // HTTP en lugar de HTTPS
    'http://localhost:8081'
  ].filter(Boolean);

  report.sources.mongodb.configured = MONGO_URLS.length > 0;
  report.sources.mongodb.urlsTested = MONGO_URLS;

  for (const mongoUrl of MONGO_URLS) {
    try {
      console.log('[Diagnostic] Probando MongoDB:', mongoUrl);
      const mongoResponse = await axios.get(`${mongoUrl}/api/properties`, {
        timeout: 8000,
        headers: { 'Accept': 'application/json' }
      });
      
      report.sources.mongodb.accessible = true;
      report.sources.mongodb.url = mongoUrl;
      
      let properties = [];
      if (Array.isArray(mongoResponse.data)) {
        properties = mongoResponse.data;
      } else if (mongoResponse.data?.properties && Array.isArray(mongoResponse.data.properties)) {
        properties = mongoResponse.data.properties;
      }
      
      report.sources.mongodb.properties = properties.length;
      console.log(`[Diagnostic] ✅ MongoDB OK: ${properties.length} propiedades desde ${mongoUrl}`);
      break; // Salir del bucle si encontramos una URL que funciona
    } catch (error) {
      console.log(`[Diagnostic] ❌ MongoDB fallo: ${mongoUrl} - ${error.message}`);
      if (mongoUrl === MONGO_URLS[MONGO_URLS.length - 1]) {
        // Solo guardar el error del último intento
        report.sources.mongodb.error = error.message;
      }
    }
  }

  // 2. Verificar WooCommerce con múltiples URLs
  const WC_URLS = [
    'https://wordpress.realestategozamadrid.com/wp-json/wc/v3',
    'https://realestategozamadrid.com/wp-json/wc/v3',
    'https://www.realestategozamadrid.com/wp-json/wc/v3'
  ];
  
  const WC_KEY = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY;
  const WC_SECRET = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;

  report.sources.woocommerce.configured = WC_URLS.length > 0;
  report.sources.woocommerce.urlsTested = WC_URLS;
  report.sources.woocommerce.hasCredentials = !!(WC_KEY && WC_SECRET);

  if (WC_KEY && WC_SECRET) {
    for (const wcUrl of WC_URLS) {
      try {
        console.log('[Diagnostic] Probando WooCommerce:', wcUrl);
        const wcResponse = await axios.get(`${wcUrl}/products`, {
          params: {
            consumer_key: WC_KEY,
            consumer_secret: WC_SECRET,
            status: 'publish',
            per_page: 5
          },
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        });
        
        report.sources.woocommerce.accessible = true;
        report.sources.woocommerce.url = wcUrl;
        
        if (Array.isArray(wcResponse.data)) {
          report.sources.woocommerce.properties = wcResponse.data.length;
          console.log(`[Diagnostic] ✅ WooCommerce OK: ${wcResponse.data.length} propiedades desde ${wcUrl}`);
        }
        break; // Salir del bucle si encontramos una URL que funciona
      } catch (error) {
        console.log(`[Diagnostic] ❌ WooCommerce fallo: ${wcUrl} - ${error.message}`);
        if (wcUrl === WC_URLS[WC_URLS.length - 1]) {
          // Solo guardar el error del último intento
          report.sources.woocommerce.error = error.message;
          
          // Verificar tipos específicos de error
          if (error.response?.status === 401) {
            report.sources.woocommerce.error = 'Credenciales inválidas (401)';
          } else if (error.response?.status === 403) {
            report.sources.woocommerce.error = 'Acceso denegado (403)';
          } else if (error.code === 'ENOTFOUND') {
            report.sources.woocommerce.error = 'Dominio no encontrado';
          }
        }
      }
    }
  } else {
    report.sources.woocommerce.error = 'Credenciales faltantes';
  }

  // 3. Resumen del diagnóstico
  const totalAccessible = Object.values(report.sources).filter(s => s.accessible).length;
  const totalProperties = Object.values(report.sources).reduce((sum, s) => sum + s.properties, 0);

  console.log(`[Diagnostic] Resumen: ${totalAccessible}/2 fuentes accesibles, ${totalProperties} propiedades totales`);

  res.setHeader('Cache-Control', 'no-cache');
  return res.status(200).json({
    ...report,
    summary: {
      accessibleSources: totalAccessible,
      totalSources: 2,
      totalProperties,
      allWorking: totalAccessible === 2 && totalProperties > 0,
      hasData: totalProperties > 0
    }
  });
} 