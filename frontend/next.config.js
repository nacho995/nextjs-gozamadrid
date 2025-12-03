/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://nextjs-gozamadrid-qrfk.onrender.com',
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const normalized = backendUrl.replace(/\/$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${normalized}/api/:path*`,
        },
      ];
    }
    // Sin BACKEND_URL definido, no aplicar rewrites y dejar que el router de la plataforma enrute /api
    return [];
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
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output standalone para producción (contenedores)
  output: 'standalone',
};

module.exports = nextConfig; 