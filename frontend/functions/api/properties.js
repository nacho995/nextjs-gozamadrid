/**
 * API unificada para obtener propiedades de MongoDB y WooCommerce
 */
// Middleware para configurar CORS correctamente
function handleCors(request) {
  // Obtener el origen de la solicitud
  const origin = request.headers.get('Origin') || '*';
  
  // Lista de dominios permitidos
  const allowedOrigins = [
    'https://main.gozamadrid-frontend.pages.dev',
    'https://gozamadrid-frontend.pages.dev',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://gozamadrid.es',
    'https://www.gozamadrid.es',
    'http://localhost:3000',
    'http://localhost:8788'
  ];
  
  // Comprobar si el origen está permitido o permitir todos en desarrollo
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Si es una solicitud OPTIONS (preflight), responder adecuadamente
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin'
      }
    });
  }
  
  // Para otras solicitudes, devolver null para indicar que no es una solicitud preflight
  return null;
}

// Aplicar CORS a una respuesta existente
function applyCorsHeaders(headers, request) {
  const origin = request.headers.get('Origin') || '*';
  
  // Lista de dominios permitidos
  const allowedOrigins = [
    'https://main.gozamadrid-frontend.pages.dev',
    'https://gozamadrid-frontend.pages.dev',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://gozamadrid.es',
    'https://www.gozamadrid.es',
    'http://localhost:3000',
    'http://localhost:8788'
  ];
  
  // Comprobar si el origen está permitido o permitir todos en desarrollo
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Si es un objeto Headers o un objeto normal
  let newHeaders = headers instanceof Headers ? new Headers(headers) : new Headers(headers || {});
  
  // Añadir encabezados CORS
  newHeaders.set('Access-Control-Allow-Origin', allowOrigin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  newHeaders.set('Access-Control-Allow-Credentials', 'true');
  newHeaders.set('Vary', 'Origin');
  
  return newHeaders;
}

// Configuración centralizada
const config = {
  // URLs de base
  API_URL: "https://realestategozamadrid.com/api",
  API_BASE_URL: "https://realestategozamadrid.com",
  
  // URLs de MongoDB (sólo para el backend, no exponer al cliente)
  MONGODB_URI: "mongodb+srv://[USER]:[PASSWORD]@cluster0.o6i9n.mongodb.net/GozaMadrid?retryWrites=true&w=majority&appName=Cluster0",
  MONGODB_API_URL: "https://goza-madrid.onrender.com",
  
  // Configuración de timeouts y reintentos
  API_TIMEOUT: 60000,
  MAX_RETRIES: 8,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 32000,
  
  // Configuración de WordPress
  WP_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2",
  WC_API_URL: "https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3",
  
  // Configuración de WooCommerce
  WOO_COMMERCE_KEY: "ck_d69e61427264a7beea70ca9ee543b45dd00cae85",
  WOO_COMMERCE_SECRET: "cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e",
  
  // Configuración de caché
  CACHE_MAX_AGE: 3600,
  STALE_WHILE_REVALIDATE: 60
};

async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  // Obtener el ID de la propiedad si se especifica
  const url = new URL(request.url);
  const propertyId = url.searchParams.get('id');

  try {
    console.log('Ejecutando API para obtener propiedades' + (propertyId ? ` con ID: ${propertyId}` : ''));
    
    // URLs de las APIs - usar env o config centralizado
    const mongodbUrl = env.MONGODB_API_URL || config.MONGODB_API_URL || 'https://goza-madrid.onrender.com';
    const wcApiUrl = env.WC_API_URL || config.WC_API_URL;
    const wooCommerceKey = env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY;
    const wooCommerceSecret = env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET;
    
    // Construir URLs específicas
    const mongodbPropertiesUrl = `${mongodbUrl}/property${propertyId ? `/${propertyId}` : ''}`;
    const wooCommerceUrl = `${wcApiUrl}/products${propertyId ? `/${propertyId}` : ''}`;
    const wooCommerceCredenciales = `?consumer_key=${wooCommerceKey}&consumer_secret=${wooCommerceSecret}`;
    
    // Solicitudes a ambas APIs con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT || 60000); // 60 segundos por defecto
    
    const [mongodbRequest, woocommerceRequest] = await Promise.allSettled([
      fetch(mongodbPropertiesUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cloudflare-Workers'
        },
        signal: controller.signal
      }),
      fetch(`${wooCommerceUrl}${wooCommerceCredenciales}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cloudflare-Workers'
        },
        signal: controller.signal
      })
    ]).finally(() => {
      clearTimeout(timeoutId);
    });
    
    // Variables para almacenar resultados
    let mongodbProperties = [];
    let woocommerceProperties = [];
    let errors = [];
    
    // Procesar resultados de MongoDB
    if (mongodbRequest.status === 'fulfilled' && mongodbRequest.value.ok) {
      try {
        const mongodbData = await mongodbRequest.value.json();
        
        // Asegurar que tenemos un array válido
        const mongoData = Array.isArray(mongodbData) ? mongodbData : 
                         (mongodbData.properties ? (Array.isArray(mongodbData.properties) ? mongodbData.properties : []) : []);
        
        console.log(`Obtenidas ${mongoData.length} propiedades de MongoDB`);
        
        // Transformar datos de MongoDB
        mongodbProperties = mongoData.map(property => ({
          ...property,
          source: 'mongodb'
        }));
      } catch (error) {
        console.error('Error al procesar datos de MongoDB:', error);
        errors.push({
          source: 'mongodb',
          error: error.message
        });
      }
    } else {
      console.error('Error al obtener propiedades de MongoDB:', 
                   mongodbRequest.status === 'fulfilled' ? mongodbRequest.value.status : mongodbRequest.reason);
      errors.push({
        source: 'mongodb',
        error: mongodbRequest.status === 'fulfilled' ? 
              `HTTP ${mongodbRequest.value.status}` : 
              mongodbRequest.reason
      });
    }
    
    // Procesar resultados de WooCommerce
    if (woocommerceRequest.status === 'fulfilled' && woocommerceRequest.value.ok) {
      try {
        // Verificar si la respuesta es HTML
        const contentType = woocommerceRequest.value.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('WooCommerce devolvió HTML en lugar de JSON');
          errors.push({
            source: 'woocommerce',
            error: 'Respuesta en formato HTML (no es JSON válido)'
          });
        } else {
          const woocommerceData = await woocommerceRequest.value.json();
          
          // Verificar si woocommerceData es un array o un objeto
          let products = [];
          if (Array.isArray(woocommerceData)) {
            products = woocommerceData;
          } else if (woocommerceData && typeof woocommerceData === 'object') {
            // Si es un objeto individual o tiene una propiedad que contiene los productos
            if (woocommerceData.id) {
              // Es un producto individual
              products = [woocommerceData];
            } else if (woocommerceData.products && Array.isArray(woocommerceData.products)) {
              products = woocommerceData.products;
            }
          }
          
          console.log(`Obtenidas ${products.length} propiedades de WooCommerce`);
          
          // Transformar datos de WooCommerce al formato común
          woocommerceProperties = products.map(product => {
            // Extraer valores de los metadatos
            const metadataAddress = product.meta_data?.find(meta => meta.key === 'address')?.value;
            let addressValue = '';
            
            // Determinar correctamente el valor de la dirección
            if (metadataAddress) {
              if (typeof metadataAddress === 'object' && metadataAddress.address) {
                // Verificar si la dirección contiene "Australia" o "WA" (ignorar estas direcciones incorrectas)
                const addressStr = metadataAddress.address.toString();
                if (!addressStr.includes('Australia') && !addressStr.includes('WA,')) {
                  addressValue = addressStr;
                }
              } else if (typeof metadataAddress === 'string') {
                addressValue = metadataAddress;
              }
            }
            
            // Obtener valores de camas, baños y área con valores predeterminados seguros
            let bedroomsValue = product.meta_data?.find(meta => meta.key === 'bedrooms')?.value || '0';
            let bathroomsValue = product.meta_data?.find(meta => meta.key === 'baños')?.value || '0';
            let areaValue = product.meta_data?.find(meta => meta.key === 'living_area')?.value || '0';
            const plantaValue = product.meta_data?.find(meta => meta.key === 'Planta')?.value || '0';
            
            // Extraer datos del nombre y descripción
            const description = product.short_description || product.description || '';
            const fullProductName = product.name || '';

            // Determinar el nombre de la calle y la ubicación basada en el nombre del producto
            const streetName = fullProductName.split(',')[0].trim();
            
            // Establecer valores predeterminados para ciertas propiedades específicas por ID
            const propertyDefaults = {
              // ID: [título, dirección, habitaciones, baños, área]
              "3945": ["Calle Colegiata", "Calle Colegiata, Madrid", 4, 2, 167],
              "3895": ["Calle Mejico", "Calle Mejico, Madrid", 2, 1, 66],
              "3772": ["Hermosilla", "Calle Hermosilla, Madrid", 3, 2, 137],
              "3313": ["Lope De Rueda 29", "Lope De Rueda 29, 4ºCentro-Derecha, Madrid", 2, 2, 133],
              "3291": ["Jorge Juan 98", "Calle Jorge Juan 98, Madrid", 2, 2, 144],
              "3268": ["Castelló 120", "Calle Castelló 120, Madrid", 2, 2, 114],
              "3157": ["Alcalde Sainz De Baranda", "Calle Alcalde Sainz De Baranda, Madrid", 2, 2, 111],
              "2844": ["Goya 19", "Calle Goya 19, Madrid", 2, 2, 115],
              "2829": ["Príncipe De Vergara 71", "Calle Príncipe De Vergara 71, Madrid", 4, 4, 223],
              "2763": ["Castelló 109", "Calle Castelló 109, Madrid", 3, 2, 125]
            };
            
            // Obtener ID del producto como string
            const productId = product.id.toString();
            
            // Buscar valores predeterminados para esta propiedad
            const defaultValues = propertyDefaults[productId] || null;
            
            // Convertir valores y manejar valores negativos o inválidos
            let finalBedrooms = parseInt(bedroomsValue) || 0;
            let finalBathrooms = parseInt(bathroomsValue) || 0;
            let finalArea = parseInt(areaValue) || 0;
            
            // Verificar valores negativos y reemplazarlos con los predeterminados
            if (finalBedrooms <= 0) {
              console.log(`API Properties - Valor inválido para habitaciones en ID ${productId}: ${bedroomsValue}, usando valor predeterminado`);
              finalBedrooms = defaultValues ? defaultValues[2] : 2;
            }
            
            if (finalBathrooms <= 0) {
              console.log(`API Properties - Valor inválido para baños en ID ${productId}: ${bathroomsValue}, usando valor predeterminado`);
              finalBathrooms = defaultValues ? defaultValues[3] : 1;
            }
            
            if (finalArea <= 0) {
              console.log(`API Properties - Valor inválido para área en ID ${productId}: ${areaValue}, usando valor predeterminado`);
              finalArea = defaultValues ? defaultValues[4] : 100;
            }
            
            // Construir dirección a partir del nombre de la propiedad si no hay dirección disponible
            let finalAddress = '';
            if (addressValue && addressValue.length > 5) {
              finalAddress = addressValue;
            } else if (defaultValues) {
              finalAddress = defaultValues[1];
            } else {
              // Usar el nombre del producto como dirección si no hay otra disponible
              finalAddress = fullProductName;
              if (!finalAddress.toLowerCase().includes('madrid')) {
                finalAddress += ', Madrid';
              }
            }
            
            // Casos especiales - forzar el uso de los valores predeterminados para las direcciones de ciertas propiedades
            if (defaultValues && (productId === "3313" || productId === "3291" || productId === "3268" || productId === "3157")) {
              finalAddress = defaultValues[1];
              console.log(`API Properties - Forzando dirección predeterminada para ID ${productId}: ${finalAddress}`);
            }
            
            // Determinar título final
            const finalTitle = streetName || (defaultValues ? defaultValues[0] : "Propiedad en Madrid");
            
            console.log(`API Properties - Propiedad ID ${productId}: ${finalTitle}, ${finalAddress}, ${finalBedrooms} hab, ${finalBathrooms} baños, ${finalArea} m²`);
            
            // Crear y devolver objeto de propiedad transformada
            return {
              id: productId,
              title: finalTitle,
              description: description,
              price: parseFloat(product.price),
              currency: '€',
              address: finalAddress,
              bedrooms: finalBedrooms,
              bathrooms: finalBathrooms,
              area: finalArea,
              images: product.images ? product.images.map(img => ({
                src: img.src,
                alt: img.alt || product.name
              })) : [],
              features: [],
              categories: product.categories ? product.categories.map(cat => cat.name) : [],
              source: 'woocommerce',
              createdAt: product.date_created,
              updatedAt: product.date_modified
            };
          });
        }
      } catch (error) {
        console.error('Error al procesar datos de WooCommerce:', error);
        errors.push({
          source: 'woocommerce',
          error: error.message
        });
      }
    } else {
      console.error('Error al obtener propiedades de WooCommerce:', 
                   woocommerceRequest.status === 'fulfilled' ? woocommerceRequest.value.status : woocommerceRequest.reason);
      errors.push({
        source: 'woocommerce',
        error: woocommerceRequest.status === 'fulfilled' ? 
              `HTTP ${woocommerceRequest.value.status}` : 
              woocommerceRequest.reason
      });
    }
    
    // Combinar resultados
    const allProperties = [...mongodbProperties, ...woocommerceProperties];
    
    // Preparar respuesta
    const response = {
      total: allProperties.length,
      mongodb: mongodbProperties.length,
      woocommerce: woocommerceProperties.length,
      properties: allProperties,
      errors: errors.length > 0 ? errors : undefined
    };
    
    // Devolver respuesta combinada
    return new Response(JSON.stringify(response), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }, request)
    });
    
  } catch (error) {
    // Manejar errores generales
    console.error('Error en API combinada de propiedades:', error);
    
    // Detectar si es un error de timeout
    const isTimeout = error.name === 'AbortError';
    const errorMessage = isTimeout ? 
      'La solicitud excedió el tiempo de espera' : 
      `Error al procesar la solicitud: ${error.message}`;
    
    return new Response(JSON.stringify({
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }, request)
    });
  }
}

export { onRequest };
