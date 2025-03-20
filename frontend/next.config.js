/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['localhost', 'vercel.app'],
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
  // Configuración para manejar correctamente las páginas
  experimental: {
    scrollRestoration: true,
  },
  // Configuración específica para Vercel
  env: {
    VERCEL_URL: process.env.VERCEL_URL || '',
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
  // Necesario para permitir la exportación estática
  output: 'export',
  // Configuración para manejo de archivos estáticos
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  // Configuración para asegurar compatibilidad con Vercel
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Desactivar el linting durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Asegurarnos de que index.js se genere como página principal
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

module.exports = nextConfig;
