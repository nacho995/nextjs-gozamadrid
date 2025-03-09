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
 * Esta función actúa como un proxy para imágenes externas, evitando problemas de CORS
 */
export default async function handler(req, res) {
  // Obtener la URL de la imagen de los parámetros de consulta
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }
  
  // Validar que la URL sea segura
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'URL no válida' });
  }
  
  try {
    // Hacer la solicitud a la URL de la imagen
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`Error al obtener la imagen: ${response.status} ${response.statusText}`);
      return redirectToPlaceholder(res);
    }
    
    // Obtener el tipo de contenido
    const contentType = response.headers.get('content-type');
    
    // Verificar si el tipo de contenido es una imagen
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`Tipo de contenido no válido: ${contentType}`);
      return redirectToPlaceholder(res);
    }
    
    // Establecer el tipo de contenido en la respuesta
    res.setHeader('Content-Type', contentType);
    
    // Establecer el control de caché para mejorar el rendimiento
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Obtener los datos de la imagen
    const buffer = await response.arrayBuffer();
    
    // Devolver los datos de la imagen
    return res.status(200).send(Buffer.from(buffer));
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
 * Redirecciona a una imagen de marcador de posición en caso de error
 */
function redirectToPlaceholder(res) {
  // Redireccionar a una imagen de marcador de posición
  res.setHeader('Location', '/img/default-blog-image.jpg');
  return res.status(302).end();
} 