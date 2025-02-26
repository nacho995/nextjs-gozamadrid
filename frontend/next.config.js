/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    domains: ['res.cloudinary.com', 'images.pexels.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dv31mt6pd/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
    ],
  },
  // ... resto de tu configuración
};

module.exports = nextConfig; 