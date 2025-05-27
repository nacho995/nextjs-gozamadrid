import { env } from "process";

// next.config.mjs - Restaurado desde backup (sin srcDir)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: [
      'images.weserv.nl',
      'api.realestategozamadrid.com',
      'realestategozamadrid.com',
      'wordpress.realestategozamadrid.com',
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
  experimental: {
    scrollRestoration: true,
    largePageDataBytes: 128 * 100000,
  },
  env: {
    VERCEL_URL: process.env.VERCEL_URL || '',
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    NEXT_PUBLIC_WOO_COMMERCE_KEY: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY,
    NEXT_PUBLIC_WOO_COMMERCE_SECRET: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET,
    NEXT_PUBLIC_WC_API_URL: process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://realestategozamadrid.com'),
    MONGODB_URL: process.env.MONGODB_URL || '',
    API_BASE_URL: process.env.API_BASE_URL || '' // Esta parece no usarse, usamos NEXT_PUBLIC_API_URL
  },
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx'],

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'; // URL de tu backend

    return [
      // Reenvía TODAS las peticiones /api/... al backend real
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      // Puedes mantener las reglas específicas de proxy de WooCommerce si las necesitas
      // y si no chocan con las rutas de tu backend.
      // Asegúrate de que estas rutas NO existan también en tu backend real.
      {
        source: '/api/woocommerce/:path*',
        destination: `https://wordpress.realestategozamadrid.com/wp-json/wc/v3/:path*?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET}`
      },
      {
        source: '/api/proxy/woocommerce/:path*',
        destination: `https://wordpress.realestategozamadrid.com/wp-json/wc/v3/:path*?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET}`
      },
       // Proxy para imágenes si lo necesitas (Asegúrate de que el backend tenga esta ruta)
      // Si no existe en el backend, coméntala o elimínala.
      // {
      //   source: '/api/proxy-image',
      //   destination: `${backendUrl}/api/proxy-image`,
      // },
    ].filter(Boolean); // Filtrar posibles nulos si comentas rutas
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS, HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check, x-property-auth, x-requested-property' }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS, HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Content-Type, Origin, Cache-Control, X-Requested-With, x-no-preflight-check, x-property-auth, x-requested-property' }
        ]
      }
    ];
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        permanent: true,
        // Ojo: La redirección HTTPS original podría necesitar ajuste dependiendo de cómo Vercel maneja 'host'
        destination: 'https://:host:path*', // Asumiendo que 'host' esté disponible
      },
    ];
  },
  // srcDir: 'src', // ELIMINADA PARA COMPATIBILIDAD TEMPORAL
};

export default nextConfig; 