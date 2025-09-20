/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://api.realestategozamadrid.com',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*',
      },
    ];
  },
  
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
  }
};

module.exports = nextConfig; 