/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Deshabilitar la optimización de barriles para react-icons
  // Esto resolverá el error "Cannot read properties of undefined (reading 'call')"
  experimental: {
    optimizePackageImports: ['other-packages-but-not-react-icons'],
  },
  
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
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: '**.cloudinary.com',
      },
    ],
    domains: ['res.cloudinary.com', 'localhost', 'realestategozamadrid.com', 'images.weserv.nl', 'via.placeholder.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        source: '/api/woocommerce/:path*',
        destination: 'https://realestategozamadrid.com/wp-json/wc/v3/:path*',
      },
      {
        source: '/api/wordpress/:path*',
        destination: '/api/wordpress-proxy',
      },
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
  
  // Configuración de webpack más simple y estable
  webpack: (config, { isServer }) => {
    return config;
  },
}

module.exports = nextConfig; 