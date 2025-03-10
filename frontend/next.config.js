/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  // Usar 'standalone' para producción
  output: 'standalone',
  // Especificar el directorio de salida
  distDir: 'dist',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración para entornos de producción
  ...(process.env.NODE_ENV === 'production' && {
    // Eliminar assetPrefix para evitar problemas con rutas
    // assetPrefix: '.',
    // Aumentar el timeout en producción al máximo
    serverTimeout: 300000, // 5 minutos (300 segundos)
  }),
  
  // Deshabilitar la optimización de barriles para react-icons
  experimental: {
    optimizePackageImports: ['other-packages-but-not-react-icons'],
    // Habilitar Webpack Build Worker para mejorar el rendimiento del build
    webpackBuildWorker: true,
    // Configuraciones experimentales para mejorar la resiliencia
    workerThreads: true,
    // Aumentar el límite de memoria para el build
    memoryLimit: 8192, // 8GB
    // Aumentar el timeout para la generación estática al máximo
    staticPageGenerationTimeout: 600, // 10 minutos en segundos
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
    minimumCacheTTL: 3600, // 1 hora
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración para sharp
    path: '/_next/image',
    loader: 'default',
    disableStaticImages: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Deshabilitar unoptimized para permitir la optimización de imágenes
    unoptimized: false,
  },
  
  // Headers para mejorar el rendimiento y la resiliencia
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=600',
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
  },
  
  // Rewrites para proxies y redirecciones
  async rewrites() {
    return [
      // Proxy de WordPress con timeout aumentado
      {
        source: '/api/wordpress-proxy',
        destination: '/api/wordpress-proxy',
      },
      // Proxy de WooCommerce
      {
        source: '/api/woocommerce-proxy',
        destination: '/api/woocommerce-proxy',
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
  },
  
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
    maxInactiveAge: 24 * 60 * 60 * 1000, // 24 horas
    pagesBufferLength: 10,
  },
  
  // Eliminar assetPrefix global y usar trailingSlash para mejor compatibilidad con sitios estáticos
  // assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  trailingSlash: true,
}

module.exports = nextConfig; 