/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
// Configuración centralizada para la aplicación de GozaMadrid
// Este archivo se carga como un script normal en el navegador

window.CONFIG = {
  // URLs de base
  API_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api",
  API_BASE_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com",
  
  // URLs de API
  MONGODB_API_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com",
  
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

// Para importaciones en archivos que lo incluyen como módulo ESM, usar:
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = window.CONFIG;
// } 