// Función de Cloudflare Pages para servir blogs dinámicamente
import { handleCors, applyCorsHeaders } from '../api/cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Obtener ID del blog de los parámetros de la URL
    const blogId = params.id;
    if (!blogId) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Blog no encontrado - Goza Madrid</title>
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
                <h1>Blog no encontrado</h1>
                <p>No se encontró el blog solicitado.</p>
                <a href="/blog.html" class="btn">Ver todos los blogs</a>
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

    console.log(`Solicitando blog con ID: ${blogId}`);
    
    // Construir URL base dependiendo de la fuente
    let blogData = null;
    
    // Comprobar si es un ID de WordPress
    if (blogId.startsWith('wp-')) {
      // Es un ID de WordPress
      const wpId = blogId.substring(3); // Quitar el prefijo "wp-"
      const wpApiUrl = env.WP_API_URL || config.WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
      const wpUrl = `${wpApiUrl}/posts/${wpId}?_embed=true`;
      
      try {
        const wpResponse = await fetch(wpUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Cloudflare-Workers'
          }
        });
        
        if (wpResponse.ok) {
          const wpPost = await wpResponse.json();
          // Transformar a formato común
          blogData = {
            _id: `wp-${wpPost.id}`,
            id: `wp-${wpPost.id}`,
            title: wpPost.title.rendered,
            description: wpPost.excerpt.rendered,
            content: wpPost.content.rendered,
            author: wpPost._embedded?.author?.[0]?.name || 'Anónimo',
            category: wpPost._embedded?.['wp:term']?.[0]?.[0]?.name || 'General',
            tags: wpPost._embedded?.['wp:term']?.[1]?.map(tag => tag.name) || [],
            date: wpPost.date,
            dateFormatted: new Date(wpPost.date).toLocaleDateString('es-ES'),
            readTime: '5',
            images: wpPost._embedded?.['wp:featuredmedia'] ? 
              [{
                src: wpPost._embedded['wp:featuredmedia'][0].source_url,
                alt: wpPost._embedded['wp:featuredmedia'][0].alt_text || wpPost.title.rendered
              }] : [],
            image: wpPost._embedded?.['wp:featuredmedia'] ? 
              {
                src: wpPost._embedded['wp:featuredmedia'][0].source_url,
                alt: wpPost._embedded['wp:featuredmedia'][0].alt_text || wpPost.title.rendered
              } : null,
            imageUrl: wpPost._embedded?.['wp:featuredmedia'] ? 
              wpPost._embedded['wp:featuredmedia'][0].source_url : null,
            source: 'wordpress'
          };
        } else {
          console.error(`Error al obtener blog de WordPress: ${wpResponse.status}`);
        }
      } catch (error) {
        console.error(`Error al consultar WordPress: ${error.message}`);
      }
    } else {
      // Asumir que es un ID de MongoDB
      const mongoUrl = `https://goza-madrid.onrender.com/blog/${blogId}`;
      
      try {
        const mongoResponse = await fetch(mongoUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Cloudflare-Workers'
          }
        });
        
        if (mongoResponse.ok) {
          blogData = await mongoResponse.json();
          blogData.source = 'mongodb';
        } else {
          console.error(`Error al obtener blog de MongoDB: ${mongoResponse.status}`);
        }
      } catch (error) {
        console.error(`Error al consultar MongoDB: ${error.message}`);
      }
    }
    
    // Si tenemos datos del blog, generamos la página HTML
    if (blogData) {
      // Construir HTML directamente 
      const blogHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${blogData.title} - Goza Madrid</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                img.featured {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                h1 { color: #2563eb; }
                .meta {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                }
                .content {
                    line-height: 1.7;
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
                <h1>${blogData.title}</h1>
                <div class="meta">
                    Por ${blogData.author} • ${blogData.dateFormatted} • 
                    ${blogData.readTime ? `${blogData.readTime} min de lectura` : ''}
                    ${blogData.category ? ` • ${blogData.category}` : ''}
                </div>
                ${blogData.imageUrl ? `<img class="featured" src="${blogData.imageUrl}" alt="${blogData.title}">` : ''}
            </header>
            
            <div class="content">
                ${blogData.content}
            </div>
            
            <a href="/blog.html" class="back-link">Volver a todos los blogs</a>
        </body>
        </html>
      `;
      
      // Devolver el HTML
      return new Response(blogHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // Si no encontramos el blog, enviamos una página de error
    const notFoundHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Blog no encontrado - Goza Madrid</title>
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
              <h1>Blog no encontrado</h1>
              <p>No se encontró el blog con ID: ${blogId}</p>
              <p>Es posible que el blog haya sido eliminado o que la URL sea incorrecta.</p>
              <a href="/blog.html" class="btn">Ver todos los blogs</a>
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
              <p>Ha ocurrido un error al cargar el blog solicitado.</p>
              <p>Por favor, inténtalo de nuevo o regresa a la página principal de nuestro blog.</p>
              <a href="/blog.html" class="btn">Ver todos los blogs</a>
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