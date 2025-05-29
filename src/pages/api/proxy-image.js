import axios from 'axios';

/**
 * Proxy para imágenes que evita problemas de CORS y mixed content
 * Optimizado para manejar imágenes de WooCommerce y otras fuentes
 */
export default async function handler(req, res) {
  // Permitir consultas CORS para desarrollo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let { url } = req.query;

  if (!url) {
    // Redirigir a una imagen placeholder en lugar de devolver un error
    return res.redirect(307, 'https://via.placeholder.com/800x600?text=Sin+Imagen');
  }

  try {
    // Asegurarse de que la URL tiene un protocolo
    if (url.startsWith('//')) {
      url = `https:${url}`;
    }

    // Verificar si la URL es válida
    try {
      new URL(url);
    } catch (error) {
      console.error(`[proxy-image] URL inválida: ${url}`);
      return res.redirect(307, 'https://via.placeholder.com/800x600?text=URL+Inválida');
    }

    // Si la URL ya es de un servicio de proxy confiable como weserv.nl, redirigir directamente
    if (url.includes('weserv.nl') || url.includes('placeholder.com')) {
      return res.redirect(307, url);
    }

    console.log(`[proxy-image] Proxy para imagen: ${url}`);

    // Método alternativo: usar weserv.nl como proxy externo
    // Esto es más confiable que manejar el binario nosotros mismos
    const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    return res.redirect(307, weservUrl);

    /* Mantener el código original como alternativa, pero usar el método de redirección
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 GozaMadrid Image Proxy',
        'Accept': 'image/*'
      }
    });

    // Establecer cabeceras adecuadas para caché y tipo de contenido
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Caché por 24 horas
    res.setHeader('Content-Length', response.data.length);
    
    // Enviar la imagen
    res.send(response.data);
    */
  } catch (error) {
    console.error(`[proxy-image] Error al procesar la imagen: ${error.message}`);
    
    // En caso de error, redirigir a una imagen placeholder
    return res.redirect(307, 'https://via.placeholder.com/800x600?text=Error+de+Imagen');
  }
} 