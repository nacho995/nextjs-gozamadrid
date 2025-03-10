/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  // Cambiar output a 'export' solo en producción
  output: process.env.NODE_ENV === 'production' ? 'export' : 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración para entornos de producción
  ...(process.env.NODE_ENV === 'production' && {
    // Eliminar assetPrefix para evitar problemas con rutas
    // assetPrefix: '.',
  }),
  
  // Deshabilitar la optimización de barriles para react-icons
  experimental: {
    optimizePackageImports: ['other-packages-but-not-react-icons'],
    // Habilitar Webpack Build Worker para mejorar el rendimiento del build
    webpackBuildWorker: true,
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
    // Siempre deshabilitar la optimización de imágenes en producción para sitios estáticos
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Headers para mejorar el rendimiento, pero con caché más corto
  // Deshabilitar headers en producción con output: 'export'
  ...(process.env.NODE_ENV !== 'production' && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              // Reducir el tiempo de caché para permitir actualizaciones más frecuentes
              value: 'public, max-age=3600',
            },
          ],
        },
      ];
    }
  }),
  
  // Rewrites para proxies y redirecciones
  // Deshabilitar rewrites en producción con output: 'export'
  ...(process.env.NODE_ENV !== 'production' && {
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
          destination: '/api/image-proxy',
        },
        // Asegurar que las rutas de property se manejen correctamente
        {
          source: '/property/:id',
          destination: '/property/:id',
        },
        // Asegurar que las rutas de blog se manejen correctamente
        {
          source: '/blog/:id',
          destination: '/blog/:id',
        }
      ];
    }
  }),
  
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
  // Eliminar assetPrefix global y usar trailingSlash para mejor compatibilidad con sitios estáticos
  // assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  trailingSlash: true,
}

module.exports = nextConfig; 