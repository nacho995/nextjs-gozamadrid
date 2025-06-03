// URLs base para las APIs
export const API_URLS = {
  WORDPRESS: process.env.NEXT_PUBLIC_WP_API_URL || 'https://www.realestategozamadrid.com/wp-json/wp/v2',
  MONGODB: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003'
};

// Configuración de CORS para WordPress
export const WP_FETCH_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  mode: 'cors'
};

// Imágenes por defecto
export const DEFAULT_IMAGES = {
  BLOG: '/images/default-blog-image.jpg',
  LOGO: '/images/logo.png',
  FAVICON: '/logo.png'
};

// Timeouts y reintentos
export const API_CONFIG = {
  TIMEOUT: 5000,
  RETRIES: 3,
  RETRY_DELAY: 1000
}; 