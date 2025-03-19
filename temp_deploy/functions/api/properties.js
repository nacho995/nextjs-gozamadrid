/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * API para propiedades que combina datos de WooCommerce y MongoDB
 * y siempre devuelve un array para evitar errores de .map en el frontend
 */
export async function onRequest(context) {
  try {
    // Headers CORS para permitir el acceso desde cualquier origen
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent, Cache-Control, Pragma',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Para solicitudes OPTIONS (preflight requests)
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Parsear parámetros de consulta
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const page = parseInt(url.searchParams.get('page') || '1');

    console.log(`[PROPERTIES API] Solicitando propiedades con limit=${limit}, page=${page}`);
    console.log(`[PROPERTIES API] URL de solicitud: ${context.request.url}`);
    console.log(`[PROPERTIES API] Origin de la solicitud: ${context.request.headers.get('Origin') || 'No disponible'}`);

    // Array para almacenar todas las propiedades
    let allProperties = [];

    // 1. Obtener propiedades de WooCommerce usando nuestro proxy
    try {
      console.log('[PROPERTIES API] Obteniendo datos de WooCommerce');
      const wooCommerceResponse = await fetch(`https://main.gozamadrid-frontend-new.pages.dev/api/woocommerce-proxy?endpoint=products&page=1&per_page=100`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json'
        }
      });

      if (wooCommerceResponse.ok) {
        const wooCommerceData = await wooCommerceResponse.json();
        console.log(`[PROPERTIES API] Datos de WooCommerce obtenidos: ${Array.isArray(wooCommerceData) ? wooCommerceData.length : 'no es un array'}`);
        
        if (Array.isArray(wooCommerceData) && wooCommerceData.length > 0) {
          // Transformar datos de WooCommerce al formato esperado
          const transformedWooCommerceData = wooCommerceData.map(product => {
            // Extraer metadata de WooCommerce
            const metaBedrooms = product.meta_data?.find(meta => meta.key === 'bedrooms')?.value || '0';
            const metaBathrooms = product.meta_data?.find(meta => meta.key === 'baños')?.value || '0';
            const metaArea = product.meta_data?.find(meta => meta.key === 'living_area')?.value || '0';
            
            // Obtener la imagen principal
            const mainImage = product.images && product.images.length > 0 
              ? product.images[0].src 
              : 'https://via.placeholder.com/800x600?text=Sin+Imagen';
            
            // Obtener todas las imágenes
            const images = product.images ? product.images.map(img => ({
              src: img.src,
              alt: img.alt || product.name
            })) : [];
            
            return {
              id: product.id.toString(),
              type: 'woocommerce',
              source: 'woocommerce',
              title: product.name,
              description: product.description || product.short_description || '',
              price: product.price,
              currency: '€',
              bedrooms: parseInt(metaBedrooms) || 0,
              bathrooms: parseInt(metaBathrooms) || 0,
              size: parseInt(metaArea) || 0,
              image: mainImage,
              images: images,
              createdAt: product.date_created || new Date().toISOString(),
              updatedAt: product.date_modified || new Date().toISOString(),
              categories: product.categories ? product.categories.map(cat => cat.name) : [],
              location: product.name.split(',')[0] || 'Madrid'
            };
          });
          
          allProperties = [...transformedWooCommerceData];
        }
      } else {
        console.error(`[PROPERTIES API] Error al obtener datos de WooCommerce: ${wooCommerceResponse.status}`);
      }
    } catch (wooError) {
      console.error('[PROPERTIES API] Error al procesar datos de WooCommerce:', wooError);
    }

    // 2. Obtener propiedades de MongoDB (con el endpoint correcto /property)
    try {
      console.log('[PROPERTIES API] Obteniendo datos de MongoDB desde endpoint correcto');
      
      // Usar la URL absoluta del proxy para asegurar que sea completa
      const mongoDbProxyUrl = new URL('/api/proxy', url.origin).toString();
      const fullMongoUrl = `${mongoDbProxyUrl}?service=mongodb&resource=property`;
      console.log(`[PROPERTIES API] Solicitando a MongoDB a través del proxy: ${fullMongoUrl}`);
      
      // Verificar si estamos ejecutando en desarrollo o producción
      console.log(`[PROPERTIES API] Entorno: ${context.env.ENVIRONMENT || 'no definido'}`);
      console.log(`[PROPERTIES API] MongoDB API URL configurada: ${context.env.MONGODB_API_URL || 'no definida'}`);
      
      // Agregamos timeout más largo y mejor manejo de errores
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
      
      try {
        const mongoResponse = await fetch(fullMongoUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': 'Cloudflare-Worker'
          },
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        // Agregar logs de respuesta para diagnóstico
        console.log(`[PROPERTIES API] Estado de respuesta MongoDB Proxy: ${mongoResponse.status} ${mongoResponse.statusText}`);
        
        // Si la respuesta es exitosa, procesar los datos
        if (mongoResponse.ok) {
          // Intentar leer el cuerpo de la respuesta con manejo de errores
          let mongoData;
          try {
            mongoData = await mongoResponse.json();
            console.log(`[PROPERTIES API] Datos de MongoDB obtenidos: ${Array.isArray(mongoData) ? mongoData.length : 'no es un array'}`);
            if (Array.isArray(mongoData) && mongoData.length > 0) {
              console.log(`[PROPERTIES API] Muestra de datos MongoDB: ${JSON.stringify(mongoData[0]._id)}`);
            }
          } catch (jsonError) {
            console.error(`[PROPERTIES API] Error al parsear JSON de MongoDB:`, jsonError);
            const textResponse = await mongoResponse.text();
            console.log(`[PROPERTIES API] Respuesta texto de MongoDB (primeros 500 caracteres): ${textResponse.substring(0, 500)}`);
            throw new Error(`Error al parsear JSON: ${jsonError.message}`);
          }
          
          if (Array.isArray(mongoData) && mongoData.length > 0) {
            // Transformar datos de MongoDB al formato común
            const transformedMongoData = mongoData.map(property => {
              // Obtener la imagen principal
              const mainImage = property.images && property.images.length > 0 
                ? property.images[0].src 
                : 'https://via.placeholder.com/800x600?text=Sin+Imagen';
              
              // Asegurarnos de que los valores numéricos sean tratados correctamente
              const bedrooms = parseInt(property.bedrooms) || 0;
              const bathrooms = parseInt(property.bathrooms) || 0;
              const size = parseInt(property.area) || parseInt(property.m2) || 0;
              
              // Preparar imágenes en formato compatible con el frontend
              const formattedImages = property.images && property.images.length > 0
                ? property.images.map(img => ({
                    src: img.src,
                    alt: img.alt || property.title || 'Imagen de propiedad'
                  }))
                : [];
                
              // Convertir tags en categorías si existen, o usar un array con un valor por defecto
              let categories = [];
              if (property.tags && Array.isArray(property.tags) && property.tags.length > 0) {
                categories = property.tags;
              } else {
                // Si no hay tags, usar el tipo de propiedad como categoría
                categories = [property.propertyType || 'Venta'];
              }
              
              // Asegurarnos de que el ID sea una cadena
              const id = property._id ? property._id.toString() : '';
              
              return {
                id: id,
                type: 'mongodb',
                source: 'mongodb',
                title: property.title || '',
                description: property.description || '',
                price: property.price || '0',
                currency: '€',
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                size: size,
                image: mainImage,
                images: formattedImages,
                createdAt: property.createdAt || new Date().toISOString(),
                updatedAt: property.updatedAt || new Date().toISOString(),
                categories: categories,
                location: property.location || property.address || 'Madrid',
                propertyType: property.propertyType || 'Venta',
                status: property.status || 'Disponible'
              };
            });
            
            // Verificar duplicados por ID
            const existingIds = allProperties.map(p => p.id);
            const uniqueMongoData = transformedMongoData.filter(p => !existingIds.includes(p.id));
            
            console.log(`[PROPERTIES API] Agregando ${uniqueMongoData.length} propiedades de MongoDB`);
            console.log(`[PROPERTIES API] IDs de MongoDB: ${uniqueMongoData.map(p => p.id).join(', ')}`);
            
            // Agregar propiedades de MongoDB a la lista global
            allProperties = [...allProperties, ...uniqueMongoData];
            
            // Verificación final después de combinar
            console.log(`[PROPERTIES API] Total de propiedades combinadas: ${allProperties.length}`);
            console.log(`[PROPERTIES API] Propiedades de MongoDB después de combinar: ${allProperties.filter(p => p.type === 'mongodb').length}`);
          } else {
            console.error('[PROPERTIES API] MongoDB respondió correctamente pero no devolvió un array válido de propiedades');
          }
        } else {
          // Si hay error, intentar leer el mensaje de error
          try {
            const errorBody = await mongoResponse.text();
            console.error(`[PROPERTIES API] Error al obtener datos de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}. Detalles: ${errorBody}`);
          } catch (e) {
            console.error(`[PROPERTIES API] Error al obtener datos de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}. No se pudo leer el cuerpo del error.`);
          }
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.error('[PROPERTIES API] Timeout al conectar con MongoDB después de 30 segundos');
        } else {
          console.error('[PROPERTIES API] Error en la solicitud fetch a MongoDB:', fetchError);
        }
      }
    } catch (mongoError) {
      console.error('[PROPERTIES API] Error global al procesar datos de MongoDB:', mongoError);
    }

    // Verificar que tenemos propiedades de ambas fuentes
    console.log(`[PROPERTIES API] WooCommerce: ${allProperties.filter(p => p.type === 'woocommerce').length} propiedades`);
    console.log(`[PROPERTIES API] MongoDB: ${allProperties.filter(p => p.type === 'mongodb').length} propiedades`);

    // Aplicar paginación si es necesario
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProperties = allProperties.slice(startIndex, endIndex);
    
    // Verificar propiedades después de paginación
    console.log(`[PROPERTIES API] Propiedades después de paginación (página ${page}): ${paginatedProperties.length}`);
    console.log(`[PROPERTIES API] Propiedades MongoDB en esta página: ${paginatedProperties.filter(p => p.type === 'mongodb').length}`);

    // Preparar respuesta
    const response = {
      success: true,
      message: "Lista de propiedades recuperada con éxito",
      total: allProperties.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(allProperties.length / limit),
      properties: paginatedProperties
    };

    // Importante: Devolver el array vacío si no hay propiedades
    if (!Array.isArray(paginatedProperties) || paginatedProperties.length === 0) {
      console.log('[PROPERTIES API] No hay propiedades disponibles - devolviendo array vacío');
      return new Response(JSON.stringify({
        ...response,
        properties: []
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[PROPERTIES API] Error general en la API:', error);
    
    // Headers CORS para respuestas de error
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent, Cache-Control, Pragma',
      'Content-Type': 'application/json'
    };
    
    // Devolver una respuesta con un array vacío para evitar errores en el frontend
    return new Response(JSON.stringify({
      success: false,
      message: `Error al obtener propiedades: ${error.message || 'Error desconocido'}`,
      properties: [],
      error: error.message || 'Error desconocido'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
