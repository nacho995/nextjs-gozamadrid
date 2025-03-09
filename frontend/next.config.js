/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración para entornos de producción
  ...(process.env.NODE_ENV === 'production' && {
    // Configurar assetPrefix para recursos estáticos en producción
    assetPrefix: '.',
    // Configurar basePath si es necesario
    // basePath: '',
  }),
  
  // Deshabilitar la optimización de barriles para react-icons
  // Esto resolverá el error "Cannot read properties of undefined (reading 'call')"
  experimental: {
    optimizePackageImports: ['other-packages-but-not-react-icons'],
  },
  
  // Configuración de imágenes
  images: {
    domains: [
      'realestategozamadrid.com',
      'images.unsplash.com',
      'localhost',
      'res.cloudinary.com',
      'images.weserv.nl',
      'via.placeholder.com',
      'goza-madrid-qbw9.onrender.com',
      'gozamadrid.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'production', // Deshabilitar la optimización de imágenes en producción
  },
  
  // Headers para mejorar el rendimiento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Rewrites para proxies y redirecciones
  async rewrites() {
    return [
      // Solo mantener el proxy de WordPress
      {
        source: '/api/wordpress-proxy',
        destination: 'https://realestategozamadrid.com/wp-json/wp/v2/:path*',
      },
      // Añadir proxy para imágenes
      {
        source: '/api/image-proxy',
        destination: '/api/image-proxy', // Esto asegura que el proxy de imágenes funcione correctamente
      },
    ];
  },
  
  // Configuración de webpack más simple y estable
  webpack: (config, { isServer }) => {
    // Optimizaciones para reducir el tamaño del bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            react: {
              name: 'commons',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            },
          },
        },
      };
    }
    return config;
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  trailingSlash: true,
}

module.exports = nextConfig; 