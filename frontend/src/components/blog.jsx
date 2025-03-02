"use client";
import { useState, useEffect } from "react";
import { Button } from "@relume_io/relume-ui";
import { RxChevronRight } from "react-icons/rx";
import Image from 'next/image';

import Link from "next/link";
import AnimatedOnScroll from "./AnimatedScroll";
import { getBlogPostsFromServer } from "@/services/wpApi";
import { getBlogPosts } from "@/pages/api";
import DirectImage from './DirectImage';
import LoadingScreen from './LoadingScreen';

// Añadir la función safeRenderValue
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

// Usar una imagen local en lugar de placeholder.com
const DEFAULT_IMAGE = '/img/default-image.jpg';

// Añadir esta función auxiliar para manejar de manera segura el HTML
const stripHtml = (htmlString) => {
  if (!htmlString) return '';
  try {
    return htmlString.replace(/<[^>]*>?/gm, '');
  } catch (error) {
    console.error('Error al eliminar HTML:', error);
    return String(htmlString);
  }
};

// Función auxiliar para truncar textos de manera segura
const truncateText = (text, length = 150) => {
  if (!text) return 'Sin descripción disponible';
  
  // Si ya es un string, simplemente truncarlo
  const cleanText = typeof text === 'string' ? stripHtml(text) : String(text);
  
  if (cleanText.length <= length) return cleanText;
  
  // Truncar y añadir puntos suspensivos
  return cleanText.substring(0, length).trim() + '...';
};

// Modificar la función getImageUrl para que maneje correctamente las imágenes de WordPress
const getImageUrl = (post) => {
  // Intentar diferentes formas en que WordPress puede proporcionar imágenes
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  
  if (post.featured_media_url) {
    return post.featured_media_url;
  }
  
  if (post.better_featured_image?.source_url) {
    return post.better_featured_image.source_url;
  }
  
  // Si no hay imagen, devolver la imagen predeterminada
  return DEFAULT_IMAGE;
};

