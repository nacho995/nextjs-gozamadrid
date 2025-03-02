/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['realestategozamadrid.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'realestategozamadrid.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      // Añadir otros patrones si es necesario
    ],
  },
  async rewrites() {
    return [
      {
        source: '/imageproxy/:path*',
        destination: 'https://realestategozamadrid.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig; 