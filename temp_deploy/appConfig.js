/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
// Configuración global para la aplicación
window.appConfig = {
  apiUrl: "/api/properties",
  frontendUrl: "https://main.gozamadrid-frontend-new.pages.dev",
  staticUrl: "https://main.gozamadrid-frontend-new.pages.dev",
  environment: "production",
  debug: false
};

// Configuración específica para WooCommerce
window.CONFIG = {
  WC_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3",
  WOO_COMMERCE_KEY: "ck_d69e61427264a7beea70ca9ee543b45dd00cae85",
  WOO_COMMERCE_SECRET: "cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e",
};

// Mensaje para confirmar que el archivo se ha cargado
console.log('[CONFIG] appConfig.js cargado correctamente');
