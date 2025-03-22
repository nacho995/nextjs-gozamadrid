"use client";
import { useState, useEffect } from "react";
// Importar Button de manera condicional para evitar errores en producción
let Button;
try {
  Button = require("@relume_io/relume-ui").Button;
} catch (error) {
  // Componente Button de respaldo si no se puede importar @relume_io/relume-ui
  Button = ({ children, className, ...props }) => (
    <button 
      className={`px-4 py-2 bg-amarillo text-white rounded-lg hover:bg-amarillo/80 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
import { RxChevronRight } from "react-icons/rx";
import Image from 'next/image';
import Link from "next/link";
import Head from 'next/head';
import AnimatedOnScroll from "./AnimatedScroll";
import { getBlogPostsFromServer } from "@/services/wpApi";
import { getBlogPosts } from '@/services/api';
import DirectImage from './DirectImage';
import LoadingScreen from './LoadingScreen';
import BlogImage from './blog/BlogImage';

// Utilidades de renderizado seguro
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    if (value.rendered) return value.rendered;
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
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  } catch (error) {
    console.error('Error al procesar HTML:', error);
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

// Añadir esta función para procesar URLs de imágenes, similar a la de blogPage.jsx
const processImageUrl = (image) => {
  if (!image) return { src: DEFAULT_IMAGE, alt: 'Imagen del blog' };

  // Si es un string
  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('https')) {
      return { src: image, alt: 'Imagen del blog' };
    }
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://goza-madrid.onrender.com'
      : 'http://localhost:3000';
    return { 
      src: `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`,
      alt: 'Imagen del blog'
    };
  }

  // Si es un objeto con src
  if (image && image.src) {
    if (image.src.startsWith('http') || image.src.startsWith('https')) {
      return image;
    }
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://goza-madrid.onrender.com'
      : 'http://localhost:3000';
    return {
      ...image,
      src: `${baseUrl}${image.src.startsWith('/') ? '' : '/'}${image.src}`
    };
  }

  return { src: DEFAULT_IMAGE, alt: 'Imagen del blog' };
};

const BlogCard = ({ blog, index }) => {
  const blogUrl = blog.source === 'wordpress' 
    ? `/blog/${blog.slug}?source=wordpress` 
    : `/blog/${blog._id || blog.id}`;
  
  // Función para obtener la URL de la imagen
  const getImageUrl = (blog) => {
    if (blog.source === 'wordpress') {
      if (blog._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        return blog._embedded['wp:featuredmedia'][0].source_url;
      }
      if (blog.featured_media_url) {
        return blog.featured_media_url;
      }
      if (blog.better_featured_image?.source_url) {
        return blog.better_featured_image.source_url;
      }
      return DEFAULT_IMAGE;
    }
    
    // Para blogs de MongoDB
    if (!blog.image) return DEFAULT_IMAGE;
    
    if (typeof blog.image === 'string') {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://goza-madrid.onrender.com'
        : 'http://localhost:3000';
      return blog.image.startsWith('http') ? blog.image : `${baseUrl}${blog.image}`;
    }
    
    if (blog.image.src) {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://goza-madrid.onrender.com'
        : 'http://localhost:3000';
      return blog.image.src.startsWith('http') ? blog.image.src : `${baseUrl}${blog.image.src}`;
    }
    
    return DEFAULT_IMAGE;
  };

  // Preparar la imagen para el componente BlogImage
  const prepareImage = (blog) => {
    if (!blog.image) {
      return { src: DEFAULT_IMAGE, alt: blog.title || 'Imagen del blog' };
    }
    
    if (typeof blog.image === 'string') {
      return { src: blog.image, alt: blog.title || 'Imagen del blog' };
    }
    
    if (blog.image.src) {
      return { 
        src: blog.image.src, 
        alt: blog.image.alt || blog.title || 'Imagen del blog' 
      };
    }
    
    // Si llegamos aquí, usamos la función getImageUrl
    return { 
      src: getImageUrl(blog), 
      alt: blog.title || 'Imagen del blog' 
    };
  };

  const imageData = prepareImage(blog);
  const title = typeof blog.title === 'object' ? blog.title.rendered : blog.title;
  
  // Función mejorada para obtener la descripción
  const getDescription = (blog) => {
    if (blog.description) {
      return stripHtml(blog.description);
    }
    if (blog.excerpt?.rendered) {
      return stripHtml(blog.excerpt.rendered);
    }
    if (blog.content?.rendered) {
      return stripHtml(blog.content.rendered);
    }
    if (typeof blog.excerpt === 'string' && blog.excerpt) {
      return stripHtml(blog.excerpt);
    }
    if (typeof blog.content === 'string' && blog.content) {
      return stripHtml(blog.content);
    }
    return blog.description || 'Sin descripción disponible';
  };

  const description = truncateText(getDescription(blog), 150);
  
  // Añadir log para depuración
  console.log('Blog processing:', {
    id: blog._id || blog.id,
    title,
    hasDescription: !!blog.description,
    hasExcerpt: !!blog.excerpt,
    hasContent: !!blog.content,
    finalDescription: description
  });

  // Función auxiliar para formatear la fecha de manera segura
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return null;
    }
  };

  const formattedDate = formatDate(blog.date);

  return (
    <article 
      className="group h-full"
      itemScope 
      itemType="https://schema.org/BlogPosting"
    >
      <Link
        href={blogUrl}
        className="flex flex-col h-full bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md border border-gray-100"
        title={`Leer más sobre: ${title}`}
      >
        <div className="relative w-full overflow-hidden aspect-[16/9]">
          <BlogImage 
            src={imageData.src}
            alt={imageData.alt}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          {formattedDate && (
            <time 
              className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
              itemProp="datePublished"
              dateTime={new Date(blog.date).toISOString()}
            >
              {formattedDate}
            </time>
          )}
        </div>
        
        <div className="flex flex-1 flex-col p-5 md:p-6">
          {blog.category && (
            <span 
              className="inline-block bg-amarillo/20 text-amarillo px-2.5 py-0.5 rounded-full text-xs font-medium mb-3"
              itemProp="articleSection"
            >
              {blog.category}
            </span>
          )}
          
          <h2 
            className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amarillo transition-colors line-clamp-2"
            itemProp="headline"
          >
            {title}
          </h2>
          
          <p 
            className="text-gray-600 text-sm mb-4 line-clamp-3"
            itemProp="description"
          >
            {description}
          </p>
          
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
    </article>
  );
};

// Componente BlogHome
const BlogHome = (props) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tagline, heading, description } = {
    ...Blog44Defaults,
    ...props,
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const uniqueBlogs = new Map();
        
        try {
          const { posts } = await getBlogPostsFromServer(1, 3);
          
          if (posts && posts.length > 0) {
            posts.forEach(post => {
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
              
              // Procesar la imagen destacada
              let featuredImageUrl = null;
              
              if (post._embedded && 
                  post._embedded['wp:featuredmedia'] && 
                  post._embedded['wp:featuredmedia'][0]) {
                  
                  const media = post._embedded['wp:featuredmedia'][0];
                  
                  if (media.media_details && media.media_details.sizes) {
                      const sizePriority = ['medium_large', 'medium', 'large', 'full'];
                      
                      for (const size of sizePriority) {
                          if (media.media_details.sizes[size]) {
                              featuredImageUrl = media.media_details.sizes[size].source_url;
                              break;
                          }
                      }
                  }
                  
                  if (!featuredImageUrl && media.source_url) {
                      featuredImageUrl = media.source_url;
                  }
              }
              
              if (!featuredImageUrl) {
                  featuredImageUrl = post.uagb_featured_image_src?.medium?.[0] || 
                                    post.uagb_featured_image_src?.full?.[0] || 
                                    DEFAULT_IMAGE;
              }
              
              const blog = {
                _id: `wp-${post.id}`,
                id: post.id,
                title: safeRenderValue(post.title),
                description: truncatedDescription,
                content: post.content?.rendered || post.content || '',
                excerpt: post.excerpt?.rendered || post.excerpt || '',
                date: new Date(post.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                image: {
                  src: featuredImageUrl,
                  alt: safeRenderValue(post.title)
                },
                slug: post.slug,
                source: 'wordpress',
                category: post.categories?.[0]?.name || 'Blog'
              };
              
              uniqueBlogs.set(post.slug, blog);
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
              const remainingSlots = 3 - uniqueBlogs.size;
              
              for (let i = 0; i < Math.min(remainingSlots, localBlogs.length); i++) {
                const blog = localBlogs[i];
                const key = blog._id || blog.id;
                if (key && !uniqueBlogs.has(key)) {
                  const description = blog.description || blog.content || blog.excerpt || '';
                  const truncatedDescription = truncateText(description, 150);
                  
                  // Procesar la imagen
                  const processedImage = processImageUrl(blog.image);
                  
                  uniqueBlogs.set(key, {
                    ...blog,
                    description: truncatedDescription,
                    content: blog.content || description,
                    excerpt: blog.excerpt || description,
                    image: processedImage,
                    source: 'local'
                  });
                }
              }
            }
          } catch (localError) {
            console.error("Error al cargar blogs locales:", localError);
          }
        }
        
        const combinedBlogs = Array.from(uniqueBlogs.values())
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        
        setBlogs(combinedBlogs);
      } catch (error) {
        console.error("Error al cargar blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  return (
    <>
      <Head>
        <title>Blog de Goza Madrid | Noticias y Tendencias Inmobiliarias</title>
        <meta 
          name="description" 
          content="Descubre las últimas noticias y tendencias del mercado inmobiliario en Madrid. Consejos de expertos, análisis del mercado y guías para inversores."
        />
        <meta 
          name="keywords" 
          content="blog inmobiliario, noticias inmobiliarias madrid, mercado inmobiliario, inversión inmobiliaria, propiedades madrid"
        />
        <meta property="og:type" content="blog" />
        <meta property="og:title" content="Blog Inmobiliario Goza Madrid" />
        <meta property="og:description" content="Noticias y análisis del mercado inmobiliario en Madrid" />
        <meta property="og:image" content="/img/blog-banner.jpg" />
        <link rel="canonical" href="https://gozamadrid.com/blog" />
        
        {/* Schema.org markup para la página de blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog de Goza Madrid",
            "description": "Noticias y tendencias del mercado inmobiliario en Madrid",
            "publisher": {
              "@type": "Organization",
              "name": "Goza Madrid",
              "logo": {
                "@type": "ImageObject",
                "url": "https://gozamadrid.com/logo.png"
              }
            },
            "blogPost": blogs.map(blog => {
              const formattedDate = (() => {
                try {
                  const date = new Date(blog.date);
                  return !isNaN(date.getTime()) ? date.toISOString() : null;
                } catch {
                  return null;
                }
              })();

              return {
                "@type": "BlogPosting",
                "headline": typeof blog.title === 'object' ? blog.title.rendered : blog.title,
                "image": typeof blog.image === 'string' ? blog.image : blog.image?.src,
                ...(formattedDate && { "datePublished": formattedDate }),
                "articleBody": truncateText(blog.description || blog.content),
                "url": `https://gozamadrid.com/blog/${blog.slug || blog._id || blog.id}`
              };
            }).filter(post => post.headline) // Solo incluir posts con título válido
          })}
        </script>
      </Head>

      {loading && <LoadingScreen />}
      
      <AnimatedOnScroll>
        <section 
          id="blog-section" 
          className="px-[5%] py-16 md:py-24 lg:py-28"
          aria-label="Últimas publicaciones del blog"
        >
          <div className="container mx-auto">
            <header className="rb-12 mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
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
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 transition-all duration-300 hover:bg-black/70 backdrop-blur-sm max-w-[90%] sm:max-w-[80%] lg:max-w-none"
                  title="Ver todos los artículos del blog"
                  aria-label="Ver todos los artículos del blog"
                >
                  <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                    Ver todo
                  </span>
                  <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {loading ? (
                <LoadingScreen fullScreen={false} />
              ) : blogs.length > 0 ? (
                blogs.map((blog, index) => (
                  <BlogCard key={blog.id || blog._id} blog={blog} index={index} />
                ))
              ) : (
                <div 
                  className="col-span-full py-16 text-center"
                  role="alert"
                  aria-label="No hay publicaciones disponibles"
                >
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <p className="text-gray-500">No hay publicaciones disponibles.</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-amarillo text-white rounded-full hover:bg-amarillo/80 transition-colors"
                    aria-label="Revisa más tarde para ver nuevas publicaciones"
                  >
                    Revisa más tarde
                  </button>
                </div>
              )}
            </div>
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