// Componente BlogHome
const BlogHome = (props) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tagline, heading, description, button } = {
    ...Blog44Defaults,
    ...props,
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      
      try {
        // Crear un mapa para rastrear blogs únicos por ID/slug
        const uniqueBlogs = new Map();
        
        // Primero, obtener blogs de WordPress (prioridad alta)
        try {
          // Nótese que getBlogPostsFromServer devuelve { posts, totalPages }
          const { posts } = await getBlogPostsFromServer(1, 3);
          
          if (posts && posts.length > 0) {
            // Transformar formato WordPress al formato que espera tu componente
            const wpBlogs = posts.map(post => {
              // Obtener contenido para la descripción (probar varias fuentes)
              let description = '';
              
              // Intentar diferentes campos para obtener una descripción
              if (post.excerpt?.rendered) {
                description = stripHtml(post.excerpt.rendered);
              } else if (post.content?.rendered) {
                description = stripHtml(post.content.rendered);
              } else if (post.excerpt) {
                description = typeof post.excerpt === 'string' ? post.excerpt : '';
              } else if (post.content) {
                description = typeof post.content === 'string' ? post.content : '';
              }
              
              // Si aún no tenemos descripción, usar un valor predeterminado
              if (!description || description.trim() === '') {
                description = 'Visita nuestro blog para leer este artículo completo.';
              }
              
              // Truncar la descripción
              const truncatedDescription = truncateText(description, 150);
              
              // Obtener URL de imagen segura
              const imageUrl = post.image?.src || getImageUrl(post);
              
              // Crear objeto de blog formateado
              const blog = {
                _id: `wp-${post.id}`,
                id: post.id,
                title: safeRenderValue(post.title),
                description: truncatedDescription,
                content: truncatedDescription,
                date: new Date(post.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                image: {
                  src: imageUrl,
                  alt: safeRenderValue(post.title)
                },
                slug: post.slug,
                source: 'wordpress'
              };
              
              console.log('Blog WordPress procesado:', {
                id: blog.id,
                title: blog.title,
                description: blog.description,
                imageUrl: blog.image.src
              });
              
              // Guardar en el mapa usando slug como clave única
              uniqueBlogs.set(post.slug, blog);
              return blog;
            });
          }
        } catch (wpError) {
          console.error("Error al cargar blogs de WordPress:", wpError);
        }
        
        // Solo si no tenemos suficientes blogs de WordPress, obtener blogs locales
        if (uniqueBlogs.size < 3) {
          try {
            const localBlogs = await getBlogPosts();
            if (Array.isArray(localBlogs) && localBlogs.length > 0) {
              // Solo agregar blogs locales hasta completar 3 en total
              const remainingSlots = 3 - uniqueBlogs.size;
              
              for (let i = 0; i < Math.min(remainingSlots, localBlogs.length); i++) {
                const blog = localBlogs[i];
                // Usar _id como clave única para blogs locales
                const key = blog._id || blog.id;
                if (key && !uniqueBlogs.has(key)) {
                  // Asegurarnos de que la descripción también esté truncada
                  const truncatedDescription = truncateText(blog.description || blog.content, 150);
                  
                  uniqueBlogs.set(key, {
                    ...blog,
                    content: truncatedDescription,
                    description: truncatedDescription,
                    source: 'local' // Marcar como blog local
                  });
                }
              }
            }
          } catch (localError) {
            console.error("Error al cargar blogs locales:", localError);
          }
        }
        
        // Convertir el mapa de vuelta a un array y limitar a 3 blogs
        const combinedBlogs = Array.from(uniqueBlogs.values());
        
        // Ordenar por fecha
        combinedBlogs.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA; // Orden descendente (más reciente primero)
        });
        
        // Establecer al máximo 3 blogs
        setBlogs(combinedBlogs.slice(0, 3));
        
      } catch (error) {
        console.error("Error al cargar blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Precargamos las imágenes para mejorar la experiencia
    const preloadImages = () => {
      if (!blogs || blogs.length === 0) return;
      
      blogs.forEach(blog => {
        const imageUrl = typeof blog.image === 'string' ? blog.image : blog.image?.src;
        if (imageUrl) {
          const img = new window.Image();
          img.src = imageUrl;
          img.onload = () => {
            const blogId = blog.id || blog._id;
            const placeholder = document.querySelector(`.animate-pulse[data-blog-id="${blogId}"]`);
            if (placeholder) placeholder.classList.add('hidden');
          };
        }
      });
    };
    
    if (blogs.length > 0 && !loading) {
      preloadImages();
    }
  }, [blogs, loading]);

  // Reemplazar la lógica de imagen de fallback con un componente
  const PlaceholderImage = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
      <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-gray-500 text-sm">Imagen no disponible</span>
    </div>
  );

  const isDebug = typeof window !== 'undefined' && 
    (window.location.search.includes('debug=true') || 
     localStorage.getItem('debugImages') === 'true');

  if (isDebug) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Modo Debug: Imágenes de Blog</h1>
        <button 
          onClick={() => localStorage.setItem('debugImages', 'false')}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        >
          Salir del modo debug
        </button>
        
        <div className="grid grid-cols-1 gap-4">
          {blogs.map(blog => {
            const imageUrl = typeof blog.image === 'string' ? blog.image : (blog.image?.src || null);
            return (
              <div key={blog.id || blog._id} className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">{typeof blog.title === 'object' ? blog.title.rendered : blog.title}</h2>
                <p className="text-sm text-gray-500">ID: {blog.id || blog._id}</p>
                <p className="text-sm text-gray-500">Fuente: {blog.source || 'desconocida'}</p>
                <p className="text-sm text-gray-500">URL de imagen: {imageUrl || 'No disponible'}</p>
                
                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Test directa:</p>
                    <img 
                      src={imageUrl} 
                      alt="Test directo" 
                      className="h-20 object-cover mt-1 border" 
                      onLoad={() => console.log(`Imagen cargada directamente: ${imageUrl}`)}
                      onError={() => console.error(`Error cargando directamente: ${imageUrl}`)}
                    />
                    
                    {imageUrl.startsWith('/api/') && (
                      <>
                        <p className="text-sm font-medium mt-2">Test sin proxy:</p>
                        <img 
                          src={decodeURIComponent(imageUrl.split('url=')[1] || '')} 
                          alt="Test sin proxy" 
                          className="h-20 object-cover mt-1 border" 
                          onLoad={() => console.log(`Imagen cargada sin proxy: ${decodeURIComponent(imageUrl.split('url=')[1] || '')}`)}
                          onError={() => console.error(`Error cargando sin proxy: ${decodeURIComponent(imageUrl.split('url=')[1] || '')}`)}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Añadir un console.log para depurar las URLs
  console.log("URLs de imágenes:", blogs.map(blog => ({
    id: blog.id,
    url: typeof blog.image === 'string' ? blog.image : blog.image?.src
  })));

  return (
    <>
      {loading && <LoadingScreen />}
      
      <AnimatedOnScroll>
        <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
          <div className="container mx-auto">
            {/* Encabezado */}
            <div className="rb-12 mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
              <div className="w-full max-w-lg">
                <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
                <h1 className="mb-3 text-5xl font-bold md:mb-4 md:text-7xl lg:text-8xl">
                  {heading}
                </h1>
                <p className="md:text-md">{description}</p>
              </div>
              <div className="hidden flex-wrap items-center justify-end md:block">
               <Link
                href="/blog"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
                    px-4 sm:px-6 lg:px-8 
                    py-2 sm:py-2.5 lg:py-3 
                    transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
                    max-w-[90%] sm:max-w-[80%] lg:max-w-none"
              >
                  <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                      Ver todo
                  </span>
                  <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
              </Link>
              </div>
            </div>

            {/* Grilla de blogs */}
            {loading ? (
              <LoadingScreen fullScreen={false} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {blogs.length > 0 ? (
                  blogs.map((blog, index) => {
                    // Definir la URL correcta para cada tipo de blog
                    const blogUrl = blog.source === 'wordpress' 
                      ? `/blog/${blog.slug}?source=wordpress` 
                      : `/blog/${blog._id || blog.id}`;
                    
                    return (
                      <div key={blog.id || blog._id} className="group h-full">
                        <Link
                          href={blogUrl}
                          className="flex flex-col h-full bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md border border-gray-100"
                        >
                          {/* Contenedor de la imagen con overlay de gradiente */}
                          <div className="relative w-full overflow-hidden aspect-[16/9]">
                            <Image 
                              src={
                                (typeof blog.image === 'string' && blog.image) ? blog.image : 
                                (blog.image && blog.image.src) ? blog.image.src : DEFAULT_IMAGE
                              }
                              alt={typeof blog.title === 'object' ? blog.title.rendered : blog.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              unoptimized={!((typeof blog.image === 'string' ? blog.image : blog.image?.src) || '').includes('realestategozamadrid.com')}
                            />
                            
                            {/* Gradiente permanente para mejor legibilidad */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          
                            
                            {/* Fecha en overlay */}
                            {blog.date && (
                              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                {blog.date}
                              </div>
                            )}
                          </div>
                          
                          {/* Contenido de la tarjeta */}
                          <div className="flex flex-1 flex-col p-5 md:p-6">
                            {/* Categoría si existe */}
                            {blog.category && (
                              <span className="inline-block bg-amarillo/20 text-amarillo px-2.5 py-0.5 rounded-full text-xs font-medium mb-3">
                                {blog.category}
                              </span>
                            )}
                            
                            {/* Título */}
                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amarillo transition-colors line-clamp-2">
                              {typeof blog.title === 'object' ? blog.title.rendered : blog.title}
                            </h2>
                            
                            {/* Resumen */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {typeof blog.content === 'object' && blog.content.rendered 
                                ? stripHtml(blog.content.rendered)
                                : blog.description || blog.content || 'Sin descripción disponible'}
                            </p>
                            
                            {/* Footer con botón de acción */}
                            <div className="mt-auto pt-4 flex items-center border-t border-gray-100">
                              <span className="flex items-center text-amarillo font-medium group-hover:text-amarillo transition-colors">
                                Leer más
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-gray-500">No hay publicaciones disponibles.</p>
                    <button className="mt-4 px-4 py-2 bg-amarillo text-white rounded-full hover:bg-amarillo/80 transition-colors">
                      Revisa más tarde
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Botón para ver todos (visible en móvil) */}
            
          </div>
        </section>
      </AnimatedOnScroll>
    </>
  );
};

// Valores predeterminados para el componente Blog44
const Blog44Defaults = {
  tagline: "Goza Madrid",
  heading: "Ver detalles inmobiliarios",
  description: "Blogs de Goza Madrid.",
  button: { title: "Ver todo", variant: "secondary" },
  blogPosts: [
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 1",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 2",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 3",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
  ],
};

export default BlogHome;
