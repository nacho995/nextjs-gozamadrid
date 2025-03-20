/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cambiamos de 'export' a standalone para Vercel
  // output: 'export',
  images: {
    unoptimized: true,
    domains: ['localhost', 'vercel.app']
  },
  trailingSlash: false,
  basePath: '',
  // Removemos distDir para que Vercel use su configuración predeterminada
  // distDir: 'dist',
  // La exportPathMap puede causar problemas si las páginas están en src/pages
  /* exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' }
    };
  } */
}

module.exports = nextConfig;
