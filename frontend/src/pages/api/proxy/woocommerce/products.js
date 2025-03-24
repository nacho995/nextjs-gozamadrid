import axios from 'axios';
import config from '@/config/config';

const WC_API_URL = process.env.NEXT_PUBLIC_WOO_COMMERCE_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';

// Función para limpiar el contenido de WordPress
const cleanWordPressContent = (content) => {
  if (!content) return "";
  
  let cleanContent = content;
  
  // MÉTODO ULTRA AGRESIVO - PRIMERA PASADA: ELIMINAR TODOS LOS SHORTCODES
  
  // Eliminar absolutamente cualquier shortcode de WPBakery
  cleanContent = cleanContent.replace(/\[\/?vc_[^\]]*\]/g, ""); // Cualquier vc_
  cleanContent = cleanContent.replace(/\[\/?fusion_[^\]]*\]/g, ""); // Cualquier fusion_
  cleanContent = cleanContent.replace(/\[vc_[^\/\]]+.*?\]/g, ""); // vc_ de apertura
  cleanContent = cleanContent.replace(/\[\/vc_[^\]]*\]/g, ""); // vc_ de cierre
  cleanContent = cleanContent.replace(/\[vc_[^\]]*\]/g, ""); // vc_ autocontenido
  
  // Eliminar específicamente los shortcodes problemáticos más comunes
  cleanContent = cleanContent.replace(/\[vc_column_text[^\]]*show_more_toggle[^\]]*\]/g, "");
  cleanContent = cleanContent.replace(/\[\/vc_column_text\]/g, "");
  cleanContent = cleanContent.replace(/\[vc_column_text.*?\]/g, "");
  
  // Eliminar cualquier corchete [...] que quede (agresivo)
  cleanContent = cleanContent.replace(/\[[^\]]*\]/g, "");
  cleanContent = cleanContent.replace(/\[[^\]]*$/g, ""); // Casos donde el corchete se abrió pero nunca se cerró
  
  // MÉTODO ULTRA AGRESIVO - SEGUNDA PASADA: MAPAS Y UBICACIÓN
  
  // Eliminar secciones completas de ubicación
  const findAndRemoveSections = [
    // Eliminar desde un encabezado hasta el siguiente encabezado
    /<h[1-6][^>]*>\s*(?:Ubicación|Ubicación Privilegiada|Ubicacion|Location|Mapa|Map|Como llegar)[^<]*<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi,
    
    // Variaciones lingüísticas de "ubicación"
    /<h[1-6][^>]*>\s*Ubicaci[oóòn][^<]*<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi,
    
    // Variaciones con mayúsculas/minúsculas
    /<h[1-6][^>]*>\s*(?:UBICACI[OÓÒ]N|ubicaci[oóò]n)[^<]*<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi,
    
    // Eliminar cualquier div/section que contenga ubicación en su interior
    /<(?:div|section)[^>]*>[\s\S]*?(?:ubicaci[oóò]n|mapa|locali[zs]aci[oóò]n|location|map)[^<]*[\s\S]*?<\/(?:div|section)>/gi,
    
    // Eliminar divs por clases/IDs relacionados con mapas
    /<(?:div|section)[^>]*(?:class|id)\s*=\s*["'][^"']*(?:map|ubicacion|location)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section)>/gi,
  ];
  
  // Aplicar todas las reglas de eliminación de secciones
  findAndRemoveSections.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, "");
  });
  
  // MÉTODO ULTRA AGRESIVO - TERCERA PASADA: IFRAMES Y MAPAS
  
  // Eliminar agresivamente cualquier iframe de Google Maps
  const iframePatterns = [
    /<iframe[^>]*(?:google\.com\/maps|maps\.google|google\.com\/embed|maps\/embed)[^>]*>[\s\S]*?<\/iframe>/gi,
    /<iframe[^>]*(?:maps\/place|maps\/search|maps\/dir|google.*?\/maps)[^>]*>[\s\S]*?<\/iframe>/gi,
    /<iframe[^>]*(?:src|data-src)\s*=\s*["'][^"']*(?:maps|google)[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi,
    
    // Eliminar cualquier iframe (último recurso, muy agresivo)
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  ];
  
  // Aplicar todas las reglas de eliminación de iframes
  iframePatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, "");
  });
  
  // Eliminar cualquier elemento contenedor que tenga posibles referencias a mapas
  const containersToRemove = [
    // Divs con clases específicas
    /<div[^>]*class\s*=\s*["'][^"']*(?:map|mapa|ubicacion|location)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    
    // Divs con IDs específicos
    /<div[^>]*id\s*=\s*["'][^"']*(?:map|mapa|ubicacion|location)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    
    // Cualquier div que contenga la palabra mapa o ubicación
    /<div[^>]*>[\s\S]*?(?:mapa|ubicaci[oóò]n|location|map)[\s\S]*?<\/div>/gi,
    
    // Sections con contenido relacionado
    /<section[^>]*>[\s\S]*?(?:mapa|ubicaci[oóò]n|location|map)[\s\S]*?<\/section>/gi,
  ];
  
  // Aplicar todas las reglas de eliminación de contenedores
  containersToRemove.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, "");
  });
  
  // MÉTODO ULTRA AGRESIVO - CUARTA PASADA: LIMPIEZA FINAL
  
  // Eliminar botones y controles "mostrar más/menos"
  cleanContent = cleanContent.replace(/Mostrar m[aá]s|Mostrar menos|Show more|Show less/gi, "");
  cleanContent = cleanContent.replace(/<button[^>]*>[^<]*(?:mostrar|show|more|menos|less)[^<]*<\/button>/gi, "");
  cleanContent = cleanContent.replace(/<a[^>]*class\s*=\s*["'][^"']*(?:mostrar|show|more)[^"']*["'][^>]*>.*?<\/a>/gi, "");
  
  // Eliminar elementos vacíos y redundantes
  const cleanupPatterns = [
    /<p[^>]*>(?:\s|&nbsp;)*<\/p>/gi,                     // Párrafos vacíos
    /<div[^>]*>(?:\s|&nbsp;)*<\/div>/gi,                 // Divs vacíos
    /<span[^>]*>(?:\s|&nbsp;)*<\/span>/gi,               // Spans vacíos
    /(?:<br\s*\/?>\s*)+/gi,                              // Múltiples <br>
    /\s{2,}/g,                                           // Espacios múltiples
    /<p><\/p>/g,                                         // Párrafos vacíos
    /<div><\/div>/g,                                     // Divs vacíos
  ];
  
  // Aplicar todas las reglas de limpieza
  cleanupPatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, " ");
  });
  
  // Mejorar estructura HTML
  cleanContent = cleanContent.replace(/<p/g, '<p class="mb-4"');
  cleanContent = cleanContent.replace(/<ul/g, '<ul class="ml-6 mb-6 list-disc"');
  cleanContent = cleanContent.replace(/<h2/g, '<h2 class="text-2xl font-bold mb-4 mt-8"');
  
  return cleanContent;
};

