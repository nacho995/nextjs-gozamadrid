// Endpoint para servir imágenes a través de un proxy para evitar problemas CORS
export default async function handler(req, res) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener la URL de la imagen desde los parámetros de consulta
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Se requiere el parámetro url' });
    }

    // Validar que la URL sea segura (opcional: implementar validación más estricta)
    if (
      !imageUrl.startsWith('http://') && 
      !imageUrl.startsWith('https://') &&
      !imageUrl.startsWith('//')
    ) {
      return res.status(400).json({ error: 'URL de imagen no válida' });
    }

    // Realizar la solicitud a la URL de la imagen
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Error al obtener la imagen: ${response.status}`);
    }

    // Obtener los encabezados de la respuesta original
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const contentLength = response.headers.get('content-length');
    
    // Configurar los encabezados de la respuesta
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    
    // Obtener el buffer de la imagen
    const buffer = await response.arrayBuffer();
    
    // Enviar la imagen
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error en proxy-image:', error);
    
    // Redirigir a una imagen por defecto en caso de error
    res.redirect('/img/default-property-image.jpg');
  }
} 