/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: false,
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
    domains: [
      'realestategozamadrid.com',
      'images.unsplash.com',
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
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
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
      // Solo mantener el proxy de WordPress
      {
        source: '/api/wordpress-proxy',
        destination: 'https://realestategozamadrid.com/wp-json/wp/v2/:path*',
      },
    ];
  },
  
  // Configuración de webpack más simple y estable
  webpack: (config, { isServer }) => {
    return config;
  },
}

module.exports = nextConfig; 