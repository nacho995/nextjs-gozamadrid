/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  basePath: '',
  assetPrefix: '',
  // Configuraciones adicionales
  async rewrites() {
    return [
      {
        source: '/property/:id',
        destination: '/property/[id]',
      },
      {
        source: '/blog/:id',
        destination: '/blog/[id]',
      },
      {
        source: '/vender/comprar',
        destination: '/vender/comprar',
      },
    ];
  },
}

module.exports = nextConfig;
