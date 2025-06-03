/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: false,
  
  // Configuración minimal para desarrollo estable
  webpack: (config, { dev, isServer }) => {
    // Solo alias básicos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
    };

    // No watchOptions que pueden causar conflictos con Turbopack
    if (dev && config.watchOptions) {
      delete config.watchOptions;
    }

    return config;
  },

  // Configuración básica de imágenes
  images: {
    unoptimized: true,
    domains: ['localhost', 'placekitten.com', 'commondatastorage.googleapis.com'],
  },

  // Headers básicos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
