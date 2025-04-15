import axios from 'axios';

// Configuración de WooCommerce
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');

// Función para transformar la propiedad de WooCommerce
const transformProperty = (property) => {
  try {
    console.log(`[WooCommerce Transform] Transformando propiedad ID: ${property.id}`);
    
    // Extraer metadatos
    const metadata = {};
    if (property.meta_data && Array.isArray(property.meta_data)) {
      property.meta_data.forEach(meta => {
        if (!meta.key.startsWith('_')) {
          metadata[meta.key] = meta.value;
        }
      });
    }
    
    // Extraer características importantes
    const bedrooms = parseInt(metadata.bedrooms) || 0;
    const bathrooms = parseInt(metadata.baños) || parseInt(metadata.bathrooms) || parseInt(metadata.banos) || 0;
    const area = parseInt(metadata.living_area) || parseInt(metadata.area) || parseInt(metadata.m2) || 0;
    
    // Extraer dirección/ubicación
    let location = '';
    if (property.name && (
        property.name.includes("Calle") || 
        property.name.includes("Avenida") || 
        property.name.includes("Plaza") || 
        /^(Calle|C\/|Avda\.|Av\.|Pza\.|Plaza)\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\d*/.test(property.name)
    )) {
      location = property.name;
    } else if (metadata.address) {
      if (typeof metadata.address === 'string') {
        location = metadata.address;
      } else if (typeof metadata.address === 'object') {
        location = metadata.address.address || metadata.address.name || '';
      }
    }
    
    // Procesamiento del precio
    let price = property.price;
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.-]/g, ''));
    }
    if (price < 10000 && price > 100) {
      price *= 1000; // Convertir precios en miles a su valor real
    }
    
    // Preparar imágenes
    const images = property.images ? property.images.map(img => ({
      id: img.id,
      src: img.src,
      alt: img.alt || property.name,
      name: img.name || ''
    })) : [];
    
    console.log(`[WooCommerce Transform] Datos extraídos - Habitaciones: ${bedrooms}, Baños: ${bathrooms}, Área: ${area}m², Ubicación: ${location}`);
    
    // Devolver objeto transformado
    return {
      id: property.id.toString(),
      title: property.name,
      description: property.description || property.short_description || '',
      price: price,
      images: images,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      area: area,
      location: location,
      type: property.categories?.[0]?.name || 'Venta',
      features: {
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        area: area,
        floor: metadata.Planta || null
      },
      source: 'woocommerce',
      createdAt: property.date_created || new Date().toISOString(),
      updatedAt: property.date_modified || new Date().toISOString(),
      metadata: metadata
    };
  } catch (error) {
    console.error('[WooCommerce Transform] Error transformando propiedad:', error.message);
    // Devolver un objeto mínimo con los datos disponibles
    return {
      id: property.id?.toString() || '',
      title: property.name || 'Propiedad sin título',
      description: property.description || property.short_description || '',
      source: 'woocommerce',
      error: error.message
    };
  }
};

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID de propiedad' });
  }

  console.log(`[API WooCommerce] Solicitando propiedad con ID: ${id}`);
  console.log(`[API WooCommerce] URL base: ${WC_API_URL}`);

  try {
    // Construir la URL para obtener un producto específico de WooCommerce
    const url = `${WC_API_URL}/products/${id}`;
    console.log(`[API WooCommerce] URL completa: ${url}`);
    
    const response = await axios.get(url, {
      params: {
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET
      },
      timeout: TIMEOUT
    });

    // Verificar si la respuesta es válida
    if (!response.data) {
      console.log('[API WooCommerce] No se recibieron datos de la API');
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Transformar la propiedad para uso en la aplicación
    const transformedProperty = transformProperty(response.data);
    
    console.log(`[API WooCommerce] Propiedad ${id} obtenida correctamente`);
    
    // Establecer cabeceras de caché para mejorar el rendimiento
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    
    return res.status(200).json(transformedProperty);
  } catch (error) {
    console.error(`[API WooCommerce] Error al obtener propiedad ${id}:`, error.message);
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        return res.status(404).json({ 
          error: `Propiedad con ID ${id} no encontrada`,
          status: 404
        });
      }
      
      return res.status(status).json({
        error: `Error de WooCommerce: ${error.response.data?.message || 'Error desconocido'}`,
        status
      });
    }
    
    return res.status(500).json({ 
      error: `Error al obtener la propiedad: ${error.message}`,
      status: 500
    });
  }
} 