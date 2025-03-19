/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Manejador directo para propiedades de MongoDB - Solución para acceso directo
 * Este script permite acceder directamente a propiedades de MongoDB 
 * incluso cuando Next.js no las reconoce en sus rutas estáticas
 */

// Backend API URL - Asegurarse de que es la correcta
const BACKEND_API_URL = 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';

// Caché en memoria para reducir conexiones a la API
let propertyCache = {};

// Timeout para fetch en milisegundos (10 segundos)
const FETCH_TIMEOUT = 10000;

// Función para hacer fetch con timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function onRequest(context) {
  const { request, env, params } = context;
  
  console.log('PropertyDirect: Solicitud recibida', {
    url: request.url,
    method: request.method,
    params: JSON.stringify(params || {})
  });
  
  // Cabeceras CORS para permitir acceso desde cualquier origen
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
  });
  
  // Manejar preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers, status: 200 });
  }
  
  try {
    // Obtener ID de propiedad de la URL o de los parámetros
    let propertyId = null;
    
    // Primero intentar obtener desde params (rutas dinámicas de Cloudflare)
    if (params && params.id) {
      propertyId = params.id;
      console.log('PropertyDirect: ID obtenido de params:', propertyId);
    } else {
      // Si no está en params, intentar extraer de la URL con regex
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Probar diferentes patrones de URL (tanto /property/ como /api/property-direct/)
      const propertyPattern = /\/property\/([^\/\?]+)/;
      const apiPattern = /\/api\/property(?:-direct)?\/([^\/\?]+)/;
      
      let matches = path.match(propertyPattern) || path.match(apiPattern);
      
      if (matches && matches[1]) {
        propertyId = matches[1];
        console.log('PropertyDirect: ID obtenido de URL con regex:', propertyId);
      } else {
        // Último intento: buscar como parámetro en la query string
        propertyId = url.searchParams.get('id');
        if (propertyId) {
          console.log('PropertyDirect: ID obtenido de query string:', propertyId);
        }
      }
    }
    
    if (!propertyId) {
      console.error('PropertyDirect: No se pudo obtener ID de la propiedad', {
        url: request.url,
        params: JSON.stringify(params || {}),
        path: new URL(request.url).pathname
      });
      
      headers.set('Content-Type', 'application/json');
      return new Response(JSON.stringify({ 
        error: 'ID de propiedad no proporcionado',
        debug: {
          url: request.url,
          path: new URL(request.url).pathname,
          params: params || 'No params'
        }
      }), { status: 400, headers });
    }
    
    console.log('PropertyDirect: ID de propiedad solicitada:', propertyId);
    
    // Verificar si la propiedad está en caché
    if (propertyCache[propertyId]) {
      const cachedProperty = propertyCache[propertyId];
      const cacheAge = Date.now() - cachedProperty.timestamp;
      
      // Si la caché es reciente (menos de 5 minutos), usar datos en caché
      if (cacheAge < 300000) {
        console.log('PropertyDirect: Usando datos en caché para:', propertyId);
        
        // Determinar el formato de respuesta (JSON o HTML)
        const url = new URL(request.url);
        const format = url.searchParams.get('format') || 'json';
        
        if (format === 'html') {
          headers.set('Content-Type', 'text/html; charset=utf-8');
          return new Response(renderPropertyHTML(cachedProperty.data), { headers, status: 200 });
        } else {
          headers.set('Content-Type', 'application/json');
          return new Response(JSON.stringify({ 
            property: cachedProperty.data,
            source: 'mongodb',
            cached: true
          }), { headers, status: 200 });
        }
      }
    }
    
    // Determinar si es un ID de MongoDB (24 caracteres hexadecimales)
    const isMongoDBId = /^[0-9a-f]{24}$/.test(propertyId);
    const source = new URL(request.url).searchParams.get('source') || (isMongoDBId ? 'mongodb' : 'unknown');
    
    // Si la API está caída, generar una propiedad de demostración
    let property = null;
    let apiError = null;
    
    try {
      if (isMongoDBId || source === 'mongodb') {
        // Si es un ID de MongoDB, usar endpoint específico para MongoDB
        const apiEndpoint = `${BACKEND_API_URL}/api/mongodb/properties/${propertyId}`;
        const backupEndpoint = `${BACKEND_API_URL}/api/properties?id=${propertyId}&source=mongodb`;
        
        console.log('PropertyDirect: Intentando conectar a API en:', apiEndpoint);
        
        try {
          // Intentar con el endpoint principal con timeout
          const response = await fetchWithTimeout(apiEndpoint, {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
          }
          
          const apiData = await response.json();
          
          // Extraer la propiedad de la respuesta
          if (apiData && (apiData.property || (typeof apiData === 'object' && apiData._id))) {
            property = apiData.property || apiData;
          }
          
        } catch (mainError) {
          console.log('PropertyDirect: Error en endpoint principal, probando respaldo:', mainError.message);
          
          try {
            // Intentar con el endpoint de respaldo
            const backupResponse = await fetchWithTimeout(backupEndpoint, {
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            if (!backupResponse.ok) {
              throw new Error(`Error HTTP ${backupResponse.status}`);
            }
            
            const backupData = await backupResponse.json();
            
            // Extraer la propiedad de la respuesta
            if (backupData && backupData.properties && backupData.properties.length > 0) {
              property = backupData.properties[0];
            }
            
          } catch (backupError) {
            console.error('PropertyDirect: Error también en el endpoint de respaldo:', backupError.message);
            apiError = `No se pudo conectar a la API: ${backupError.message}`;
          }
        }
      } else {
        // Si no es un ID de MongoDB, intentar el endpoint general
        const apiEndpoint = `${BACKEND_API_URL}/api/properties?id=${propertyId}`;
        
        try {
          const response = await fetchWithTimeout(apiEndpoint, {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
          }
          
          const apiData = await response.json();
          
          // Extraer la propiedad de la respuesta
          if (apiData && apiData.properties && apiData.properties.length > 0) {
            property = apiData.properties[0];
          }
          
        } catch (error) {
          console.error('PropertyDirect: Error al consultar propiedades normales:', error.message);
          apiError = `No se pudo conectar a la API: ${error.message}`;
        }
      }
    } catch (fetchError) {
      console.error('PropertyDirect: Error global de fetch:', fetchError.message);
      apiError = `Error de conexión: ${fetchError.message}`;
    }
    
    // Si no se pudo obtener la propiedad, crear una de demostración
    if (!property) {
      console.log('PropertyDirect: Generando propiedad de demostración para:', propertyId);
      
      property = createDemoProperty(propertyId, apiError);
      
      // Guardar en caché solo por 1 minuto (60000 ms) ya que es una demostración
      propertyCache[propertyId] = {
        data: property,
        timestamp: Date.now(),
        isDemoData: true
      };
    } else {
      // Guardar propiedad real en caché por 5 minutos
      propertyCache[propertyId] = {
        data: property,
        timestamp: Date.now(),
        isDemoData: false
      };
    }
    
    // Limpiar caché si tiene más de 50 elementos
    const cacheKeys = Object.keys(propertyCache);
    if (cacheKeys.length > 50) {
      // Eliminar la entrada más antigua
      let oldestKey = cacheKeys[0];
      let oldestTimestamp = propertyCache[oldestKey].timestamp;
      
      for (const key of cacheKeys) {
        if (propertyCache[key].timestamp < oldestTimestamp) {
          oldestKey = key;
          oldestTimestamp = propertyCache[key].timestamp;
        }
      }
      
      delete propertyCache[oldestKey];
      console.log('PropertyDirect: Caché limpiada, eliminada entrada:', oldestKey);
    }
    
    // Determinar el formato de respuesta (JSON o HTML)
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    
    if (format === 'html') {
      // Respuesta HTML para embedding
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(renderPropertyHTML(property), { 
        status: 200, 
        headers
      });
    } else {
      // Respuesta JSON por defecto
      headers.set('Content-Type', 'application/json');
      return new Response(JSON.stringify({ 
        property,
        source: propertyCache[propertyId].isDemoData ? 'demo' : 'api',
        id: propertyId,
        apiStatus: apiError ? 'error' : 'ok',
        apiError: apiError || null
      }), { 
        status: 200, 
        headers
      });
    }
    
  } catch (error) {
    console.error('PropertyDirect: Error general:', error);
    
    // Intentar entregar un HTML de error en lugar de JSON si se solicitó formato HTML
    try {
      const url = new URL(request.url);
      const format = url.searchParams.get('format') || 'json';
      
      if (format === 'html') {
        headers.set('Content-Type', 'text/html; charset=utf-8');
        return new Response(renderErrorHTML(error.message), { status: 500, headers });
      }
    } catch (e) {
      // Si hay error al procesar formato, continuar con JSON
    }
    
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ 
      error: 'Error al procesar la solicitud',
      message: error.message,
      stack: error.stack,
      url: request.url
    }), { status: 500, headers });
  }
}

