/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost','images.pexels.com'],// Agrega aquí los dominios de donde se sirven tus imágenes
  },
};

export default nextConfig;
