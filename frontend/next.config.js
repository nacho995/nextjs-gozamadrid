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
  pageExtensions: ['jsx', 'js'],
  async rewrites() {
    return [
      {
        source: '/imageproxy/:path*',
        destination: 'https://images.weserv.nl/?url=https://realestategozamadrid.com/:path*',
      },
      {
        source: '/api/property-test',
        destination: '/404',
      },
      {
        source: '/blog-api',
        destination: 'http://localhost:4000/blog',
      },
      {
        source: '/blog-api/:path*',
        destination: 'http://localhost:4000/blog/:path*',
      },
    ];
  },
}

module.exports = nextConfig; 