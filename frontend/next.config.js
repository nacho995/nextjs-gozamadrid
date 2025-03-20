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
  // Output como static para generar archivos HTML estáticos
  output: 'export',
  // Mejorar la experiencia de desarrollo
  distDir: process.env.BUILD_DIR || 'out',
  // Asegurarnos de que las páginas estáticas no tengan problemas
  optimizeFonts: false,
  // Desactivar optimizaciones que puedan causar problemas
  swcMinify: false,
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
