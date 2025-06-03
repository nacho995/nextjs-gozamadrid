/**
 * Configuración del lado del cliente (Frontend)
 * Este archivo contiene las configuraciones estáticas y URLs base para el frontend.
 * Para configuración dinámica (como disponibilidad de endpoints), el frontend hace
 * una llamada a /api/config/properties durante la inicialización en _app.js
 */

const SITE_URL = 'https://www.realestategozamadrid.com';
const WP_API_URL = 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
const WC_API_URL = 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';

// Configuración por defecto para fetch
const defaultFetchConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// Configuración global que estará disponible en window.appConfig
const createGlobalConfig = () => {
  const baseConfig = {
    timeout: 30000,
    retries: 3,
    backoff: true,
    fetchConfig: defaultFetchConfig,
    endpoints: {
      properties: 'api/properties',
      property: (id) => `api/properties/${id}`,
      contact: 'api/contact',
      config: 'api/config/properties',
      woocommerce: {
        products: 'api/woocommerce/products',
        product: (id) => `api/woocommerce/products/${id}`
      }
    },
    frontendUrl: SITE_URL,
    wpApiUrl: WP_API_URL,
    wcApiUrl: WC_API_URL,
    isConfigLoaded: true,
    woocommerce: {
      key: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d4c3f5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3',
      secret: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3'
    }
  };

  if (typeof window !== 'undefined') {
    window.appConfig = {
      ...baseConfig,
      isConfigLoaded: true
    };
    return window.appConfig;
  }

  return baseConfig;
};

const config = {
  SITE_URL,
  WP_API_URL,
  WC_API_URL,
  defaultFetchConfig,
  WOO_COMMERCE_KEY: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d4c3f5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3',
  WOO_COMMERCE_SECRET: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3c5c3',
  
  ITEMS_PER_PAGE: 12,
  
  API_PROXY: {
    MONGODB: 'api/properties/sources/mongodb',
    PROPERTIES: 'api/properties',
    WOOCOMMERCE: 'api/woocommerce/products'
  },

  ENDPOINTS: {
    PROPERTIES: 'api/properties',
    PROPERTY: 'api/properties',
    CONTACT: 'api/contact',
    CONFIG: 'api/config/properties',
    WOOCOMMERCE: {
      PRODUCTS: 'api/woocommerce/products',
      PRODUCT: (id) => `api/woocommerce/products/${id}`
    }
  },

  getBaseUrl: () => typeof window !== 'undefined' ? window.location.origin : SITE_URL,

  getEndpointUrl: (endpoint) => {
    const base = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${base}/${cleanEndpoint}`;
  },

  getMongoUrl: (id = null) => {
    const base = 'api/properties/sources/mongodb';
    return id ? `${base}/${id}` : base;
  },

  getWooCommerceUrl: (id = null) => {
    const base = 'api/woocommerce/products';
    return id ? `${base}/${id}` : base;
  },

  getWordPressBaseUrl: () => {
    const base = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    return `${base}/api/proxy/wordpress`;
  },

  getWooCommerceAuth: () => ({
    key: config.WOO_COMMERCE_KEY,
    secret: config.WOO_COMMERCE_SECRET
  }),

  getFetchConfig: (customConfig = {}) => ({
    ...defaultFetchConfig,
    ...customConfig
  })
};

// Inicializar la configuración global
createGlobalConfig();

export default config;