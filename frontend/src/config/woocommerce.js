/**
 * Configuración específica para WooCommerce
 * Este archivo centraliza todas las configuraciones relacionadas con WooCommerce
 */

// Detectar entorno
const isVercel = process.env.VERCEL === '1';
const isDevelopment = process.env.NODE_ENV === 'development';

// Configuración de URLs
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';

// Credenciales
const WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';

// Log de configuración al iniciar (solo en servidor)
if (typeof window === 'undefined') {
  console.log(`[WooConfig] Configuración cargada:`, {
    entorno: process.env.NODE_ENV,
    isVercel,
    hasKey: !!WOO_COMMERCE_KEY,
    hasSecret: !!WOO_COMMERCE_SECRET,
    apiUrl: WC_API_URL,
  });
}

// Endpoints
const ENDPOINTS = {
  PRODUCTS: '/products',
  PRODUCT: (id) => `/products/${id}`,
  CATEGORIES: '/products/categories',
  CATEGORY: (id) => `/products/categories/${id}`,
};

// Configuración para fetch
const defaultFetchConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// Función para construir URLs
const buildUrl = (endpoint, params = {}) => {
  try {
    const url = new URL(`${WC_API_URL}${endpoint}`);
    
    // Añadir credenciales
    if (WOO_COMMERCE_KEY && WOO_COMMERCE_SECRET) {
      url.searchParams.append('consumer_key', WOO_COMMERCE_KEY);
      url.searchParams.append('consumer_secret', WOO_COMMERCE_SECRET);
    } else {
      console.warn('[WooConfig] Advertencia: Construyendo URL sin credenciales de WooCommerce');
    }
    
    // Añadir parámetros adicionales
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  } catch (error) {
    console.error('[WooConfig] Error construyendo URL:', error.message);
    // Fallback simple a un string
    return `${WC_API_URL}${endpoint}?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
  }
};

// Función segura para split que verifica el tipo
const safeSplit = (value, separator) => {
  if (typeof value !== 'string') {
    console.warn('[WooConfig] Intento de split en un valor no string:', value);
    return [];
  }
  return value.split(separator);
};

const config = {
  WC_API_URL,
  WOO_COMMERCE_KEY,
  WOO_COMMERCE_SECRET,
  ENDPOINTS,
  isVercel,
  isDevelopment,
  
  hasCredentials: () => !!(WOO_COMMERCE_KEY && WOO_COMMERCE_SECRET),
  
  getProductUrl: (id, params = {}) => buildUrl(ENDPOINTS.PRODUCT(id), params),
  getProductsUrl: (params = {}) => buildUrl(ENDPOINTS.PRODUCTS, params),
  
  getAuth: () => ({
    key: WOO_COMMERCE_KEY,
    secret: WOO_COMMERCE_SECRET
  }),
  
  getFetchConfig: (customConfig = {}) => ({
    ...defaultFetchConfig,
    ...customConfig
  }),
  
  // URLs directas para acceso a la API
  getDirectProductUrl: (id) => `${WC_API_URL}/products/${id}?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`,
  getDirectProductsUrl: () => `${WC_API_URL}/products?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`,
  
  // Función de utilidad para split seguro
  safeSplit,
  
  // Función segura para obtener la base de una URL
  getWooCommerceApiUrl: () => {
    if (typeof WC_API_URL !== 'string') {
      console.warn('[WooConfig] WC_API_URL no es una cadena válida:', WC_API_URL);
      return 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    }
    
    const parts = safeSplit(WC_API_URL, '?');
    return parts[0] || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
  }
};

export default config; 