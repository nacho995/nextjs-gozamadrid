/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  basePath: '',
  distDir: 'dist',
  // La opción experimental no es necesaria ya que estamos usando solo Pages Router
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' }
    };
  }
}

module.exports = nextConfig;
