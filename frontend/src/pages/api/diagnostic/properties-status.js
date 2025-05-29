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
        error: null,
        properties: 0
      },
      woocommerce: {
        configured: false,
        accessible: false,
        url: null,
        hasCredentials: false,
        error: null,
        properties: 0
      }
    }
  };

  // 1. Verificar configuración MongoDB
  const MONGO_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
  report.sources.mongodb.configured = !!MONGO_URL;
  report.sources.mongodb.url = MONGO_URL;

  if (MONGO_URL) {
    try {
      console.log('[Diagnostic] Probando conexión MongoDB:', MONGO_URL);
      const mongoResponse = await axios.get(`${MONGO_URL}/api/properties`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      report.sources.mongodb.accessible = true;
      
      let properties = [];
      if (Array.isArray(mongoResponse.data)) {
        properties = mongoResponse.data;
      } else if (mongoResponse.data?.properties && Array.isArray(mongoResponse.data.properties)) {
        properties = mongoResponse.data.properties;
      }
      
      report.sources.mongodb.properties = properties.length;
      console.log(`[Diagnostic] MongoDB: ${properties.length} propiedades encontradas`);
    } catch (error) {
      report.sources.mongodb.error = error.message;
      console.error('[Diagnostic] Error MongoDB:', error.message);
    }
  }

  // 2. Verificar configuración WooCommerce
  const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
  const WC_KEY = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY;
  const WC_SECRET = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;

  report.sources.woocommerce.configured = !!WC_API_URL;
  report.sources.woocommerce.url = WC_API_URL;
  report.sources.woocommerce.hasCredentials = !!(WC_KEY && WC_SECRET);

  if (WC_API_URL && WC_KEY && WC_SECRET) {
    try {
      console.log('[Diagnostic] Probando conexión WooCommerce:', WC_API_URL);
      const wcResponse = await axios.get(`${WC_API_URL}/products`, {
        params: {
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
          status: 'publish',
          per_page: 10
        },
        timeout: 15000,
        headers: { 'Accept': 'application/json' }
      });
      
      report.sources.woocommerce.accessible = true;
      
      if (Array.isArray(wcResponse.data)) {
        report.sources.woocommerce.properties = wcResponse.data.length;
        console.log(`[Diagnostic] WooCommerce: ${wcResponse.data.length} propiedades encontradas`);
      }
    } catch (error) {
      report.sources.woocommerce.error = error.message;
      console.error('[Diagnostic] Error WooCommerce:', error.message);
      
      // Verificar si es un error de CORS o credenciales
      if (error.response?.status === 401) {
        report.sources.woocommerce.error = 'Credenciales inválidas (401)';
      } else if (error.response?.status === 403) {
        report.sources.woocommerce.error = 'Acceso denegado (403)';
      } else if (error.code === 'ENOTFOUND') {
        report.sources.woocommerce.error = 'Dominio no encontrado';
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