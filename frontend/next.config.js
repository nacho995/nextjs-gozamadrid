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
      'res.cloudinary.com',
      'gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com'
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
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://realestategozamadrid.com'),
    MONGODB_URL: process.env.MONGODB_URL || '',
    API_BASE_URL: process.env.API_BASE_URL || ''
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
    // Para desarrollo y producción, usamos nuestra propia API interna
    // Esto evita problemas de CORS y errores de timeout
    return [
      // Rutas específicas para las fuentes
      {
        source: '/api/properties/sources/:source',
        destination: '/api/properties/sources/:source'
      },
      {
        source: '/api/properties/sources/:source/:id',
        destination: '/api/properties/sources/:source/:id'
      },
      // Ruta específica para WooCommerce
      {
        source: '/api/woocommerce/:path*',
        destination: `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/:path*?consumer_key=ck_d69e61427264a7beea70ca9ee543b45dd00cae85&consumer_secret=cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e`
      },
      // API Routes para propiedades - usar los endpoints internos
      {
        source: '/api/properties',
        destination: '/api/properties'
      },
      {
        source: '/api/properties/:id',
        destination: '/api/properties/:id'
      },
      {
        source: '/api/properties/:path*',
        destination: '/api/properties/:path*'
      },
      // Proxy routes
      {
        source: '/api/proxy/woocommerce/:path*',
        destination: `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/:path*?consumer_key=ck_d69e61427264a7beea70ca9ee543b45dd00cae85&consumer_secret=cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e`
      },
      // Fallbacks para manejo de errores
      {
        source: '/api/:path*',
        destination: '/api/:path*'
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
            value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check, x-property-auth, x-requested-property'
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
            value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check, x-property-auth, x-requested-property'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;
