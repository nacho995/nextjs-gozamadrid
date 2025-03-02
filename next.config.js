/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['realestategozamadrid.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=600' }
        ],
      },
    ];
  },
  // Resto de tu configuración existente...
}

module.exports = nextConfig 