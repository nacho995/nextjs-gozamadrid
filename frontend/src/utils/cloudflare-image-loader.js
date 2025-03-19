/**
 * Cargador de imágenes personalizado para Cloudflare Pages
 * Este archivo permite que Next.js utilice el servicio de optimización de imágenes de Cloudflare
 */

export default function cloudflareImageLoader({ src, width, quality }) {
  // Si la imagen ya es una URL completa, utilizamos Cloudflare Image Resizing
  if (src.startsWith('http')) {
    // URL para Cloudflare Image Resizing
    return `https://realestatgozamadrid.com/cdn-cgi/image/f=auto,q=${quality || 75},w=${width}/${src}`;
  }
  
  // Si es una imagen local o relativa
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://realestatgozamadrid.com';
  return `${baseUrl}/cdn-cgi/image/f=auto,q=${quality || 75},w=${width}/${src}`;
} 