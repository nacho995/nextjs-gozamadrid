"use client";

import { getBlogById, getBlogPosts } from "@/pages/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import { getBlogPostsFromServer } from "@/services/wpApi";
import BlogImage from './BlogImage';
import LoadingScreen from '../LoadingScreen';
import Head from 'next/head';

// Helper functions remain the same
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

const stripHtml = (htmlString) => {
  if (!htmlString) return '';
  try {
    return htmlString.replace(/<[^>]*>?/gm, '');
  } catch (error) {
    console.error('Error al eliminar HTML:', error);
    return String(htmlString);
  }
};

const truncateText = (text, length = 150) => {
  if (!text) return 'Visita nuestro blog para leer este artículo completo.';
  
  const cleanText = typeof text === 'string' ? stripHtml(text) : String(text);
  
  if (cleanText.length <= length) return cleanText;
  
  return cleanText.substring(0, length).trim() + '...';
};

const getDescription = (post) => {
  let description = '';
  
  if (post.excerpt?.rendered) {
    description = stripHtml(post.excerpt.rendered);
  } else if (post.content?.rendered) {
    description = stripHtml(post.content.rendered);
  } else if (post.description) {
    description = typeof post.description === 'string' 
      ? stripHtml(post.description) 
      : typeof post.description === 'object' && post.description.rendered
        ? stripHtml(post.description.rendered)
        : '';
  } else if (post.excerpt) {
    description = typeof post.excerpt === 'string' ? stripHtml(post.excerpt) : '';
  } else if (post.content) {
    description = typeof post.content === 'string' ? stripHtml(post.content) : '';
  }
  
  if (!description || description.trim() === '') {
    description = 'Visita nuestro blog para leer este artículo completo.';
  }
  
  return description;
};

// Añadir función para procesar URLs de imágenes
const processImageUrl = (image) => {
  if (!image) return null;

  // Si es un string
  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('https')) {
      return { src: image, alt: 'Imagen del blog' };
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
    return {
      ...image,
      src: `${baseUrl}${image.src.startsWith('/') ? '' : '/'}${image.src}`
    };
  }

  return null;
};

// Modificar la función processSafeBlogList para incluir el procesamiento de imágenes
const processSafeBlogList = (blogs) => {
  if (!Array.isArray(blogs)) return [];
  
  return blogs.map(blog => {
    // Procesar la imagen
    const processedImage = processImageUrl(blog.image);

    return {
      ...blog,
      title: safeRenderValue(blog.title),
      description: safeRenderValue(blog.description),
      content: safeRenderValue(blog.content),
      excerpt: safeRenderValue(blog.excerpt),
      date: blog.date,
      dateFormatted: blog.dateFormatted || blog.date,
      author: safeRenderValue(blog.author),
      image: processedImage
    };
  });
};

