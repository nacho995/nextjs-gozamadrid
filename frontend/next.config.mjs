/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['realestategozamadrid.com', 'images.unsplash.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;