// Función para crear una propiedad de demostración cuando la API no está disponible
function createDemoProperty(id, apiError) {
  return {
    _id: id,
    title: "Propiedad de demostración (API no disponible)",
    price: 350000,
    area: 120,
    bedrooms: 3,
    bathrooms: 2,
    description: `<p>Esta es una propiedad de demostración creada porque la API no está disponible en este momento.</p>
                <p>Error de API: ${apiError || 'No se pudo conectar con el servidor'}</p>
                <p>En condiciones normales, aquí vería los detalles reales de la propiedad con ID: ${id}</p>`,
    location: "Madrid, España",
    propertyType: "Piso",
    operation: "Venta",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
    ],
    source: "mongodb-demo",
    isDemo: true,
    apiError: apiError || 'API no disponible'
  };
}

// Función para renderizar HTML de propiedad
function renderPropertyHTML(property) {
  if (!property) {
    return renderErrorHTML('Datos de propiedad no disponibles');
  }
  
  // Formatear precio para mostrar
  const formatPrice = (price) => {
    if (!price) return 'Precio a consultar';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(price);
  };
  
  // Formatear superficie para mostrar
  const formatArea = (area) => {
    if (!area) return 'No especificada';
    return `${area} m²`;
  };
  
  // Determinar imágenes a mostrar
  let images = [];
  if (property.images && property.images.length > 0) {
    images = property.images;
  } else if (property.image) {
    images = [property.image];
  }
  
  // Generar HTML para imágenes
  const imagesHTML = images.length > 0 
    ? `
      <div class="property-images">
        <img src="${images[0]}" alt="${property.title || 'Propiedad'}" class="main-image">
        ${images.length > 1 ? `
          <div class="image-thumbnails">
            ${images.slice(0, 4).map(img => `
              <div class="thumbnail">
                <img src="${img}" alt="">
              </div>
            `).join('')}
            ${images.length > 4 ? `<div class="thumbnail more">+${images.length - 4}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `
    : '<div class="no-image">Imagen no disponible</div>';
  
  // Preparar características
  const features = [];
  if (property.bedrooms) features.push(`${property.bedrooms} Habitaciones`);
  if (property.bathrooms) features.push(`${property.bathrooms} Baños`);
  if (property.area) features.push(`${formatArea(property.area)}`);
  if (property.propertyType) features.push(property.propertyType);
  
  // Características en HTML
  const featuresHTML = features.length > 0
    ? `
      <div class="property-features">
        ${features.map(feature => `<span class="feature">${feature}</span>`).join('')}
      </div>
    `
    : '';
    
  // Mostrar advertencia si es propiedad de demostración
  const demoWarningHTML = property.isDemo
    ? `
      <div class="demo-warning">
        <strong>⚠️ Propiedad de demostración</strong>
        <p>Esta propiedad se muestra porque la API no está disponible. Error: ${property.apiError || 'No se pudo conectar con el servidor'}</p>
      </div>
    `
    : '';
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${property.title || 'Propiedad'} | GozaMadrid</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .property-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .property-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        .property-title {
          font-size: 24px;
          margin: 0 0 10px;
          color: #222;
        }
        .property-price {
          font-size: 22px;
          font-weight: bold;
          color: #007bff;
          margin: 0 0 10px;
        }
        .property-address {
          color: #666;
          margin: 0 0 10px;
        }
        .property-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .tag {
          background-color: #e9f5ff;
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 14px;
          color: #0066cc;
        }
        .property-features {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }
        .feature {
          display: inline-flex;
          align-items: center;
          font-size: 16px;
        }
        .property-description {
          padding: 20px;
        }
        .property-images {
          position: relative;
          overflow: hidden;
        }
        .main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }
        .image-thumbnails {
          display: flex;
          gap: 10px;
          padding: 10px 20px;
          background-color: #f8f9fa;
        }
        .thumbnail {
          width: 80px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumbnail.more {
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .no-image {
          height: 200px;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-style: italic;
        }
        .contact-button {
          display: inline-block;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
          transition: background-color 0.3s;
        }
        .contact-button:hover {
          background-color: #218838;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .demo-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .main-image {
            height: 250px;
          }
          .property-title {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="property-card">
        ${imagesHTML}
        
        <div class="property-header">
          <h1 class="property-title">${property.title || 'Propiedad en venta'}</h1>
          <div class="property-price">${formatPrice(property.price)}</div>
          <div class="property-address">${property.location || property.address || 'Madrid'}</div>
          
          <div class="property-tags">
            <span class="tag">${property.operation || 'Venta'}</span>
            ${property.propertyType ? `<span class="tag">${property.propertyType}</span>` : ''}
            ${property.source ? `<span class="tag">Fuente: ${property.source}</span>` : ''}
          </div>
        </div>
        
        ${featuresHTML}
        
        ${demoWarningHTML}
        
        <div class="property-description">
          <h2>Descripción</h2>
          <div>${property.description || 'No hay descripción disponible para esta propiedad.'}</div>
          
          <a href="${property.url || '/'}" class="contact-button" target="_blank">Ver más detalles</a>
        </div>
      </div>
      
      <div class="footer">
        <p>Propiedad ofrecida por <a href="https://gozamadrid.com" target="_blank">GozaMadrid Real Estate</a></p>
        <p>ID de la propiedad: ${property._id || property.id || 'No disponible'}</p>
      </div>
    </body>
    </html>
  `;
}

// Función para renderizar HTML de error
function renderErrorHTML(errorMessage) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - Propiedad no disponible</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .error-container {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
        }
        h1 {
          color: #721c24;
          margin-top: 0;
        }
        p {
          margin-bottom: 16px;
        }
        .btn {
          display: inline-block;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          padding: 10px 15px;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>Error al cargar la propiedad</h1>
        <p>Lo sentimos, no pudimos cargar la información de esta propiedad.</p>
        <p>Error: ${errorMessage}</p>
        <p>Por favor, intente nuevamente más tarde o contacte con nuestro equipo de soporte.</p>
        <a href="/" class="btn">Volver al inicio</a>
      </div>
    </body>
    </html>
  `;
} 