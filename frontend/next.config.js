/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://nextjs-gozamadrid.fly.dev',
  },

  // No rewrites for /api/* — all API routes are local Next.js serverless functions.
  // Proxy routes (e.g. /api/proxy/backend) handle backend communication internally.
  
  // Configuracion de imagenes
  images: {
    domains: ['localhost', 'gozamadrid.com'],
    unoptimized: true,
  },

  // Configuracion de transpilacion
  transpilePackages: ['@heroicons/react', 'framer-motion'],

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimizaciones de compilacion
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output standalone para produccion (contenedores)
  output: 'standalone',
};

module.exports = nextConfig;
