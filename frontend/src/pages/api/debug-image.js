// API endpoint para probar y depurar imágenes
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Se requiere un parámetro URL' });
  }

  try {
    console.log('Depuración de imagen: Probando URL de imagen:', url);

    // Intentar acceder a la imagen para ver si existe
    const imageResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!imageResponse.ok) {
      console.error('Depuración de imagen: Error al acceder a la imagen:', imageResponse.status, imageResponse.statusText);
      return res.status(200).json({
        url,
        accessible: false,
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        contentType: null,
        message: `La imagen no es accesible: ${imageResponse.status} ${imageResponse.statusText}`
      });
    }

    // Obtener el tipo de contenido
    const contentType = imageResponse.headers.get('content-type');
    const contentLength = imageResponse.headers.get('content-length');

    console.log('Depuración de imagen: Imagen accesible:', {
      url,
      contentType,
      contentLength
    });

    return res.status(200).json({
      url,
      accessible: true,
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      contentType,
      contentLength,
      message: 'La imagen es accesible'
    });
  } catch (error) {
    console.error('Depuración de imagen: Error al verificar la imagen:', error.message);
    return res.status(200).json({
      url,
      accessible: false,
      error: error.message,
      message: `Error al verificar la imagen: ${error.message}`
    });
  }
} 