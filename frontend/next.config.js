/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: [
      'images.weserv.nl',
      'api.realestategozamadrid.com',
      'realestategozamadrid.com',
      'wordpress-1430059-5339263.cloudwaysapps.com',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: false,
  basePath: '',
  poweredByHeader: false,
  // Configuración para manejar correctamente las páginas
  experimental: {
    scrollRestoration: true,
    largePageDataBytes: 128 * 100000, // Aumentar el límite para páginas grandes
  },
  // Configuración específica para Vercel
  env: {
    VERCEL_URL: process.env.VERCEL_URL || '',
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    NEXT_PUBLIC_WOO_COMMERCE_KEY: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85',
    NEXT_PUBLIC_WOO_COMMERCE_SECRET: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e',
    NEXT_PUBLIC_WC_API_URL: process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gozamadrid.com'),
    MONGODB_URL: process.env.MONGODB_URL || 'https://api.realestategozamadrid.com',
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.realestategozamadrid.com'
  },
  // Eliminamos output: 'export' para permitir API routes
  distDir: '.next',
  // Asegurarnos de que las páginas estáticas no tengan problemas
  optimizeFonts: false,
  // Desactivar optimizaciones que puedan causar problemas
  swcMinify: false,
  // Desactivar el linting durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Asegurarnos de que index.js se genere como página principal
  pageExtensions: ['js', 'jsx', 'mdx'],
  
  async rewrites() {
    const apiUrl = process.env.API_BASE_URL || 'https://api.realestategozamadrid.com';
    const wcUrl = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';

    return [
      // Rutas específicas para las fuentes
      {
        source: '/api/properties/sources/:source',
        destination: `${apiUrl}/api/properties/sources/:source`
      },
      // Ruta específica para WooCommerce
      {
        source: '/api/woocommerce/:path*',
        destination: `${wcUrl}/:path*`
      },
      // API Routes para propiedades
      {
        source: '/api/properties',
        destination: `${apiUrl}/api/properties`
      },
      {
        source: '/api/properties/:path*',
        destination: `${apiUrl}/api/properties/:path*`
      },
      // Proxy routes
      {
        source: '/api/proxy/woocommerce/:path*',
        destination: `${wcUrl}/:path*`
      },
      {
        source: '/api/proxy/mongodb/:path*',
        destination: `${apiUrl}/api/:path*`
      }
    ];
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;
