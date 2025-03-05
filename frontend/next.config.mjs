/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['realestategozamadrid.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/property-test',
        destination: '/404',
      },
    ];
  },
};

module.exports = nextConfig;