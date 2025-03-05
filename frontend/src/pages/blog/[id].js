import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { getBlogById } from '@/pages/api'; // API local
import { getBlogPostBySlug } from '@/services/wpApi'; // API WordPress
import { useRouter } from 'next/router';

import DirectImage from '@/components/DirectImage';
import Error from 'next/error';

// Usar una imagen local en lugar de placeholder.com
const DEFAULT_IMAGE = '/img/default-image.jpg';

// Importa las diferentes plantillas
import EstiloABlogContent from '@/components/blog/ABlogContent';
import DefaultBlogContent from '@/components/blog/blogcontent';


const BlogDetail = ({ initialBlog, id, isWordPress }) => {
  const router = useRouter();
  
  // Mover la función aquí, antes de usarla
  const processDataBeforeRender = (data) => {
    if (!data) return null;
    
    // Copia superficial para no modificar la fuente original
    const processed = {...data};
    
    // Procesar campos que podrían ser objetos
    if (processed.title && typeof processed.title === 'object') {
      processed.title = processed.title.rendered || JSON.stringify(processed.title);
    }
    
    if (processed.content && typeof processed.content === 'object') {
      processed.content = processed.content.rendered || JSON.stringify(processed.content);
    }
    
    if (processed.excerpt && typeof processed.excerpt === 'object') {
      processed.excerpt = processed.excerpt.rendered || JSON.stringify(processed.excerpt);
    }
    
    // Asegurarse de que otros campos críticos sean cadenas
    processed.date = typeof processed.date === 'object' ? JSON.stringify(processed.date) : processed.date;
    processed.author = typeof processed.author === 'object' ? JSON.stringify(processed.author) : processed.author;
    
    return processed;
  };
  
  // Ahora podemos usar la función
  const [blog, setBlog] = useState(processDataBeforeRender(initialBlog));
  const [loading, setLoading] = useState(!initialBlog);
  const [source, setSource] = useState(isWordPress ? 'wordpress' : 'local');
  const [error, setError] = useState(null);

  // Si no tenemos blog inicial, intentamos cargarlo en el cliente
  useEffect(() => {
    const fetchBlogData = async () => {
      if (blog) return; // Si ya tenemos datos, no hacemos nada
      
      setLoading(true);
      try {
        // Determinar si es un blog de WordPress o local
        let isWP = id.startsWith('wp-') || id.startsWith('wp/') || isNaN(id);
        let blogData;
        
        console.log("Intentando cargar blog con ID:", id, "Tipo:", isWP ? "WordPress" : "Local");
        
        if (isWP) {
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
            blogData = transformWordPressPost(wpPost, slug);
            setSource('wordpress');
          } else {
            console.error("No se encontró el blog en WordPress");
          }
        } else {
          // Es un ID numérico, obtener del API local
          console.log("Obteniendo blog local con ID:", id);
          blogData = await getBlogById(id);
          
          // Asegémonos de que los datos locales también se manejen correctamente
          if (blogData.title && typeof blogData.title === 'object') {
            blogData.title = JSON.stringify(blogData.title);
          }
          if (blogData.content && typeof blogData.content === 'object') {
            blogData.content = JSON.stringify(blogData.content);
          }
        }
        
        if (blogData) {
          // Procesar todos los campos para asegurar que son seguros para renderizar
          Object.keys(blogData).forEach(key => {
            if (typeof blogData[key] === 'object' && blogData[key] !== null) {
              if (key === 'content' || key === 'excerpt' || key === 'title') {
                if (blogData[key].rendered) {
                  blogData[key] = blogData[key].rendered;
                } else {
                  blogData[key] = JSON.stringify(blogData[key]);
                }
              }
            }
          });
          
          console.log("Blog procesado correctamente:", 
            typeof blogData.title === 'string' ? blogData.title : 'Título procesado');
          setBlog(blogData);
        } else {
          throw new Error('No se encontró el blog solicitado');
        }
      } catch (error) {
        console.error("Error cargando blog:", error);
        setError(error.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    if (!blog && id) {
      fetchBlogData();
    }
  }, [blog, id, isWordPress]);

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

  // Determinar qué componente usar para mostrar el contenido
  const BlogContentComponent = blog.template === 'A' ? EstiloABlogContent : DefaultBlogContent;
  
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
              <title>{blog.title || 'Blog Post'} | Goza Madrid</title>
              <meta 
                name="description" 
                content={typeof blog.content === 'string' 
                  ? blog.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
                  : 'Artículo del blog de Goza Madrid'} 
              />
            </Head>
            <BlogContentComponent 
              slug={blog.slug} 
              key={blog.slug}
            />
            <script dangerouslySetInnerHTML={{
              __html: `console.log("Renderizando BlogContent con slug: ${blog.slug}");`
            }} />
          </>
        ) : (
          <>
            <Head>
              <title>{blog.title || 'Blog Post'} | Goza Madrid</title>
              <meta 
                name="description" 
                content={typeof blog.content === 'string' 
                  ? blog.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
                  : 'Artículo del blog de Goza Madrid'} 
              />
            </Head>
            {/* Contenido normal para blogs no WordPress */}
            <div className="pt-20 pb-12 bg-gray-50">
              <article className="container mx-auto p-4 max-w-4xl">
                <header className="mb-8">
                  <h1 className="text-3xl font-bold mb-4">
                    {safeRenderValue(blog.title)}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-6">
                    <time dateTime={typeof blog.date === 'object' ? JSON.stringify(blog.date) : blog.date}>
                      {safeRenderValue(blog.date)}
                    </time>
                    {blog.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{safeRenderValue(blog.author)}</span>
                      </>
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
                
                {/* Contenido del blog */}
                <div className="prose prose-lg max-w-none">
                  {typeof blog.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                  ) : (
                    <p>{safeRenderValue(blog.content)}</p>
                  )}
                </div>
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
  if (!wpPost) return null;
  
  // Verificar que el slug está definido
  const slug = cleanSlug || wpPost.slug;
  if (!slug) {
    console.error("WordPress post no tiene slug:", wpPost.id);
  }
  
  // Función para obtener la URL de imagen con proxy
  const getImageUrl = (post) => {
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
           '/placeholder.jpg';
  };
  
  // Transformar a formato común
  return {
    _id: `wp-${wpPost.id}`,
    id: wpPost.id,
    title: wpPost.title && wpPost.title.rendered ? wpPost.title.rendered : String(wpPost.title || ''),
    content: wpPost.content && wpPost.content.rendered ? wpPost.content.rendered : String(wpPost.content || ''),
    excerpt: wpPost.excerpt && wpPost.excerpt.rendered ? wpPost.excerpt.rendered : String(wpPost.excerpt || ''),
    date: new Date(wpPost.date).toLocaleDateString('es-ES', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }),
    imageUrl: getImageUrl(wpPost),
    image: {
      src: getImageUrl(wpPost),
      alt: wpPost.title && wpPost.title.rendered ? wpPost.title.rendered : ''
    },
    author: wpPost._embedded?.author?.[0]?.name || 'Goza Madrid',
    categories: wpPost._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || [],
    tags: wpPost._embedded?.['wp:term']?.[1]?.map(tag => tag.name) || [],
    source: 'wordpress',
    slug: slug
  };
}

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

// SSR para manejar tanto IDs numéricos como slugs de WordPress
export async function getServerSideProps(context) {
  const { id } = context.params;
  const { source } = context.query;
  
  console.log("SSR Blog: Recibidos parámetros:", { id, source });
  
  const isWordPress = identifyBlogType(id, source);
  console.log("SSR Blog: Tipo determinado:", isWordPress ? "WordPress" : "Local");
  
  try {
    let blog = null;
    
    if (isWordPress) {
      // Extraer el slug real
      let slug = id;
      if (id.startsWith('wp-')) slug = id.substring(3);
      
      console.log("SSR: Obteniendo blog de WordPress con slug:", slug);
      
      // Obtener datos de WordPress
      const wpPost = await getBlogPostBySlug(slug);
      if (wpPost) {
        // Transformar a formato común
        blog = transformWordPressPost(wpPost, slug);
        console.log("SSR: Blog de WordPress encontrado:", wpPost.id);
      } else {
        console.log("SSR: No se encontró blog de WordPress con slug:", slug);
      }
    } else {
      // Es un ID local
      console.log("SSR: Obteniendo blog local con ID:", id);
      blog = await getBlogById(id);
      if (blog) {
        console.log("SSR: Blog local encontrado:", blog._id || blog.id);
      } else {
        console.log("SSR: No se encontró blog local con ID:", id);
      }
    }
    
    return { 
      props: { 
        initialBlog: blog, 
        id, 
        isWordPress 
      } 
    };
  } catch (error) {
    console.error("Error fetching blog content:", error);
    return { 
      props: { 
        initialBlog: null, 
        id, 
        isWordPress, 
        error: error.message 
      } 
    };
  }
}

export default BlogDetail;
