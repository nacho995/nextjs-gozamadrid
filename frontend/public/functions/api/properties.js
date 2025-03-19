// API unificada para obtener propiedades de MongoDB y WooCommerce
import { handleCors, applyCorsHeaders } from './cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
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
        console.log(`Obtenidas ${mongodbData.length} propiedades de MongoDB`);
        
        // Transformar datos de MongoDB
        mongodbProperties = mongodbData.map(property => ({
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
          console.log(`Obtenidas ${woocommerceData.length} propiedades de WooCommerce`);
          
          // Transformar datos de WooCommerce al formato común
          woocommerceProperties = woocommerceData.map(product => ({
            id: product.id.toString(),
            title: product.name,
            description: product.short_description || product.description,
            price: parseFloat(product.price),
            currency: '€',
            address: product.meta_data?.find(meta => meta.key === 'address')?.value || '',
            bedrooms: product.meta_data?.find(meta => meta.key === 'bedrooms')?.value || '0',
            bathrooms: product.meta_data?.find(meta => meta.key === 'ba\\u00f1os')?.value || '0',
            area: product.meta_data?.find(meta => meta.key === 'living_area')?.value || '0',
            images: product.images.map(img => ({
              src: img.src,
              alt: img.alt || product.name
            })),
            features: [],
            categories: product.categories.map(cat => cat.name),
            source: 'woocommerce',
            createdAt: product.date_created,
            updatedAt: product.date_modified
          }));
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