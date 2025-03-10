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
    // Aumentar el timeout en producción
    serverTimeout: 60000, // 60 segundos
  }),
  
  // Deshabilitar la optimización de barriles para react-icons
  experimental: {
    optimizePackageImports: ['other-packages-but-not-react-icons'],
    // Habilitar Webpack Build Worker para mejorar el rendimiento del build
    webpackBuildWorker: true,
    // Configuraciones experimentales para mejorar la resiliencia
    workerThreads: true,
    // Aumentar el límite de memoria para el build
    memoryLimit: 4096,
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
  
  // Headers para mejorar el rendimiento y la resiliencia
  // Deshabilitar headers en producción con output: 'export'
  ...(process.env.NODE_ENV !== 'production' && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600, stale-while-revalidate=60',
            },
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
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
        // Proxy de WordPress con timeout aumentado
        {
          source: '/api/wordpress-proxy',
          destination: 'https://realestategozamadrid.com/wp-json/wp/v2/:path*',
          has: [
            {
              type: 'header',
              key: 'x-timeout',
              value: '(?<timeout>.*)',
            },
          ],
        },
        // Proxy para imágenes con timeout
        {
          source: '/api/image-proxy',
          destination: '/api/image-proxy',
        },
        // Rutas de property
        {
          source: '/property/:id',
          destination: '/property/:id',
        },
        // Rutas de blog
        {
          source: '/blog/:id',
          destination: '/blog/:id',
        }
      ];
    }
  }),
  
  // Configuración de webpack optimizada
  webpack: (config, { isServer }) => {
    // Optimizaciones para reducir el tamaño del bundle y mejorar la resiliencia
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
      
      // Configuración para mejorar el manejo de errores
      config.optimization.splitChunks.maxInitialRequests = 25;
      config.optimization.splitChunks.minSize = 20000;
    }
    
    return config;
  },
  
  // Configuración para mejorar la resiliencia
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hora
    pagesBufferLength: 5,
  },
  
  // Eliminar assetPrefix global y usar trailingSlash para mejor compatibilidad con sitios estáticos
  // assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  trailingSlash: true,
}

module.exports = nextConfig; 