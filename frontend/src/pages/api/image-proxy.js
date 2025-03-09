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
 * Manejador de proxy de imágenes
 * 
 * Recupera imágenes de URLs externas y las sirve a través de nuestro dominio
 * con el manejo adecuado de tipos de contenido y cacheo
 */
export default async function handler(req, res) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener la URL de la imagen desde los parámetros de consulta
    const { url } = req.query;
    
    // Validar que se proporcionó una URL
    if (!url) {
      return res.status(400).json({ error: 'Se requiere el parámetro URL' });
    }
    
    // Registrar la URL solicitada para depuración
    console.log(`[Image Proxy] Procesando URL: ${url}`);
    
    // Validación básica de URL para seguridad
    if (!isValidUrl(url)) {
      console.error(`[Image Proxy] URL no válida: ${url}`);
      return res.status(400).json({ error: 'URL no válida' });
    }
    
    // Realizar la solicitud a la URL de la imagen
    console.log(`[Image Proxy] Recuperando imagen de: ${url}`);
    const response = await fetch(url, {
      headers: {
        // Algunos servicios requieren un user-agent para evitar bloqueos
        'User-Agent': 'Mozilla/5.0 GozaMadrid Image Proxy'
      }
    });
    
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      console.error(`[Image Proxy] Error al obtener imagen: ${response.status} - ${url}`);
      return redirectToPlaceholder(res);
    }
    
    // Obtener el tipo de contenido y los datos
    const contentType = response.headers.get('content-type');
    
    // Verificar que es una imagen
    if (!contentType || !contentType.includes('image')) {
      console.error(`[Image Proxy] Tipo de contenido no válido: ${contentType} para URL: ${url}`);
      return redirectToPlaceholder(res);
    }
    
    // Obtener los datos de la imagen
    const imageBuffer = await response.arrayBuffer();
    
    // Configurar las cabeceras para la respuesta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800'); // 1 día de caché del navegador, 1 semana en CDN
    res.setHeader('Accept-Ranges', 'bytes');
    
    console.log(`[Image Proxy] Imagen servida correctamente: ${url} (${contentType}, ${imageBuffer.byteLength} bytes)`);
    
    // Enviar la imagen
    return res.status(200).send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('[Image Proxy] Error al procesar imagen:', error);
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
 * Redirecciona a una imagen de marcador de posición en caso de error
 */
function redirectToPlaceholder(res) {
  // Redireccionar a una imagen de marcador de posición
  res.setHeader('Location', '/placeholder.jpg');
  return res.status(302).end();
} 