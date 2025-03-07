/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: false,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuración de imágenes
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'realestategozamadrid.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  pageExtensions: ['jsx', 'js'],
  
  // Headers para mejorar el rendimiento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Rewrites para proxies y redirecciones
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
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://goza-madrid.onrender.com/blog'
          : 'http://localhost:4000/blog',
      },
      {
        source: '/blog-api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://goza-madrid.onrender.com/blog/:path*'
          : 'http://localhost:4000/blog/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
}

module.exports = nextConfig; 