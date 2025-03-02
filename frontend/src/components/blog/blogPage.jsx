"use client";
import { getBlogById, getBlogPosts } from "@/pages/api";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import { getBlogPostsFromServer } from "@/services/wpApi";
import DirectImage from "../DirectImage";
import Image from 'next/image';
import LoadingScreen from '../LoadingScreen';

// Importar nuestra función de utilidad o crearla aquí
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
  if (!text) return 'Visita nuestro blog para leer este artículo completo.';
  
  // Si ya es un string, simplemente truncarlo
  const cleanText = typeof text === 'string' ? stripHtml(text) : String(text);
  
  if (cleanText.length <= length) return cleanText;
  
  // Truncar y añadir puntos suspensivos
  return cleanText.substring(0, length).trim() + '...';
};

// Función mejorada para obtener descripción de diversas fuentes
const getDescription = (post) => {
  let description = '';
  
  // Intentar diferentes campos para obtener una descripción
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
  
  // Si aún no tenemos descripción, usar un valor predeterminado
  if (!description || description.trim() === '') {
    description = 'Visita nuestro blog para leer este artículo completo.';
  }
  
  return description;
};

// Función para procesar todos los blogs y garantizar que sean seguros para renderizar
const processSafeBlogList = (blogs) => {
  if (!Array.isArray(blogs)) return [];
  
  return blogs.map(blog => {
    // Hacer una copia y procesar todos los campos importantes
    return {
      ...blog,
      title: safeRenderValue(blog.title),
      description: safeRenderValue(blog.description),
      content: safeRenderValue(blog.content),
      excerpt: safeRenderValue(blog.excerpt),
      date: blog.date,  // Las fechas ya están procesadas
      dateFormatted: blog.dateFormatted || blog.date,
      author: safeRenderValue(blog.author),
      image: blog.image  // Las imágenes son objetos, pero no se renderizan directamente
    };
  });
};

// Función auxiliar para obtener un ID seguro
const getSafeId = (id) => {
    if (id === undefined || id === null) return '';
    return typeof id === 'string' ? id : String(id);
};

