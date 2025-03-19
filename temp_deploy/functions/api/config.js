/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
// Configuración centralizada para las funciones de API
export default {
  // API URLs 
  API_URL: "https://realestatgozamadrid.com/api",
  API_BASE_URL: "https://realestatgozamadrid.com",
  FRONTEND_URL: "https://main.gozamadrid-frontend-new.pages.dev",
  
  // WordPress y WooCommerce
  WP_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2",
  WC_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3",
  WOO_COMMERCE_KEY: "ck_d69e61427264a7beea70ca9ee543b45dd00cae85",
  WOO_COMMERCE_SECRET: "cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e",
  
  // Configuración de caché
  CACHE_MAX_AGE: 3600,
  STALE_WHILE_REVALIDATE: 60,
  
  // Configuración de timeouts y reintentos
  API_TIMEOUT: 60000
};
