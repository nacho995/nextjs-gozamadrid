import axios from 'axios';

/**
 * Proxy de imágenes con corrección automática de URLs
 */

// Múltiples servicios de proxy como fallback
const PROXY_SERVICES = [
  'https://images.weserv.nl/',
  'https://images.wsrv.nl/',
];

// Imágenes de fallback de Unsplash
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80'
];

/**
 * Función para limpiar y corregir URLs de imágenes
 */
function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Eliminar URLs problemáticas
  if (url.includes('via.placeholder.com') || 
      url.includes('placeholder.com') ||
      url.includes('example.com')) {
    console.log('[proxy-image] URL problemática detectada:', url);
    return null;
  }

  // Corregir subdomain incorrecto de WordPress
  if (url.includes('wordpress.realestategozamadrid.com')) {
    url = url.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
    console.log('[proxy-image] Corrigiendo URL de WordPress:', url);
  }

  // Asegurar HTTPS
  if (url.startsWith('http:')) {
    url = url.replace('http:', 'https:');
  }

  return url;
}

/**
 * Función para probar múltiples servicios de proxy
 */
async function tryProxyServices(imageUrl, width = 800, height = 600) {
  for (let i = 0; i < PROXY_SERVICES.length; i++) {
    const proxyBase = PROXY_SERVICES[i];
    try {
      const proxyUrl = `${proxyBase}?url=${encodeURIComponent(imageUrl)}&w=${width}&h=${height}&fit=cover&default=${encodeURIComponent(FALLBACK_IMAGES[0])}`;
      
      console.log(`[proxy-image] Probando servicio ${i + 1}: ${proxyBase}`);
      
      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log(`[proxy-image] Servicio ${i + 1} disponible`);
        return proxyUrl;
      }
    } catch (error) {
      console.log(`[proxy-image] Servicio ${i + 1} falló:`, error.message);
      continue;
    }
  }
  
  // Si todos los servicios fallan, devolver fallback
  console.log('[proxy-image] Todos los servicios fallaron, usando fallback');
  return FALLBACK_IMAGES[0];
}

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

  const { url, w = 800, h = 600 } = req.query;

  if (!url) {
    console.log('[proxy-image] No se proporcionó URL, redirigiendo a fallback');
    return res.redirect(307, FALLBACK_IMAGES[0]);
  }

  // Limpiar y validar la URL
  const cleanUrl = cleanImageUrl(url);
  if (!cleanUrl) {
    console.log('[proxy-image] URL inválida o problemática:', url);
    return res.redirect(307, FALLBACK_IMAGES[0]);
  }

  // Validar que la URL sea válida
  try {
    new URL(cleanUrl);
  } catch (error) {
    console.error('[proxy-image] URL malformada:', cleanUrl);
    return res.redirect(307, FALLBACK_IMAGES[0]);
  }

  try {
    // Si es una imagen de Unsplash, servirla directamente
    if (cleanUrl.includes('unsplash.com') || cleanUrl.includes('images.unsplash.com')) {
      console.log('[proxy-image] Imagen de Unsplash, sirviendo directamente');
      return res.redirect(307, cleanUrl);
    }

    // Para imágenes de WordPress, intentar acceso directo primero
    if (cleanUrl.includes('realestategozamadrid.com') && cleanUrl.includes('wp-content')) {
      try {
        console.log('[proxy-image] Probando acceso directo a WordPress:', cleanUrl);
        
        const directResponse = await fetch(cleanUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });

        if (directResponse.ok) {
          console.log('[proxy-image] Acceso directo exitoso, redirigiendo');
          return res.redirect(307, cleanUrl);
        }
      } catch (directError) {
        console.log('[proxy-image] Acceso directo falló, usando proxy:', directError.message);
      }
    }

    // Intentar con servicios de proxy
    const proxyUrl = await tryProxyServices(cleanUrl, w, h);
    
    // Configurar headers de caché
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 horas
    res.setHeader('X-Proxy-Used', 'true');
    res.setHeader('X-Original-URL', cleanUrl);

    console.log('[proxy-image] Redirigiendo a:', proxyUrl);
    return res.redirect(307, proxyUrl);

  } catch (error) {
    console.error('[proxy-image] Error general:', error);
    
    // En caso de error, devolver imagen de fallback
    res.setHeader('X-Proxy-Error', error.message);
    return res.redirect(307, FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]);
  }
} 