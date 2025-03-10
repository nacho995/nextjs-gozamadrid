import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Obtener URL de la imagen de la consulta
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Se requiere parámetro URL' });
  }

  try {
    // Validar la URL (asegurarse de que es una URL válida)
    const imageUrl = decodeURIComponent(url);
    const urlObj = new URL(imageUrl);

    // Verificar si la URL es de un dominio permitido (opcional, para mayor seguridad)
    const allowedDomains = ['realestategozamadrid.com', 'wordpress.com', 'wp.com'];
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.warn(`Dominio no permitido: ${urlObj.hostname}`);
      // Redirigir a imagen por defecto si es necesario
      // return res.status(403).json({ error: 'Dominio no permitido' });
    }

    console.log(`Solicitando imagen proxy: ${imageUrl}`);

    // Realizar la solicitud a la URL de la imagen
    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProxyBot/1.0)',
      },
    });

    if (!imageResponse.ok) {
      console.error(`Error al obtener imagen: ${imageResponse.status}`);
      // Redirigir a la imagen por defecto
      return res.redirect('/img/default-property-image.jpg');
    }

    // Obtener el tipo de contenido de la respuesta
    const contentType = imageResponse.headers.get('content-type');
    
    // Si no es una imagen, redirigir a la imagen por defecto
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`Tipo de contenido no válido: ${contentType}`);
      return res.redirect('/img/default-property-image.jpg');
    }

    // Obtener el buffer de la imagen
    const imageBuffer = await imageResponse.buffer();

    // Establecer encabezados apropiados
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cachear por un día
    
    // Enviar la imagen
    return res.send(imageBuffer);

  } catch (error) {
    console.error('Error al procesar la imagen proxy:', error);
    // En caso de error, redirigir a la imagen por defecto
    return res.redirect('/img/default-property-image.jpg');
  }
} 