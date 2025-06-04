/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Configuración de imágenes
  images: {
    domains: ['localhost', 'gozamadrid.com'],
    unoptimized: true,
  },

  // Configuración de transpilación
  transpilePackages: ['@heroicons/react', 'framer-motion'],

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimizaciones de compilación
  compiler: {
    removeConsole: false,
  },

  // Configuración específica para desarrollo - evitar bucles
  experimental: {
    incrementalCacheHandlerPath: false,
    isrMemoryCacheSize: 0,
    serverMinification: false,
  },

  // Configuración de páginas - limitar generación automática
  generateBuildId: () => 'dev-build',
  
  // Configurar redirecciones para evitar bucles
  async redirects() {
    return [
      // Evitar bucles infinitos en rutas admin
      {
        source: '/admin/:path((?!login$|logout$).*)',
        destination: '/404',
        permanent: false,
      },
    ]
  },
  
  // Configurar rewrites para controlar rutas
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: []
    }
  }
};

module.exports = nextConfig; 