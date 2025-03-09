/**
 * Ruta de API para pruebas de imágenes
 */
export default async function handler(req, res) {
  try {
    // Obtener la URL de la imagen a probar desde los parámetros de consulta
    const { url, type } = req.query;
    
    // Si no hay URL, devolver información básica
    if (!url) {
      return res.status(200).json({
        message: 'Utiliza esta API para probar URLs de imágenes',
        usage: '/api/image-test?url=URL_DE_IMAGEN&type=wordpress|woocommerce|local',
        example: '/api/image-test?url=https://ejemplo.com/imagen.jpg&type=wordpress'
      });
    }
    
    // Registrar la solicitud
    console.log(`[Image Test] Probando URL: ${url} (tipo: ${type || 'no especificado'})`);
    
    // Información del proxy
    const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    
    // Intentar obtener información básica sobre la imagen
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 GozaMadrid Image Test'
        }
      });
      
      const status = response.status;
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const headers = {};
      
      // Recopilar todos los encabezados para diagnóstico
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // Devolver la información recopilada
      return res.status(200).json({
        url,
        proxiedUrl,
        type: type || 'no especificado',
        status,
        contentType,
        contentLength,
        accessible: response.ok,
        headers,
        recommendations: [
          "Usa la URL proxy para imágenes externas",
          "Asegúrate de que la URL sea accesible públicamente",
          "Verifica que el tipo de contenido sea una imagen válida"
        ]
      });
    } catch (error) {
      // Si no se puede acceder a la imagen, devolver error
      return res.status(200).json({
        url,
        proxiedUrl,
        type: type || 'no especificado',
        error: error.message,
        accessible: false,
        recommendations: [
          "La URL no es accesible desde el servidor",
          "Verifica que la URL sea correcta y esté en línea",
          "Si es una imagen local, asegúrate de que la ruta sea correcta",
          "Para imágenes de WordPress/WooCommerce, verifica que el dominio sea accesible"
        ]
      });
    }
  } catch (error) {
    console.error('[Image Test] Error:', error);
    return res.status(500).json({ error: 'Error en el servicio de prueba de imágenes' });
  }
} 