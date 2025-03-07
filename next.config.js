/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['realestategozamadrid.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'realestategozamadrid.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
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