export default function BlogPage() {
    // Estado para indicar que el componente se montó (solo en cliente)
    const [hasMounted, setHasMounted] = useState(false);
    // Estado para almacenar la lista de blogs (inicialmente un array vacío)
    const [blogs, setBlogs] = useState([]);
    // Estado para almacenar el contenido del blog seleccionado
    const [selectedBlog, setSelectedBlog] = useState(null);
    // Estado para indicar carga
    const [loading, setLoading] = useState(true);

    // Establece hasMounted en true una vez que el componente se monta en el cliente
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Efecto para obtener la lista combinada de blogs
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            const combinedBlogs = [];
            const seenPosts = new Map(); // Usaremos un Map para rastrear blogs por ID y slug
            
            try {
                // PASO 1: Cargar blogs desde WordPress primero (para tener prioridad)
                console.log("Cargando blogs de WordPress...");
                try {
                    const { posts } = await getBlogPostsFromServer(1, 10);
                    if (posts && posts.length > 0) {
                        console.log(`Obtenidos ${posts.length} blogs de WordPress`);
                        
                        posts.forEach(post => {
                            // Usar slug como identificador principal para WordPress
                            const wpKey = post.slug;
                            const wpId = `wp-${post.id}`;
                            
                            if (!seenPosts.has(wpKey)) {
                                // Extraer la URL de la imagen destacada de _embedded
                                let featuredImageUrl = null;
                                
                                // Intentar obtener la imagen destacada desde _embedded (disponible gracias a _embed)
                                if (post._embedded && 
                                    post._embedded['wp:featuredmedia'] && 
                                    post._embedded['wp:featuredmedia'][0]) {
                                    
                                    const media = post._embedded['wp:featuredmedia'][0];
                                    
                                    // Intentar obtener un tamaño específico o usar source_url como fallback
                                    if (media.media_details && media.media_details.sizes) {
                                        // Preferir tamaños medianos para mejor rendimiento
                                        const sizePriority = ['medium_large', 'medium', 'large', 'full'];
                                        
                                        for (const size of sizePriority) {
                                            if (media.media_details.sizes[size]) {
                                                featuredImageUrl = media.media_details.sizes[size].source_url;
                                                break;
                                            }
                                        }
                                    }
                                    
                                    // Si no se encontró un tamaño específico, usar source_url
                                    if (!featuredImageUrl && media.source_url) {
                                        featuredImageUrl = media.source_url;
                                    }
                                }
                                
                                // Fallback a otras fuentes de imágenes si _embedded no tiene la imagen
                                if (!featuredImageUrl) {
                                    featuredImageUrl = post.uagb_featured_image_src?.medium?.[0] || 
                                                      post.uagb_featured_image_src?.full?.[0] || 
                                                      '/placeholder.jpg';
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
                                    source: 'wordpress'
                                };
                                
                                combinedBlogs.push(wpBlog);
                                seenPosts.set(wpKey, wpBlog);
                                seenPosts.set(wpId, wpBlog);
                            } else {
                                console.log(`Blog WordPress duplicado detectado: ${wpKey}`);
                            }
                        });
                    }
                } catch (wpError) {
                    console.error("Error cargando blogs de WordPress:", wpError);
                }
                
                // PASO 2: Cargar blogs locales y añadir solo los que no existan ya
                console.log("Cargando blogs de la API local...");
                try {
                    const localData = await getBlogPosts();
                    const localBlogs = Array.isArray(localData) ? localData : [];
                    
                    if (localBlogs.length > 0) {
                        console.log(`Obtenidos ${localBlogs.length} blogs de la API local`);
                        
                        localBlogs.forEach(blog => {
                            const localId = blog._id || blog.id;
                            const localSlug = blog.slug;
                            
                            // Verificar si este blog ya existe por ID o slug
                            if (!seenPosts.has(localId) && !seenPosts.has(localSlug)) {
                                const processedBlog = {
                                    ...blog,
                                    _id: localId,
                                    title: safeRenderValue(blog.title),
                                    description: truncateText(getDescription(blog), 150),
                                    source: 'local'
                                };
                                
                                combinedBlogs.push(processedBlog);
                                seenPosts.set(localId, processedBlog);
                                if (localSlug) seenPosts.set(localSlug, processedBlog);
                            } else {
                                console.log(`Blog local duplicado detectado: ${localId}`);
                            }
                        });
                    }
                } catch (localError) {
                    console.error("Error cargando blogs locales:", localError);
                }
                
                // PASO 3: Ordenar por fecha
                combinedBlogs.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateB - dateA;
                });
                
                console.log(`Total de blogs combinados (sin duplicados): ${combinedBlogs.length}`);
                console.log("Blogs finales:", combinedBlogs.map(b => ({ id: b._id, title: b.title.substring(0, 20), source: b.source })));
                
                // PASO 4: Establecer los blogs en el estado
                setBlogs(processSafeBlogList(combinedBlogs));
                
            } catch (error) {
                console.error("Error general en fetchBlogs:", error);
                setBlogs(processSafeBlogList(combinedBlogs)); // Usar lo que hayamos obtenido
            } finally {
                setLoading(false);
            }
        };
        
        fetchBlogs();
    }, []);

    // Segundo efecto: obtener el contenido del primer blog de la lista
    useEffect(() => {
        const fetchBlogContent = async (id, source) => {
            try {
                // Añadir logs para depuración
                console.log("fetchBlogContent - ID recibido:", id, "tipo:", typeof id, "source:", source);
                
                // Si el blog es de WordPress, ya tenemos su contenido
                if (source === 'wordpress') {
                    const wpBlog = blogs.find(blog => blog._id === id);
                    if (wpBlog) {
                        setSelectedBlog(wpBlog);
                        return;
                    }
                }
                
                // Intentar obtener un ID válido para consulta
                let blogId;
                
                if (id === undefined || id === null) {
                    console.log("ID no válido, omitiendo consulta");
                    return; // Simplemente no hacer nada si no hay ID
                }
                
                // Convertir a string si no lo es ya
                const strId = String(id);
                
                // Procesar el ID según su formato
                if (strId.startsWith('wp-')) {
                    blogId = strId.substring(3);
                } else {
                    blogId = strId;
                }
                
                console.log("ID procesado para consulta:", blogId);
                
                // Intentar obtener el blog
                const data = await getBlogById(blogId);
                
                if (data) {
                    setSelectedBlog(data);
                } else {
                    console.log("No se encontró blog con ID:", blogId);
                }
            } catch (error) {
                console.error("Error obteniendo contenido del blog:", error);
                // Usar fallback si está disponible
                try {
                    const fallbackBlog = blogs.find(blog => String(blog._id) === String(id));
                    if (fallbackBlog) {
                        console.log("Usando blog fallback");
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
                console.log("Primer blog:", firstBlog);
                
                // Intentar obtener un ID y source válidos
                const blogId = firstBlog?._id || firstBlog?.id || null;
                const blogSource = firstBlog?.source || 'unknown';
                
                if (blogId !== null) {
                    console.log("Llamando a fetchBlogContent con ID:", blogId);
                    fetchBlogContent(blogId, blogSource);
                } else {
                    console.log("No se encontró un ID válido en el primer blog");
                }
            } catch (error) {
                console.error("Error procesando el primer blog:", error);
            }
        }
    }, [blogs]);

    if (!hasMounted) {
        return <LoadingScreen fullScreen={false} />;
    }

    return (
        <>
            {loading && <LoadingScreen />}

            <div className="relative mt-[-30vh] py-8">
                <AnimatedOnScroll>
                    {/* Contenedor de contenido con posición relativa para que no herede la opacidad del fondo */}
                    <div className="relative container mx-auto px-4">
                        {/* Encabezado */}
                        <header className="mb-8 text-center">
                            <div className="relative inline-block">
                                {/* Texto: este elemento se posiciona relativo para estar sobre el fondo */}
                                <h1 className="relative text-gray-700 inline-block text-lg font-bold px-4 py-2">
                                    Lee e infórmate con nuestros blogs
                                </h1>
                            </div>

                            <p className="text-4xl font-bold mb-2 text-black">
                                Descubre nuestros artículos y últimas noticias.
                            </p>
                        </header>

                        {/* Indicador de carga */}
                        {loading ? (
                            <LoadingScreen fullScreen={false} />
                        ) : (
                            /* Lista de blogs */
                            blogs && Array.isArray(blogs) && blogs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {blogs.map((blog) => {
                                        // Validar que el blog tiene un ID válido
                                        if (!blog || !blog._id) {
                                            console.error("Blog sin ID detectado:", blog);
                                            return null; // No renderizar blogs sin ID
                                        }
                                        
                                        // Asegurar que tenemos una versión string del ID
                                        const safeId = getSafeId(blog._id);
                                        const blogUrl = blog.source === 'wordpress' 
                                            ? `/blog/${blog.slug}?source=wordpress` 
                                            : `/blog/${blog._id}`;
                                        
                                        return (
                                            <div key={safeId} className="group h-full">
                                                <Link
                                                    href={blogUrl}
                                                    className="flex flex-col h-full bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md"
                                                >
                                                    {/* Contenedor de la imagen con overlay de gradiente */}
                                                    <div className="relative w-full overflow-hidden aspect-[16/9]">
                                                        {blog.image && blog.image.src ? (
                                                            <Image
                                                                src={blog.image.src}
                                                                alt={blog.image.alt || blog.title || "Imagen del blog"}
                                                                fill
                                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                                unoptimized={!blog.image.src.includes('realestategozamadrid.com')}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Gradiente permanente para mejor legibilidad */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                                        
                                                        {/* Fecha en overlay */}
                                                        {blog.dateFormatted && (
                                                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                                                {blog.dateFormatted}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Contenido de la tarjeta */}
                                                    <div className="flex flex-1 flex-col p-6">
                                                        {/* Título */}
                                                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amarillo transition-colors line-clamp-2">
                                                            {safeRenderValue(blog.title)}
                                                        </h2>
                                                        
                                                        {/* Resumen */}
                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                            {blog.description || truncateText(getDescription(blog), 100)}
                                                        </p>
                                                        
                                                        {/* Footer con botón de acción */}
                                                        <div className="mt-auto pt-4 flex items-center border-t border-gray-100">
                                                            <span className="flex items-center text-amarillo font-medium group-hover:text-amarillo/80 transition-colors">
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
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    <p className="text-gray-500">No hay blogs disponibles en este momento.</p>
                                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-amarillo text-white rounded-full hover:bg-amarillo/80 transition-colors">
                                        Recargar página
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </AnimatedOnScroll>
            </div>
        </>
    );
}