const getSafeId = (id) => {
  if (id === undefined || id === null) return '';
  return typeof id === 'string' ? id : String(id);
};

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isClient, setIsClient] = useState(false);
    
    // Schema.org structured data for the blog listing
    const blogListingSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog de Goza Madrid",
      "description": "Artículos y noticias sobre el sector inmobiliario, inversión y estilo de vida en Madrid",
      "url": typeof window !== 'undefined' ? window.location.origin + '/blog' : 'https://www.gozamadrid.com/blog',
      "publisher": {
        "@type": "Organization",
        "name": "Goza Madrid",
        "logo": {
          "@type": "ImageObject",
          "url": typeof window !== 'undefined' ? window.location.origin + '/logo.png' : 'https://www.gozamadrid.com/logo.png'
        }
      },
      "blogPosts": blogs.map(blog => ({
        "@type": "BlogPosting",
        "headline": typeof blog.title === 'string' ? blog.title : blog.title?.rendered || '',
        "description": blog.description || getDescription(blog),
        "datePublished": blog.date,
        "author": {
          "@type": "Person",
          "name": blog.author || "Equipo Goza Madrid"
        },
        "image": blog.image?.src || "/img/default-image.jpg",
        "url": typeof window !== 'undefined' 
          ? `${window.location.origin}/blog/${blog.source === 'wordpress' ? blog.slug + '?source=wordpress' : blog._id}`
          : `https://www.gozamadrid.com/blog/${blog.source === 'wordpress' ? blog.slug + '?source=wordpress' : blog._id}`
      }))
    };

    // Component mount effect
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch blogs effect
    useEffect(() => {
        let isMounted = true;
        
        const fetchBlogs = async () => {
            if (!isMounted) return;
            
            setLoading(true);
            setError(null);
            
            const combinedBlogs = [];
            const seenPosts = new Map();
            
            try {
                // PASO 1: Cargar blogs desde WordPress primero
                console.log("Cargando blogs de WordPress...");
                try {
                    const { posts } = await getBlogPostsFromServer(1, 10);
                    if (isMounted && posts && posts.length > 0) {
                        console.log(`Obtenidos ${posts.length} blogs de WordPress`);
                        
                        posts.forEach(post => {
                            const wpKey = post.slug;
                            const wpId = `wp-${post.id}`;
                            
                            if (!seenPosts.has(wpKey)) {
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
                                                      '/img/default-blog-image.jpg';
                                }
                                
                                const wpBlog = {
                                    _id: wpId,
                                    title: safeRenderValue(post.title),
                                    description: truncateText(getDescription(post), 150),
                                    content: safeRenderValue(post.content),
                                    date: new Date(post.date).toISOString(),
                                    dateFormatted: new Date(post.date).toLocaleDateString('es-ES'),
                                    image: {
                                        src: featuredImageUrl,
                                        alt: safeRenderValue(post.title)
                                    },
                                    slug: post.slug,
                                    source: 'wordpress',
                                    author: post.author_name || post._embedded?.author?.[0]?.name || "Equipo Goza Madrid"
                                };
                                
                                combinedBlogs.push(wpBlog);
                                seenPosts.set(wpKey, wpBlog);
                                seenPosts.set(wpId, wpBlog);
                            }
                        });
                    }
                } catch (wpError) {
                    console.error("Error cargando blogs de WordPress:", wpError);
                    if (isMounted) {
                        setError("Error al cargar blogs de WordPress");
                    }
                }
                
                // PASO 2: Cargar blogs locales
                if (isMounted) {
                    console.log("Cargando blogs de la API local...");
                    try {
                        const localData = await getBlogPosts();
                        if (isMounted && localData && localData.length > 0) {
                            console.log(`Obtenidos ${localData.length} blogs locales`);
                            
                            localData.forEach(blog => {
                                const localKey = blog.slug || blog._id;
                                
                                if (!seenPosts.has(localKey)) {
                                    const processedBlog = {
                                        ...blog,
                                        image: processImageUrl(blog.image),
                                        source: 'local'
                                    };
                                    
                                    combinedBlogs.push(processedBlog);
                                    seenPosts.set(localKey, processedBlog);
                                }
                            });
                        }
                    } catch (localError) {
                        console.error("Error cargando blogs locales:", localError);
                        if (isMounted) {
                            setError((prevError) => 
                                prevError 
                                    ? `${prevError}. Error al cargar blogs locales` 
                                    : "Error al cargar blogs locales"
                            );
                        }
                    }
                }
                
                // PASO 3: Ordenar y actualizar el estado
                if (isMounted) {
                    const sortedBlogs = combinedBlogs.sort((a, b) => 
                        new Date(b.date) - new Date(a.date)
                    );
                    
                    setBlogs(sortedBlogs);
                    console.log(`Total de blogs cargados: ${sortedBlogs.length}`);
                }
            } catch (error) {
                console.error("Error general cargando blogs:", error);
                if (isMounted) {
                    setError("Error al cargar los blogs");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchBlogs();
        
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch selected blog effect
    useEffect(() => {
        const fetchBlogContent = async (id, source) => {
            try {
                if (source === 'wordpress') {
                    const wpBlog = blogs.find(blog => blog._id === id);
                    if (wpBlog) {
                        setSelectedBlog(wpBlog);
                        return;
                    }
                }
                
                let blogId;
                
                if (id === undefined || id === null) {
                    return;
                }
                
                const strId = String(id);
                
                if (strId.startsWith('wp-')) {
                    blogId = strId.substring(3);
                } else {
                    blogId = strId;
                }
                
                const data = await getBlogById(blogId);
                
                if (data) {
                    setSelectedBlog(data);
                }
            } catch (error) {
                console.error("Error obteniendo contenido del blog:", error);
                try {
                    const fallbackBlog = blogs.find(blog => String(blog._id) === String(id));
                    if (fallbackBlog) {
                        setSelectedBlog(fallbackBlog);
                    }
                } catch (fbError) {
                    console.error("Error incluso con fallback:", fbError);
                }
            }
        };

        if (blogs && Array.isArray(blogs) && blogs.length > 0) {
            try {
                const firstBlog = blogs[0];
                
                const blogId = firstBlog?._id || firstBlog?.id || null;
                const blogSource = firstBlog?.source || 'unknown';
                
                if (blogId !== null) {
                    fetchBlogContent(blogId, blogSource);
                }
            } catch (error) {
                console.error("Error procesando el primer blog:", error);
            }
        }
    }, [blogs]);

    if (!isClient) {
        return <LoadingScreen fullScreen={false} />;
    }

    return (
        <>
            <Head>
                <title>Blog de Goza Madrid | Artículos inmobiliarios y noticias del sector</title>
                <meta name="description" content="Descubre artículos sobre inversión inmobiliaria, compraventa, alquiler, decoración y tendencias del mercado en Madrid. Blog especializado en el sector inmobiliario." />
                <meta name="keywords" content="blog inmobiliario, artículos inmobiliarios madrid, noticias sector inmobiliario, inversión inmobiliaria, compraventa, alquiler" />
                <link rel="canonical" href="https://www.gozamadrid.com/blog" />
                <meta property="og:title" content="Blog de Goza Madrid | Artículos y noticias inmobiliarias" />
                <meta property="og:description" content="Encuentra información valiosa sobre el mercado inmobiliario, consejos para comprar o vender tu propiedad, y las últimas tendencias del sector." />
                <meta property="og:url" content="https://www.gozamadrid.com/blog" />
                <meta property="og:type" content="website" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }}
                />
            </Head>

            {loading && <LoadingScreen />}

            <main className="relative mt-[-30vh] py-8">
                <AnimatedOnScroll>
                    <div className="relative container mx-auto px-4">
                        {/* Encabezado mejorado con semántica correcta */}
                        <header className="mb-12 text-center">
                            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black">
                                Blog de Goza Madrid
                            </h1>
                            <p className="text-lg max-w-3xl mx-auto text-gray-600">
                                Descubre nuestros artículos sobre el sector inmobiliario, consejos para inversores y propietarios, 
                                y las últimas tendencias del mercado en Madrid.
                            </p>
                        </header>

                        {/* Indicador de carga */}
                        {loading ? (
                            <div role="status" aria-label="Cargando artículos del blog">
                                <LoadingScreen fullScreen={false} />
                            </div>
                        ) : (
                            /* Lista de blogs con semántica mejorada */
                            <section aria-label="Listado de artículos del blog">
                                {blogs && Array.isArray(blogs) && blogs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {blogs.map((blog) => {
                                            if (!blog || !blog._id) {
                                                return null;
                                            }
                                            
                                            const safeId = getSafeId(blog._id);
                                            const blogUrl = blog.source === 'wordpress' 
                                                ? `/blog/${blog.slug}?source=wordpress` 
                                                : `/blog/${blog._id}`;
                                            
                                            // Get published date in readable format
                                            const publishDate = blog.dateFormatted || 
                                                (blog.date ? new Date(blog.date).toLocaleDateString('es-ES') : '');
                                            
                                            return (
                                                <article key={safeId} className="group h-full flex flex-col" itemScope itemType="https://schema.org/BlogPosting">
                                                    {/* Hidden metadata for SEO */}
                                                    <meta itemProp="datePublished" content={blog.date || ''} />
                                                    <meta itemProp="author" content={blog.author || 'Equipo Goza Madrid'} />
                                                    
                                                    <Link
                                                        href={blogUrl}
                                                        className="flex flex-col h-full bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md"
                                                        title={`Leer artículo: ${typeof blog.title === 'string' ? blog.title : ''}`}
                                                    >
                                                        {/* Contenedor de la imagen con overlay de gradiente */}
                                                        <div className="relative w-full overflow-hidden aspect-[16/9]">
                                                            {blog.image ? (
                                                                <BlogImage
                                                                    src={blog.image.src}
                                                                    alt={blog.image.alt || `Imagen para el artículo: ${blog.title}` || "Imagen del blog"}
                                                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Gradiente permanente para mejor legibilidad */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                                            
                                                            {/* Fecha en overlay */}
                                                            {publishDate && (
                                                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                                                    <time dateTime={blog.date} itemProp="datePublished">{publishDate}</time>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Contenido de la tarjeta */}
                                                        <div className="flex flex-1 flex-col p-6">
                                                            {/* Título */}
                                                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amarillo transition-colors line-clamp-2" itemProp="headline">
                                                                {safeRenderValue(blog.title)}
                                                            </h2>
                                                            
                                                            {/* Resumen */}
                                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3" itemProp="description">
                                                                {blog.description || truncateText(getDescription(blog), 100)}
                                                            </p>
                                                            
                                                            {/* Footer con botón de acción */}
                                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                                                <span className="flex items-center text-amarillo font-medium group-hover:text-amarillo/80 transition-colors">
                                                                    Leer más
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                    </svg>
                                                                </span>
                                                                
                                                                {/* Categoría si está disponible */}
                                                                {blog.category && (
                                                                    <span className="text-xs text-gray-500" itemProp="articleSection">
                                                                        {blog.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </article>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center" role="alert">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold mb-2">No hay artículos disponibles</h2>
                                        <p className="text-gray-500 mb-6">No hemos encontrado artículos de blog en este momento.</p>
                                        <button 
                                            onClick={() => window.location.reload()} 
                                            className="mt-4 px-4 py-2 bg-amarillo text-white rounded-full hover:bg-amarillo/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amarillo/50"
                                            aria-label="Recargar página"
                                        >
                                            Recargar página
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </AnimatedOnScroll>
            </main>
        </>
    );
}