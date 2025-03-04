/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'realestategozamadrid.com',
      'localhost',
      'res.cloudinary.com',
      'images.weserv.nl',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/imageproxy/:path*',
        destination: 'https://images.weserv.nl/?url=https://realestategozamadrid.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig; 