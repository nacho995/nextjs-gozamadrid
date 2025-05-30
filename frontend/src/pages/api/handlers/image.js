import { NextResponse } from 'next/server';

/**
 * Configuración para permitir respuestas de cualquier tamaño
 */
export const config = {
  api: {
    responseLimit: false,
    bodyParser: false, // Desactivar el analizador de cuerpo para mejorar el rendimiento con archivos grandes
  },
};

/**
 * API Proxy para imágenes
 * Esta función actúa como un proxy para imágenes externas, evitando problemas de CORS y QUIC_PROTOCOL_ERROR
 */
export default async function handler(req, res) {
  // Obtener la URL de la imagen de los parámetros de consulta
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }
  
  // Validar que la URL sea segura
  if (!isValidUrl(url)) {
    console.error(`URL no válida: ${url}`);
    return redirectToPlaceholder(res);
  }
  
  try {
    // Verificar si la URL ya es un proxy
    if (url.includes('images.weserv.nl')) {
      console.log(`La URL ya es un proxy, redirigiendo: ${url}`);
      return res.redirect(307, url);
    }
    
    // Usar un servicio de proxy confiable para evitar errores QUIC_PROTOCOL_ERROR
    const fallbackImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80';
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=600&fit=cover&default=${encodeURIComponent(fallbackImage)}`;
    console.log(`Redirigiendo a proxy: ${proxyUrl}`);
    
    // Redirigir a la URL del proxy
    return res.redirect(307, proxyUrl);
  } catch (error) {
    console.error('Error en el proxy de imágenes:', error);
    return redirectToPlaceholder(res);
  }
}

/**
 * Valida que la URL sea segura y válida
 */
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Redirige a una imagen de marcador de posición
 */
function redirectToPlaceholder(res) {
  return res.redirect(307, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80');
} 