// Función para transformar una propiedad de WooCommerce
const transformProperty = (wcProperty) => {
  try {
    console.log('[WooCommerce Transform] Transformando propiedad:', wcProperty.id);
    
    // Extraer datos de meta_data
    const getMeta = (key) => {
      if (!wcProperty.meta_data || !Array.isArray(wcProperty.meta_data)) return null;
      const meta = wcProperty.meta_data.find(m => m.key === key);
      return meta ? meta.value : null;
    };

    // Extraer precio
    let price = wcProperty.price;
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.-]/g, ''));
    }
    
    // Verificar imágenes
    let images = [];
    if (wcProperty.images && Array.isArray(wcProperty.images) && wcProperty.images.length > 0) {
      console.log(`[WooCommerce Transform] Propiedad ${wcProperty.id} tiene ${wcProperty.images.length} imágenes`);
      console.log(`[WooCommerce Transform] Primera imagen:`, wcProperty.images[0]);
      
      images = wcProperty.images.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt || wcProperty.name,
        name: img.name
      }));
    } else {
      console.log(`[WooCommerce Transform] Propiedad ${wcProperty.id} no tiene imágenes`);
    }
    
    // Limpiar descripción de shortcodes y mapas
    const cleanDescription = cleanWordPressContent(wcProperty.description || wcProperty.short_description || '');
    
    const transformed = {
      _id: wcProperty.id.toString(),
      id: wcProperty.id.toString(),
      title: wcProperty.name,
      description: cleanDescription,
      price: price || 0,
      images: images,
      bedrooms: getMeta('bedrooms') || getMeta('habitaciones') || '0',
      bathrooms: getMeta('baños') || getMeta('bathrooms') || getMeta('banos') || '0',
      area: getMeta('living_area') || getMeta('area') || getMeta('m2') || '0',
      location: getMeta('address') || getMeta('location') || '',
      propertyType: wcProperty.categories?.[0]?.name || 'Venta',
      features: [],
      status: wcProperty.status === 'publish' ? 'Disponible' : 'No disponible',
      source: 'woocommerce',
      type: 'woocommerce',
      createdAt: wcProperty.date_created || new Date().toISOString(),
      updatedAt: wcProperty.date_modified || new Date().toISOString()
    };

    console.log('[WooCommerce Transform] Propiedad transformada:', transformed._id);
    return transformed;
  } catch (error) {
    console.error('[WooCommerce Transform] Error transformando propiedad:', error.message);
    return wcProperty; // Devolver la propiedad original en caso de error
  }
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    // Construir URL y parámetros
    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
      status: 'publish',
      per_page: 50
    });

    const url = id 
      ? `${WC_API_URL}/products/${id}?${params}`
      : `${WC_API_URL}/products?${params}`;

    console.log('[WooCommerce Proxy] Iniciando petición a:', url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
      .replace(/consumer_secret=.*?(&|$)/, 'consumer_secret=HIDDEN$1'));

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('[WooCommerce Proxy] Respuesta recibida:', {
      status: response.status,
      dataLength: response.data ? Array.isArray(response.data) ? response.data.length : 1 : 0
    });

    if (!response.data) {
      console.error('[WooCommerce Proxy] No se recibieron datos');
      return res.status(404).json({
        error: 'No se encontraron propiedades',
        details: 'La respuesta está vacía'
      });
    }

    // Transformar propiedades
    let properties = [];
    if (id) {
      const property = transformProperty(response.data);
      if (property) {
        properties = [property];
      }
    } else {
      properties = Array.isArray(response.data)
        ? response.data.map(transformProperty).filter(Boolean)
        : [transformProperty(response.data)].filter(Boolean);
    }

    console.log(`[WooCommerce Proxy] Transformadas ${properties.length} propiedades`);

    // Cachear la respuesta por 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(properties);

  } catch (error) {
    console.error('[WooCommerce Proxy] Error:', error);
    console.error('[WooCommerce Proxy] Detalles del error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      return res.status(status).json({
        error: 'Error en la petición a WooCommerce',
        details: message,
        status
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Tiempo de espera agotado',
        details: 'La petición a WooCommerce tardó demasiado'
      });
    }

    return res.status(500).json({
      error: 'Error al obtener datos de WooCommerce',
      details: error.message
    });
  }
} 