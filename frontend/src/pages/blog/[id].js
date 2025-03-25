import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Usar una imagen local en lugar de placeholder.com
const DEFAULT_IMAGE = '/img/default-image.jpg';

// URLs de API para los blogs
const MONGODB_BLOGS_API = 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/blogs';
const WORDPRESS_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/posts';

// Importar la utilidad para WordPress
import { getPostBySlug } from '../../utils/wp-api';

const BlogDetail = () => {
  const router = useRouter();
  const { id, source } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blog, setBlog] = useState(null);

  // Cargar datos del blog en el cliente
  useEffect(() => {
    // Asegurarse que id esté disponible (router.query puede tardar en estar disponible)
    if (!id) return;
    
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Intentando obtener blog con ID: ${id}, source: ${source || 'no especificado'}`);
        
        // Determinar el tipo de ID
        const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
        const isWordPress = source === 'wordpress' || (!isMongoId && id.includes('-'));
        
        // Intentar primero con la fuente especificada (si la hay)
        const useMongoDbFirst = source === 'mongodb' || isMongoId;
        
        // 1. MongoDB (AWS) - intenta primero si es un ID de MongoDB o source=mongodb
        if (useMongoDbFirst) {
          try {
            // URL directa a ElasticBeanstalk para blogs de MongoDB
            console.log(`Consultando MongoDB con ID: ${id}`);
            
            // Utilizar el nuevo endpoint consolidado
            const proxyUrl = `/api/proxy/blog-by-id?id=${id}`;
            
            try {
              console.log(`Intentando nuevo endpoint: ${proxyUrl}`);
              const response = await fetch(proxyUrl, {
                headers: {
                  'Accept': 'application/json',
                  'Cache-Control': 'no-cache, no-store',
                  'Pragma': 'no-cache'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Blog encontrado a través del proxy:', data?.title || 'Sin título');
                setBlog(data);
                setLoading(false);
                return; // Terminar si encontramos el blog
              } else {
                console.log(`Respuesta no OK desde ${proxyUrl}: ${response.status}`);
              }
            } catch (proxyError) {
              console.error(`Error con el endpoint proxy: ${proxyError.message}`);
              
              // Si falla el nuevo endpoint, intentar con los métodos anteriores
              // Prueba con múltiples URLs para mayor robustez
              const mongoUrls = [
                `${MONGODB_BLOGS_API}/${id}`,                                    // URL principal directa
                `/api/proxy/mongodb/blogs/${id}`,                                // Proxy local si existe
                `https://www.realestategozamadrid.com/api/blogs/${id}`,          // API desde la URL principal
                `https://www.realestategozamadrid.com/api/blogs/detail/${id}`    // URL alternativa
              ];
              
              // Intenta cada URL hasta encontrar una que funcione
              for (const url of mongoUrls) {
                try {
                  console.log(`Intentando URL: ${url}`);
                  const response = await fetch(url);
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('MongoDB blog encontrado:', data?.title || 'Sin título');
                    setBlog(data);
                    setLoading(false);
                    return; // Terminar si encontramos el blog
                  } else {
                    console.log(`Respuesta no OK desde ${url}: ${response.status}`);
                  }
                } catch (urlError) {
                  console.error(`Error con URL ${url}:`, urlError);
                  // Continuar con la siguiente URL
                }
              }
            }
            
            console.log('No se encontró el blog en MongoDB tras intentar múltiples URLs');
          } catch (mongoError) {
            console.error('Error general al intentar con MongoDB:', mongoError);
          }
        }
        
        // 2. WordPress - intenta primero si es un slug o source=wordpress
        if (!useMongoDbFirst || !blog) {
          try {
            console.log(`Consultando WordPress con slug: ${id}`);
            
            try {
              // Usar la utilidad wp-api que usa nuestro proxy
              const wpPosts = await getPostBySlug(id);
              
              if (wpPosts && wpPosts.length > 0) {
                const wpPost = wpPosts[0];
                console.log('WordPress post encontrado:', wpPost.id);
                
                // Transformación segura del post
                const transformedPost = {
                  title: wpPost.title?.rendered || 'Sin título',
                  content: wpPost.content?.rendered || '<p>Sin contenido</p>',
                  date: wpPost.date || new Date().toISOString(),
                  author: wpPost._embedded?.author?.[0]?.name || 'Equipo Goza Madrid',
                  excerpt: wpPost.excerpt?.rendered || '',
                  source: 'wordpress'
                };
                
                setBlog(transformedPost);
                setLoading(false);
                return; // Terminar aquí si encontramos el blog
              } else {
                console.log('No se encontraron posts en WordPress');
              }
            } catch (wpError) {
              console.error('Error al consultar WordPress vía proxy:', wpError);
              
              // Como fallback, probar con una ruta alternativa
              try {
                const wpProxyUrl = `/api/proxy-raw`;
                console.log(`Intentando fallback vía proxy-raw: ${wpProxyUrl}`);
                
                const response = await fetch(wpProxyUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    url: `${WORDPRESS_API}?slug=${encodeURIComponent(id)}&_embed=true`,
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                    }
                  })
                });
                
                if (response.ok) {
                  const wpPosts = await response.json();
                  
                  if (wpPosts && Array.isArray(wpPosts) && wpPosts.length > 0) {
                    const wpPost = wpPosts[0];
                    console.log('WordPress post encontrado vía proxy-raw:', wpPost.id);
                    
                    // Transformación segura del post
                    const transformedPost = {
                      title: wpPost.title?.rendered || 'Sin título',
                      content: wpPost.content?.rendered || '<p>Sin contenido</p>',
                      date: wpPost.date || new Date().toISOString(),
                      author: wpPost._embedded?.author?.[0]?.name || 'Equipo Goza Madrid',
                      excerpt: wpPost.excerpt?.rendered || '',
                      source: 'wordpress'
                    };
                    
                    setBlog(transformedPost);
                    setLoading(false);
                    return; // Terminar aquí si encontramos el blog
                  }
                }
              } catch (fallbackError) {
                console.error('Error en fallback de WordPress:', fallbackError);
              }
            }
          } catch (generalWpError) {
            console.error('Error general al cargar blog de WordPress:', generalWpError);
          }
        }
        
        // 3. Si es ID de MongoDB y no intentamos antes, intentar con MongoDB
        if (!useMongoDbFirst && isMongoId) {
          try {
            // Intento tardío con MongoDB
            const mongoResponse = await fetch(`${MONGODB_BLOGS_API}/${id}`);
            
            if (mongoResponse.ok) {
              const mongoData = await mongoResponse.json();
              console.log('MongoDB blog encontrado (intento tardío):', mongoData?.title || 'Sin título');
              setBlog(mongoData);
              setLoading(false);
              return; // Terminar si encontramos el blog
            }
          } catch (lateMongoError) {
            console.error('Error en intento tardío con MongoDB:', lateMongoError);
          }
        }
        
        // Si llegamos aquí, no se encontró en ninguna fuente
        console.error('Blog no encontrado en ninguna fuente');
        setError('Blog no encontrado');
        setBlog({
          title: 'Blog no encontrado',
          content: '<p>Lo sentimos, no pudimos encontrar este blog. Por favor, verifica la URL o regresa a la lista de blogs.</p>',
          date: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error general al cargar el blog:', error);
        setError('Error al cargar el blog');
        setBlog({
          title: 'Error al cargar el blog',
          content: '<p>Se produjo un error al cargar el contenido del blog. Por favor, inténtalo más tarde.</p>',
          date: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id, source]); // Ejecutar cuando id o source cambien

  // Renderizar el título y contenido de manera segura
  const safeRenderValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.rendered) return value.rendered;
    return String(value);
  };

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="container mx-auto p-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold">Cargando blog...</h2>
          <p className="text-gray-600 mt-2">Por favor espere mientras obtenemos el contenido</p>
        </div>
      </div>
    );
  }

  // Si no hay blog después de cargar, mostrar error
  if (!blog) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg mb-2">Error al cargar el blog</h2>
          <p className="text-sm">{error || "No se pudo cargar el blog solicitado"}</p>
          <button 
            onClick={() => router.push('/blog')} 
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Volver al blog
          </button>
        </div>
      </div>
    );
  }

  // Renderizado seguro del blog
  const title = safeRenderValue(blog.title);
  const content = safeRenderValue(blog.content);
  const excerpt = safeRenderValue(blog.excerpt || blog.description || '');
  
  // Manejo seguro de la fecha
  let date = 'Fecha no disponible';
  try {
    if (blog.date) {
      date = new Date(blog.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) {
    // Mantener el valor por defecto
  }

  return (
    <div>
      <Head>
        <title>{title || 'Blog - Real Estate Goza Madrid'}</title>
        <meta name="description" content={excerpt || 'Artículo del blog de Real Estate Goza Madrid'} />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.707 4.293a1 1 0 010 1.414L7.414 9H15a1 1 0 110 2H7.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Volver al blog
          </button>
        </div>
        
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-4">{date}</span>
              {blog.author && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {typeof blog.author === 'string' ? blog.author : 'Equipo Goza Madrid'}
                </span>
              )}
            </div>
            
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;

