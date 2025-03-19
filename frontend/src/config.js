// Configuración para el frontend
const config = {
  // URLs de base
  API_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api",
  API_BASE_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com",
  
  // Configuración de timeouts y reintentos
  API_TIMEOUT: 60000,
  MAX_RETRIES: 8,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 32000,
  
  // Configuración de WordPress
  WP_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2",
  WC_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3",
  
  // Configuración de WooCommerce
  WOO_COMMERCE_KEY: "ck_d69e61427264a7beea70ca9ee543b45dd00cae85",
  WOO_COMMERCE_SECRET: "cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e",
  
  // Configuración de caché
  CACHE_MAX_AGE: 3600,
  STALE_WHILE_REVALIDATE: 60
};

// Exportar la configuración de manera compatible con Cloudflare
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else if (typeof globalThis !== 'undefined') {
  // Usar globalThis en lugar de window para compatibilidad con Cloudflare
  if (typeof globalThis.window !== 'undefined') {
    globalThis.window.CONFIG = config;
  } else if (typeof globalThis !== 'undefined') {
    globalThis.CONFIG = config;
  }
} 