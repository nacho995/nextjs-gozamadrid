/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
  generateEtags: true,
  images: {
    domains: [
      'realestategozamadrid.com',
      'localhost',
      'res.cloudinary.com',
      'images.weserv.nl',
      'via.placeholder.com'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  pageExtensions: ['jsx', 'js'],
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
          ? 'https://tu-backend-url.onrender.com/blog'  // Ajusta esta URL
          : 'http://localhost:4000/blog',
      },
      {
        source: '/blog-api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://tu-backend-url.onrender.com/blog/:path*'  // Ajusta esta URL
          : 'http://localhost:4000/blog/:path*',
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }
    return config;
  },
}

module.exports = nextConfig; 