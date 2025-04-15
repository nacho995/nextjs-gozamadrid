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
    NEXT_PUBLIC_WOO_COMMERCE_KEY: process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85',
    NEXT_PUBLIC_WOO_COMMERCE_SECRET: process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e',
    NEXT_PUBLIC_WC_API_URL: process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://realestategozamadrid.com'),
    MONGODB_URL: process.env.MONGODB_URL || '',
    API_BASE_URL: process.env.API_BASE_URL || ''
  },
  distDir: '.next',
  optimizeFonts: false,
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx'],

  async rewrites() {
    return [
      { source: '/api/properties/sources/:source', destination: '/api/properties/sources/:source' },
      { source: '/api/properties/sources/:source/:id', destination: '/api/properties/sources/:source/:id' },
      { source: '/api/woocommerce/:path*', destination: `https://wordpress.realestategozamadrid.com/wp-json/wc/v3/:path*?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET}` },
      { source: '/api/properties', destination: '/api/properties' },
      { source: '/api/properties/:id', destination: '/api/properties/:id' },
      { source: '/api/properties/:path*', destination: '/api/properties/:path*' },
      { source: '/api/proxy/woocommerce/:path*', destination: `https://wordpress.realestategozamadrid.com/wp-json/wc/v3/:path*?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET}` },
      { source: '/api/:path*', destination: '/api/:path*' }
    ];
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