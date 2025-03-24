import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { getBlogById } from '@/services/api'; // API local
import { getBlogPostBySlug } from '@/services/wpApi'; // API WordPress
import { useRouter } from 'next/router';
import LoadingScreen from '@/components/LoadingScreen';

import DirectImage from '@/components/DirectImage';
import Error from 'next/error';

// Usar una imagen local en lugar de placeholder.com
const DEFAULT_IMAGE = '/img/default-image.jpg';

// Importa las diferentes plantillas

import DefaultBlogContent from '@/components/blog/blogcontent';

// Importar el nuevo componente

// Volver a importar el componente MongoDBBlogContent
// import MongoDBBlogContent from '@/components/blog/MongoDBBlogContent';

const BlogDetail = ({ initialBlog, id, isWordPress }) => {
  const router = useRouter();
  
  // Mover la función aquí, antes de usarla
  const processDataBeforeRender = (data) => {
    if (!data) return null;
    
    // Mostrar datos antes de procesar
    console.log("ANTES DE PROCESAR:", {
      hasContent: !!data.content,
      contentType: typeof data.content,
      contentSample: data.content ? data.content.substring(0, 50) : null
    });
    
    // Copia superficial para no modificar la fuente original
    const processed = {...data};
    
    // Asegurarse de mantener content intacto
    if (processed.content === undefined) {
      console.log("ALERTA: content es undefined, creando contenido basado en description");
      processed.content = `<p>${processed.description || ""}</p><p><em>Contenido en desarrollo.</em></p>`;
    }
    
    // Mostrar datos después de procesar
    console.log("DESPUÉS DE PROCESAR:", {
      hasContent: !!processed.content,
      contentType: typeof processed.content,
      contentSample: processed.content ? processed.content.substring(0, 50) : null
    });
    
    return processed;
  };
  
  // Ahora podemos usar la función
  const [blog, setBlog] = useState(processDataBeforeRender(initialBlog));
  const [loading, setLoading] = useState(!initialBlog);
  const [source, setSource] = useState(isWordPress ? 'wordpress' : 'local');
  const [error, setError] = useState(null);
  const isProduction = process.env.NODE_ENV === 'production';

  // Si no tenemos blog inicial, intentamos cargarlo en el cliente
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) return;
      if (blog) return; // Si ya tenemos datos, no hacemos nada
      
      try {
        setLoading(true);
        
        // Determinar si es un ID de MongoDB (como en property/[id].js)
        const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
        
        console.log("Tipo de ID detectado:", isMongoId ? "MongoDB" : "WordPress/Otro");
        
        if (isMongoId) {
          // MongoDB - obtener directamente el blog por ID
          console.log("Obteniendo blog de MongoDB con ID:", id);
          
          // Usar la URL completa para asegurarnos de que es correcta
          const apiUrl = process.env.NEXT_LOCAL_API_URL || 'http://localhost:3000';
          console.log('URL completa:', `${apiUrl}/blog/${id}`);
          
          const response = await fetch(`${apiUrl}/blog/${id}`);
          
          if (!response.ok) {
            throw new Error(`Error al obtener blog: ${response.status}`);
          }
          
          // Muestra los datos exactos recibidos sin procesar
          const rawData = await response.json();
          console.log("Datos RAW recibidos de MongoDB:", rawData);
          
          // Aplicar el estilo de revista moderna solo a blogs de MongoDB
          if (!rawData.content || rawData.content === 'undefined' || rawData.content.trim() === '') {
            console.log("APLICANDO DISEÑO DE REVISTA: Creando contenido estilizado");
            
            // Usar la fecha formateada si está disponible
            const formattedDate = rawData.createdAt ? new Date(rawData.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Fecha no disponible';
            
            // Crear un HTML completo con nuestras clases personalizadas
            rawData.content = `
              <article class="magazine-layout">
                <div class="magazine-header">
                  <div class="magazine-category">${rawData.category || "General"}</div>
                  <div class="magazine-readtime">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${rawData.readTime || "5 minutos de lectura"}
                  </div>
                </div>
                
                <div class="magazine-intro">
                  <p class="magazine-intro-text">${rawData.description || ""}</p>
                </div>
                
                <div class="magazine-grid">
                  <div class="magazine-main">
                    <h2 class="magazine-section-title">Aspectos Destacados</h2>
                    <div>
                      <p class="mb-5">Madrid es una ciudad llena de historia, cultura y gastronomía. En Goza Madrid queremos ayudarte a descubrir los mejores lugares y experiencias que ofrece la capital española.</p>
                      
                      <div class="magazine-highlight">
                        <h3>¿Sabías que?</h3>
                        <p>Madrid es una de las capitales europeas con más zonas verdes, con parques emblemáticos como El Retiro o Casa de Campo.</p>
                      </div>
                      
                      <p>Este artículo está en desarrollo y pronto encontrarás mucho más contenido relacionado con ${rawData.title || "este tema"}.</p>
                    </div>
                  </div>
                  
                  <div class="magazine-sidebar">
                    <div class="magazine-sidebar-block">
                      <h3 class="block-title">Información Útil</h3>
                      <div class="mb-3">
                        <span class="font-semibold">Autor:</span>
                        <span>${rawData.author || "Equipo Goza Madrid"}</span>
                      </div>
                      <div class="mb-3">
                        <span class="font-semibold">Categoría:</span>
                        <span>${rawData.category || "General"}</span>
                      </div>
                      <div class="mb-3">
                        <span class="font-semibold">Publicado:</span>
                        <span>${formattedDate}</span>
                      </div>
                    </div>
                    
                    <div class="magazine-quote">
                      <blockquote>"Madrid es una ciudad que nunca duerme, llena de posibilidades para todos los gustos"</blockquote>
                    </div>
                  </div>
                </div>
                
                <div class="magazine-banner">
                  <p>Este artículo está en constante actualización. Visítanos pronto para descubrir nuevo contenido.</p>
                  <a href="/blog" class="magazine-banner-link">Explorar más artículos</a>
                </div>
                
                <div class="magazine-topics">
                  <h3>Temas relacionados</h3>
                  <div>
                    <span class="magazine-topic">Madrid</span>
                    <span class="magazine-topic">Turismo</span>
                    <span class="magazine-topic">Cultura</span>
                    <span class="magazine-topic">Ocio</span>
                  </div>
                </div>
              </article>
            `;
          } else if (rawData.content && typeof rawData.content === 'string') {
            const existingContent = rawData.content;
            
            // Asegurarnos de que el contenido esté dentro de un div con ID único
            rawData.content = `<div id="mongodb-blog-${id}" class="mongodb-blog-content">${existingContent}</div>`;
          }
          
          // No aplicar ninguna transformación, usar los datos tal como vienen
          setSource('local');
          setBlog(rawData);
        } else {
          // WordPress u otro - mantén tu lógica actual para WordPress
          // Extraer el slug real
          let slug = id;
          if (id.startsWith('wp-')) slug = id.substring(3);
          if (id.startsWith('wp/')) slug = id.substring(3);
          
          console.log("Obteniendo blog de WordPress con slug:", slug);
          
          // Obtener datos de WordPress
          const wpPost = await getBlogPostBySlug(slug);
          if (wpPost) {
            console.log("Blog de WordPress obtenido correctamente");
            // Transformar a formato común - asegurémonos de que esto funciona correctamente
            const blogData = transformWordPressPost(wpPost, slug);
            setSource('wordpress');
          } else {
            console.error("No se encontró el blog en WordPress");
          }
        }
      } catch (err) {
        console.error("Error cargando blog:", err);
        setError(err.message);
      } finally {
        // En producción, mantenemos el loading un poco más para asegurar que todo se cargue
        if (isProduction) {
          setTimeout(() => setLoading(false), 1000);
        } else {
          setLoading(false);
        }
      }
    };
    
    fetchBlogData();
  }, [id, blog, isProduction]);

  // Función para transformar datos de WordPress al formato común
  const processContent = (content) => {
    if (!content) return '';
    
    // 1. Procesar las imágenes para usar el proxy
    let processedContent = content.replace(
      /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
      (match, before, src, after) => {
        // Verificar si la URL es externa
        if (src.startsWith('http')) {
          return `<img${before}src="/api?url=${encodeURIComponent(src)}"${after}>`;
        }
        return match; // Mantener las URLs locales sin cambios
      }
    );
    
    return processedContent;
  };

  // Si hay error
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si no hay blog
  if (!blog) {
    return (
      <div className="container mx-auto p-8">
        <Error statusCode={404} title="Blog no encontrado" />
      </div>
    );
  }

  // Procesar el contenido si es de WordPress
  if (source === 'wordpress' && blog.content) {
    blog.content = processContent(blog.content);
  }

  // Asegurarse de que cualquier valor sea seguro para renderizar
  const safeRenderValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      // Caso especial para objetos de WordPress
      if (value.rendered) return value.rendered;
      // Para otros objetos, convertirlos a JSON
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Si es un blog de MongoDB, asegurarse de que todos los campos estén presentes
  if (!isWordPress && blog) {
    console.log('Datos de MongoDB antes de pasar al componente:', blog);
    
    // Asegurarse de que readTime esté presente
    if (!blog.readTime) {
      console.log('ReadTime no está presente en los datos');
    }
    
    // Asegurarse de que content esté presente
    if (!blog.content) {
      console.log('Content no está presente en los datos');
    }
  }

  // Añadir este useEffect para inyectar los estilos CSS
  useEffect(() => {
    // Solo si es un blog de MongoDB
    if (source === 'local' && blog) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Estilos para el contenido del blog de MongoDB */
        .mongodb-blog-content {
          font-family: 'Georgia', serif;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #333;
        }
        
        .mongodb-blog-content p {
          margin-bottom: 1.75rem !important;
          line-height: 1.8 !important;
          font-size: 1.1rem !important;
        }
        
        .mongodb-blog-content h2 {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 1.8rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
          margin-top: 2.5rem !important;
          margin-bottom: 1.25rem !important;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #F3F4F6;
        }
        
        .mongodb-blog-content h3 {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: #1F2937 !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
        }
        
        .mongodb-blog-content ul, .mongodb-blog-content ol {
          margin-bottom: 1.5rem;
          margin-left: 1.5rem;
        }
        
        .mongodb-blog-content li {
          margin-bottom: 0.5rem;
        }
        
        .mongodb-blog-content a {
          color: #2563EB;
          text-decoration: underline;
        }
        
        .mongodb-blog-content a:hover {
          color: #1D4ED8;
        }
        
        .mongodb-blog-content blockquote {
          border-left: 4px solid #FCD34D;
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
          color: #4B5563;
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => document.head.removeChild(styleElement);
    }
  }, [source, blog]);

  // Usar siempre el componente disponible
  const BlogContentComponent = DefaultBlogContent;

  if (loading && isProduction) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Fondo fijo común */}
      <div
        className="fixed inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/gozamadridwp.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Contenido existente */}
      <div className="relative z-10">
        {source === 'wordpress' ? (
          <>
            <Head>
              <title>{`${blog.title || 'Blog Post'} | Goza Madrid - Inmobiliaria en Madrid`}</title>
              <meta 
                name="description" 
                content={blog.excerpt?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                  blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                  'Descubre más sobre el mercado inmobiliario en Madrid con los artículos especializados de Goza Madrid.'} 
              />
              <meta name="author" content={blog.author || 'Goza Madrid'} />
              <meta name="robots" content="index, follow" />
              <link rel="canonical" href={`https://gozamadrid.com/blog/${blog.slug || id}`} />

              {/* Open Graph */}
              <meta property="og:type" content="article" />
              <meta property="og:title" content={blog.title || 'Blog Post'} />
              <meta property="og:description" content={blog.excerpt?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
              <meta property="og:image" content={blog.imageUrl || DEFAULT_IMAGE} />
              <meta property="og:url" content={`https://gozamadrid.com/blog/${blog.slug || id}`} />
              <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={blog.title || 'Blog Post'} />
              <meta name="twitter:description" content={blog.excerpt?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
              <meta name="twitter:image" content={blog.imageUrl || DEFAULT_IMAGE} />

              {/* Schema.org Article */}
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `https://gozamadrid.com/blog/${blog.slug || id}`
                  },
                  "headline": blog.title,
                  "image": [blog.imageUrl || DEFAULT_IMAGE],
                  "datePublished": blog.date,
                  "dateModified": blog.modified || blog.date,
                  "author": {
                    "@type": "Person",
                    "name": blog.author || "Goza Madrid"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "Goza Madrid Inmobiliaria",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://gozamadrid.com/logo.png"
                    }
                  },
                  "description": blog.excerpt?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                    blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, ''),
                  "keywords": [...(blog.categories || []), ...(blog.tags || [])].join(", ")
                })}
              </script>

              {/* Metadatos adicionales */}
              <meta name="keywords" content={[...(blog.categories || []), ...(blog.tags || [])].join(", ")} />
              <meta name="news_keywords" content={[...(blog.categories || []), ...(blog.tags || [])].join(", ")} />
              <meta name="article:published_time" content={blog.date} />
              <meta name="article:modified_time" content={blog.modified || blog.date} />
              <meta name="article:section" content={blog.categories?.[0] || 'Real Estate'} />
              {blog.tags?.map((tag, index) => (
                <meta key={index} name="article:tag" content={tag} />
              ))}
            </Head>
            <BlogContentComponent slug={blog.slug} key={blog.slug} />
          </>
        ) : (
          <>
            <Head>
              <title>{`${blog.title || 'Blog Post'} | Goza Madrid - Inmobiliaria en Madrid`}</title>
              <meta 
                name="description" 
                content={blog.description?.substring(0, 160) || 
                  blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 
                  'Descubre más sobre el mercado inmobiliario en Madrid con los artículos especializados de Goza Madrid.'} 
              />
              <meta name="author" content={blog.author || 'Goza Madrid'} />
              <meta name="robots" content="index, follow" />
              <link rel="canonical" href={`https://gozamadrid.com/blog/${blog._id}`} />

              {/* Open Graph */}
              <meta property="og:type" content="article" />
              <meta property="og:title" content={blog.title || 'Blog Post'} />
              <meta property="og:description" content={blog.description?.substring(0, 160) || 
                blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
              <meta property="og:image" content={blog.imageUrl || DEFAULT_IMAGE} />
              <meta property="og:url" content={`https://gozamadrid.com/blog/${blog._id}`} />
              <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={blog.title || 'Blog Post'} />
              <meta name="twitter:description" content={blog.description?.substring(0, 160) || 
                blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
              <meta name="twitter:image" content={blog.imageUrl || DEFAULT_IMAGE} />

              {/* Schema.org Article */}
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `https://gozamadrid.com/blog/${blog._id}`
                  },
                  "headline": blog.title,
                  "image": [blog.imageUrl || DEFAULT_IMAGE],
                  "datePublished": blog.createdAt || new Date().toISOString(),
                  "dateModified": blog.updatedAt || blog.createdAt || new Date().toISOString(),
                  "author": {
                    "@type": "Person",
                    "name": blog.author || "Goza Madrid"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "Goza Madrid Inmobiliaria",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://gozamadrid.com/logo.png"
                    }
                  },
                  "description": blog.description?.substring(0, 160) || 
                    blog.content?.substring(0, 160).replace(/<[^>]*>?/gm, ''),
                  "keywords": blog.category || "Real Estate, Madrid, Properties"
                })}
              </script>

              {/* Metadatos adicionales */}
              <meta name="keywords" content={`${blog.category || ''}, inmobiliaria madrid, propiedades madrid, real estate madrid`} />
              <meta name="article:published_time" content={blog.createdAt || new Date().toISOString()} />
              <meta name="article:modified_time" content={blog.updatedAt || blog.createdAt || new Date().toISOString()} />
              <meta name="article:section" content={blog.category || 'Real Estate'} />
            </Head>
            
            {/* Renderizado directo del contenido del blog de MongoDB */}
            <div className="pt-20 pb-12 bg-white">
              <article className="container mx-auto p-4 max-w-4xl">
                <header className="mb-8">
                  <h1 className="text-3xl font-bold mb-4">
                    {blog.title || 'Sin título'}
                  </h1>
                  <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-2">
                    {blog.date && (
                      <time className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {blog.date}
                      </time>
                    )}
                    {blog.author && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        Autor: {blog.author}
                      </span>
                    )}
                    {blog.readTime && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {blog.readTime}
                      </span>
                    )}
                    {blog.category && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
                        {blog.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Imagen destacada */}
                  <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                    <DirectImage
                      src={blog.imageUrl || blog.image?.src || DEFAULT_IMAGE}
                      alt={typeof blog.title === 'object' ? blog.title.rendered : blog.title}
                      className="object-cover w-full h-full"
                      fallbackSrc={DEFAULT_IMAGE}
                    />
                  </div>
                </header>
                
                {/* Contenido del blog con estilos profesionales */}
                <div 
                  className="prose prose-lg max-w-none mongodb-blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </article>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// Función auxiliar para transformar posts de WordPress
function transformWordPressPost(wpPost, cleanSlug) {
  // Verificar que el post existe y tiene las propiedades necesarias
  if (!wpPost) {
    console.error('Post de WordPress no válido');
    return {
      _id: cleanSlug,
      title: 'Post no disponible',
      content: '<p>Lo sentimos, este post no está disponible en este momento.</p>',
      description: 'Post no disponible',
      date: new Date().toISOString(),
      image: { src: '/img/default-blog-image.jpg', alt: 'Imagen por defecto' },
      source: 'wordpress',
      slug: cleanSlug
    };
  }

  try {
    const imageUrl = getImageUrl(wpPost);
    
    // Construir un objeto con formato consistente
    return {
      _id: cleanSlug,
      title: wpPost.title || 'Sin título',
      content: wpPost.content || '<p>Sin contenido</p>',
      description: wpPost.excerpt || wpPost.content?.substring(0, 150) || 'Sin descripción',
      date: wpPost.date || new Date().toISOString(),
      dateFormatted: wpPost.date ? new Date(wpPost.date).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
      image: {
        src: imageUrl || '/img/default-blog-image.jpg',
        alt: wpPost.title || 'Imagen de blog'
      },
      source: 'wordpress',
      slug: cleanSlug,
      author: wpPost.author_name || wpPost._embedded?.author?.[0]?.name || "Equipo Goza Madrid",
      categories: wpPost.categories || []
    };
  } catch (error) {
    console.error('Error transformando post de WordPress:', error);
    
    // Devolver un objeto mínimo en caso de error
    return {
      _id: cleanSlug,
      title: 'Error al cargar el post',
      content: '<p>Se produjo un error al cargar el contenido.</p>',
      description: 'Error al cargar el post',
      date: new Date().toISOString(),
      image: { src: '/img/default-blog-image.jpg', alt: 'Imagen por defecto' },
      source: 'wordpress',
      slug: cleanSlug
    };
  }
}

// Función auxiliar para obtener la URL de imagen con fallback
const getImageUrl = (post) => {
  // Manejo de error para post nulo o indefinido
  if (!post) return '/img/default-blog-image.jpg';

  try {
    // Intentar obtener la imagen de _embedded (disponible gracias a _embed)
    if (post._embedded && 
        post._embedded['wp:featuredmedia'] && 
        post._embedded['wp:featuredmedia'][0]) {
        
      const media = post._embedded['wp:featuredmedia'][0];
      
      // Intentar obtener un tamaño específico o usar source_url como respaldo
      if (media.media_details && media.media_details.sizes) {
        // Preferir tamaños medianos para mejor rendimiento
        const sizePriority = ['medium_large', 'medium', 'large', 'full'];
        
        for (const size of sizePriority) {
          if (media.media_details.sizes[size]) {
            return media.media_details.sizes[size].source_url;
          }
        }
      }
      
      // Si no se encontró un tamaño específico, usar source_url
      if (media.source_url) {
        return media.source_url;
      }
    }
    
    // Intentar métodos alternativos si no hay datos embebidos
    return post.uagb_featured_image_src?.medium?.[0] || 
           post.uagb_featured_image_src?.full?.[0] || 
           post.image?.src ||
           '/img/default-blog-image.jpg';
  } catch (error) {
    console.error('Error al obtener imagen del post:', error);
    return '/img/default-blog-image.jpg';
  }
};

// Función mejorada para determinar si estamos trabajando con un blog de WordPress
const identifyBlogType = (id, source) => {
  // Si viene explícitamente marcado como WordPress en la consulta
  if (source === 'wordpress') return true;
  
  // Si el ID tiene formato de slug WordPress (texto con guiones)
  if (isNaN(id) && !id.startsWith('wp-') && id.includes('-')) return true;
  
  // Si el ID empieza con prefijo wp-
  if (id.startsWith('wp-')) return true;
  
  // En otro caso, asumimos que es un blog local con ID
  return false;
};

// Añadir getStaticPaths para pre-renderizar rutas conocidas
export async function getStaticPaths() {
  try {
    // Obtener solo IDs de blogs principales para pre-renderizar
    const paths = [];
    
    // Indicar que no vamos a generar páginas estáticas para todos los blogs
    // Esto permitirá que el resto se genere bajo demanda
    return {
      paths,
      fallback: true // Cambiar de 'blocking' a true para indicar que cargaremos en el cliente
    };
  } catch (error) {
    console.error('Error en getStaticPaths:', error);
    return {
      paths: [],
      fallback: true
    };
  }
}

// Cambiar a getStaticProps para sitios estáticos
export async function getStaticProps(context) {
  const { id, source } = context.params;
  
  // Verificar y limpiar el ID
  if (!id) {
    console.error('ID no válido:', id);
    return {
      props: {
        initialBlog: {
          title: 'Blog no encontrado',
          content: '<p>Lo sentimos, no pudimos encontrar este blog.</p>',
        },
        id: 'not-found',
        isWordPress: false,
      },
      revalidate: 60 // Revalidar después de 60 segundos
    };
  }
  
  const cleanId = id.toString().trim();
  
  // Determinar si es un ID de MongoDB (24 caracteres hexadecimales)
  const isMongoId = cleanId && cleanId.length === 24 && /^[0-9a-fA-F]{24}$/.test(cleanId);
  
  console.log(`[DEBUG] Iniciando getBlogById para ID: ${cleanId}, isMongoId: ${isMongoId}`);
  
  try {
    // 1. Primero intentar obtener de WordPress si el parámetro source=wordpress o no es un ID de MongoDB
    const sourceParam = context.query?.source;
    const checkWordPressFirst = sourceParam === 'wordpress' || !isMongoId;
    
    if (checkWordPressFirst) {
      try {
        console.log('Intentando obtener el blog de WordPress primero');
        const wpPost = await getBlogPostBySlug(cleanId);
        
        if (wpPost) {
          const transformedPost = transformWordPressPost(wpPost, cleanId);
          return {
            props: {
              initialBlog: transformedPost,
              id: cleanId,
              isWordPress: true,
            },
            revalidate: 300 // Revalidar cada 5 minutos
          };
        }
      } catch (wpError) {
        console.error('Error obteniendo blog de WordPress:', wpError);
        // Continuar con el flujo para intentar MongoDB
      }
    }
    
    // 2. Luego intentar obtener de MongoDB si parece ser un ID de MongoDB o el enfoque de WordPress falló
    if (isMongoId) {
      // Configurar número de reintentos
      const maxRetries = 3;
      let currentTry = 1;
      let blog = null;
      
      while (currentTry <= maxRetries && !blog) {
        try {
          console.log(`[DEBUG] Intento MongoDB ${currentTry} de ${maxRetries}`);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          
          // Intentar obtener con timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
          
          const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/blog/${cleanId}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Si es un éxito, guardar el blog
          if (response.ok) {
            blog = await response.json();
            
            // Devolver el resultado
            return {
              props: {
                initialBlog: blog,
                id: cleanId,
                isWordPress: false,
              },
              revalidate: 300 // Revalidar cada 5 minutos
            };
          } else {
            throw new Error(`Error HTTP: ${response.status}`);
          }
        } catch (err) {
          console.error(`[DEBUG] Error en intento MongoDB ${currentTry}:`, err.message);
          currentTry++;
          
          if (currentTry <= maxRetries) {
            // Esperar antes de reintentar (tiempo exponencial)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentTry - 1)));
          }
        }
      }
    }
    
    // 3. Si no se encontró en ninguna fuente, devolver un objeto de blog "no encontrado"
    return {
      props: {
        initialBlog: {
          title: 'Blog no encontrado',
          content: '<p>Lo sentimos, no pudimos encontrar este blog.</p>',
          date: new Date().toISOString(),
          image: { src: '/img/default-blog-image.jpg', alt: 'Imagen por defecto' }
        },
        id: cleanId || 'error',
        isWordPress: false,
      },
      revalidate: 60 // Revalidar después de 60 segundos
    };
  } catch (error) {
    console.error('Error al obtener blog en getStaticProps:', error);
    
    // En caso de error, devolvemos datos mínimos 
    return {
      props: {
        initialBlog: {
          title: 'Error al cargar el blog',
          content: '<p>Se produjo un error al cargar el contenido del blog.</p>',
          date: new Date().toISOString(),
          image: { src: '/img/default-blog-image.jpg', alt: 'Imagen por defecto' }
        },
        id: cleanId || 'error',
        isWordPress: false,
      },
      revalidate: 30 // Revalidar más rápido en caso de error
    };
  }
}

export default BlogDetail;

