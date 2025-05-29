// Función de Cloudflare Pages para servir propiedades dinámicamente
import { handleCors, applyCorsHeaders } from '../api/cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Obtener ID de la propiedad de los parámetros de la URL
    const propertyId = params.id;
    if (!propertyId) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Propiedad no encontrada - Goza Madrid</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: center;
                }
                h1 { color: #2563eb; }
                .error-container {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 2rem;
                    margin-top: 2rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .btn {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    text-decoration: none;
                    margin-top: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>Propiedad no encontrada</h1>
                <p>No se encontró la propiedad solicitada.</p>
                <a href="/listar-propiedades.html" class="btn">Ver todas las propiedades</a>
            </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: {
          'Content-Type': 'text/html',
        }
      });
    }

    console.log(`Solicitando propiedad con ID: ${propertyId}`);
    
    // Extraer parámetros de consulta
    const url = new URL(request.url);
    const source = url.searchParams.get('source') || 
                 (propertyId.length === 24 && /^[0-9a-fA-F]{24}$/.test(propertyId) ? 'mongodb' : 'woocommerce');
    
    console.log(`Fuente determinada para propiedad ${propertyId}: ${source}`);
    
    // Variables para datos de la propiedad
    let propertyData = null;
    
    if (source === 'woocommerce') {
      // WooCommerce - usar el ID numérico
      const wcApiUrl = env.WC_API_URL || config.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
      const wcKey = env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
      const wcSecret = env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
      
      const wcUrl = `${wcApiUrl}/products/${propertyId}?consumer_key=${wcKey}&consumer_secret=${wcSecret}`;
      
      try {
        const wcResponse = await fetch(wcUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Cloudflare-Workers'
          }
        });
        
        if (wcResponse.ok) {
          const product = await wcResponse.json();
          
          // Transformar datos de WooCommerce al formato común
          propertyData = {
            id: product.id.toString(),
            title: product.name,
            description: product.short_description || product.description,
            price: product.price ? `${product.price} €` : 'Consultar precio',
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
          };
        } else {
          console.error(`Error al obtener propiedad de WooCommerce: ${wcResponse.status}`);
        }
      } catch (error) {
        console.error(`Error al consultar WooCommerce: ${error.message}`);
      }
    } else {
      // MongoDB
      const mongodbUrl = env.MONGODB_API_URL || config.MONGODB_API_URL || 'https://goza-madrid.onrender.com';
      const mongoUrl = `${mongodbUrl}/property/${propertyId}`;
      
      try {
        console.log(`Usando URL: ${mongoUrl}`);
        const mongoResponse = await fetch(mongoUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Cloudflare-Workers'
          }
        });
        
        if (mongoResponse.ok) {
          propertyData = await mongoResponse.json();
          propertyData.source = 'mongodb';
        } else {
          console.error(`Error al obtener propiedad de MongoDB: ${mongoResponse.status}`);
        }
      } catch (error) {
        console.error(`Error al consultar MongoDB: ${error.message}`);
      }
    }
    
    // Si tenemos datos de la propiedad, generamos la página HTML
    if (propertyData) {
      // Construir HTML directamente
      const propertyHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${propertyData.title} - Goza Madrid</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }
                header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .gallery {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .gallery img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                h1 { color: #2563eb; margin-bottom: 0.5rem; }
                .price {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 1rem;
                }
                .meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background-color: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .description {
                    line-height: 1.7;
                    margin-bottom: 2rem;
                }
                .back-link {
                    display: inline-block;
                    background-color: #2563eb;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    text-decoration: none;
                    margin-top: 2rem;
                }
                .navigation {
                    padding: 1rem 0;
                    background-color: #f8f9fa;
                    margin-bottom: 2rem;
                }
                .navigation a {
                    color: #2563eb;
                    text-decoration: none;
                    margin-right: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="navigation">
                <a href="/">Inicio</a>
                <a href="/blog.html">Blogs</a>
                <a href="/listar-propiedades.html">Propiedades</a>
            </div>
            
            <header>
                <h1>${propertyData.title}</h1>
                <div class="price">${propertyData.price || 'Consultar precio'}</div>
            </header>
            
            <div class="gallery">
                ${propertyData.images && propertyData.images.length > 0 
                  ? propertyData.images.map(img => 
                      `<img src="${img.src}" alt="${img.alt || propertyData.title}">`
                    ).join('') 
                  : '<img src="/img/default-property.jpg" alt="Imagen no disponible">'}
            </div>
            
            <div class="meta">
                ${propertyData.bedrooms ? `
                <div class="meta-item">
                    <span>🛏️</span>
                    <span>${propertyData.bedrooms} habitaciones</span>
                </div>` : ''}
                
                ${propertyData.bathrooms ? `
                <div class="meta-item">
                    <span>🚿</span>
                    <span>${propertyData.bathrooms} baños</span>
                </div>` : ''}
                
                ${propertyData.area ? `
                <div class="meta-item">
                    <span>📏</span>
                    <span>${propertyData.area} m²</span>
                </div>` : ''}
                
                ${propertyData.address ? `
                <div class="meta-item">
                    <span>📍</span>
                    <span>${propertyData.address}</span>
                </div>` : ''}
            </div>
            
            <div class="description">
                ${propertyData.description ? propertyData.description : 'No hay descripción disponible para esta propiedad.'}
            </div>
            
            <a href="/listar-propiedades.html" class="back-link">Volver a todas las propiedades</a>
        </body>
        </html>
      `;
      
      // Devolver el HTML
      return new Response(propertyHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // Si no encontramos la propiedad, enviamos una página de error
    const notFoundHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Propiedad no encontrada - Goza Madrid</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  text-align: center;
              }
              h1 { color: #2563eb; }
              .error-container {
                  background-color: #f8f9fa;
                  border-radius: 8px;
                  padding: 2rem;
                  margin-top: 2rem;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .btn {
                  display: inline-block;
                  background-color: #2563eb;
                  color: white;
                  padding: 0.5rem 1rem;
                  border-radius: 0.25rem;
                  text-decoration: none;
                  margin-top: 1rem;
              }
              .navigation {
                  padding: 1rem 0;
                  background-color: #f8f9fa;
                  margin-bottom: 2rem;
              }
              .navigation a {
                  color: #2563eb;
                  text-decoration: none;
                  margin-right: 1rem;
              }
          </style>
      </head>
      <body>
          <div class="navigation">
              <a href="/">Inicio</a>
              <a href="/blog.html">Blogs</a>
              <a href="/listar-propiedades.html">Propiedades</a>
          </div>
          
          <div class="error-container">
              <h1>Propiedad no encontrada</h1>
              <p>No se encontró la propiedad con ID: ${propertyId}</p>
              <p>Es posible que la propiedad haya sido eliminada o que la URL sea incorrecta.</p>
              <a href="/listar-propiedades.html" class="btn">Ver todas las propiedades</a>
          </div>
      </body>
      </html>
    `;
    
    return new Response(notFoundHtml, {
      status: 404,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Error en función de Cloudflare:', error);
    
    // Crear respuesta de error HTML con mensaje amigable
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Goza Madrid</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  text-align: center;
              }
              h1 { color: #2563eb; }
              .error-container {
                  background-color: #f8f9fa;
                  border-radius: 8px;
                  padding: 2rem;
                  margin-top: 2rem;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .btn {
                  display: inline-block;
                  background-color: #2563eb;
                  color: white;
                  padding: 0.5rem 1rem;
                  border-radius: 0.25rem;
                  text-decoration: none;
                  margin-top: 1rem;
              }
              .error-details {
                  background-color: #f1f1f1;
                  padding: 1rem;
                  border-radius: 4px;
                  margin-top: 1rem;
                  text-align: left;
                  font-family: monospace;
                  overflow-x: auto;
              }
              .navigation {
                  padding: 1rem 0;
                  background-color: #f8f9fa;
                  margin-bottom: 2rem;
              }
              .navigation a {
                  color: #2563eb;
                  text-decoration: none;
                  margin-right: 1rem;
              }
          </style>
      </head>
      <body>
          <div class="navigation">
              <a href="/">Inicio</a>
              <a href="/blog.html">Blogs</a>
              <a href="/listar-propiedades.html">Propiedades</a>
          </div>
          
          <div class="error-container">
              <h1>Lo sentimos</h1>
              <p>Ha ocurrido un error al cargar la propiedad solicitada.</p>
              <p>Por favor, inténtalo de nuevo o regresa a la página principal de propiedades.</p>
              <a href="/listar-propiedades.html" class="btn">Ver todas las propiedades</a>
              <div class="error-details">
                Error: ${error.message}
              </div>
          </div>
      </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  }
} 