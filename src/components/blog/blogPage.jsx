"use client";

import { getBlogPosts, getBlogById } from '@/services/api';
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

// Mejor manejo de errores para no saturar la consola
const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    console.error(`Error en fetch a ${url}:`, error.message);
    throw error;
  }
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
      "url": typeof window !== 'undefined' ? window.location.origin + '/blog' : 'https://www.realestategozamadrid.com/blog',
      "publisher": {
        "@type": "Organization",
        "name": "Goza Madrid",
        "logo": {
          "@type": "ImageObject",
          "url": typeof window !== 'undefined' ? window.location.origin + '/logo.png' : 'https://www.realestategozamadrid.com/logo.png'
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
          : `https://www.realestategozamadrid.com/blog/${blog.source === 'wordpress' ? blog.slug + '?source=wordpress' : blog._id}`
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
            let hasLoadedAnyBlogs = false;

            // PASO 1: Intentar obtener blogs de WordPress directamente desde proxy/wordpress/posts
            try {
                console.log("Cargando blogs desde el proxy de WordPress...");
                // Usar el endpoint que sabemos que funciona
                const wpResponse = await fetch('/api/blogs?limit=100', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-store, no-cache, must-revalidate'
                    }
                });
                
                if (wpResponse.ok) {
                    const wpData = await wpResponse.json();
                    if (wpData && Array.isArray(wpData)) {
                        console.log(`Obtenidos ${wpData.length} blogs de WordPress`);
                        hasLoadedAnyBlogs = true;
                        
                        wpData.forEach(post => {
                            const wpKey = post.slug;
                            const wpId = `wp-${post.id}`;
                            
                            if (!seenPosts.has(wpKey)) {
                                let featuredImageUrl = null;
                                
                                // 1. Primero intentar con el campo featured_image_url procesado por el proxy
                                if (post.featured_image_url) {
                                    featuredImageUrl = post.featured_image_url;
                                    console.log(`[BlogPage] Usando featured_image_url para post ${post.id}: ${featuredImageUrl}`);
                                }
                                
                                // 2. Si no, extraer imagen destacada de _embedded
                                else if (post._embedded && 
                                    post._embedded['wp:featuredmedia'] && 
                                    post._embedded['wp:featuredmedia'][0]) {
                                    
                                    const media = post._embedded['wp:featuredmedia'][0];
                                    featuredImageUrl = media.source_url || null;
                                    console.log(`[BlogPage] Usando _embedded media para post ${post.id}: ${featuredImageUrl}`);
                                    
                                    // Asegurarnos de que la URL de la imagen sea segura (HTTPS)
                                    if (featuredImageUrl && featuredImageUrl.startsWith('http:')) {
                                        featuredImageUrl = featuredImageUrl.replace('http:', 'https:');
                                    }
                                    
                                    // Corregir subdomain incorrecto de WordPress
                                    if (featuredImageUrl && featuredImageUrl.includes('wordpress.realestategozamadrid.com')) {
                                        featuredImageUrl = featuredImageUrl.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
                                    }
                                }
                                
                                // 3. Fallback a featured_media_url
                                else if (post.featured_media_url) {
                                    featuredImageUrl = post.featured_media_url;
                                    if (featuredImageUrl.startsWith('http:')) {
                                        featuredImageUrl = featuredImageUrl.replace('http:', 'https:');
                                    }
                                    if (featuredImageUrl.includes('wordpress.realestategozamadrid.com')) {
                                        featuredImageUrl = featuredImageUrl.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
                                    }
                                }
                                
                                // 4. Intentar obtener la imagen desde uagb_featured_image_src si existe
                                else if (post.uagb_featured_image_src) {
                                    let imgSrc = null;
                                    // Intentar con diferentes tamaños de imagen
                                    if (post.uagb_featured_image_src.large) {
                                        imgSrc = post.uagb_featured_image_src.large[0];
                                    } else if (post.uagb_featured_image_src.medium) {
                                        imgSrc = post.uagb_featured_image_src.medium[0];
                                    } else if (post.uagb_featured_image_src.full) {
                                        imgSrc = post.uagb_featured_image_src.full[0];
                                    } else if (post.uagb_featured_image_src.thumbnail) {
                                        imgSrc = post.uagb_featured_image_src.thumbnail[0];
                                    }
                                    
                                    if (imgSrc) {
                                        featuredImageUrl = imgSrc;
                                        if (featuredImageUrl.startsWith('http:')) {
                                            featuredImageUrl = featuredImageUrl.replace('http:', 'https:');
                                        }
                                        if (featuredImageUrl.includes('wordpress.realestategozamadrid.com')) {
                                            featuredImageUrl = featuredImageUrl.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
                                        }
                                    }
                                }
                                
                                // Si encontramos una imagen, usar proxy para evitar errores de CORS
                                if (featuredImageUrl) {
                                    // Solo usar proxy si no es ya una imagen de Unsplash o no está ya proxificada
                                    if (!featuredImageUrl.includes('images.unsplash.com') && 
                                        !featuredImageUrl.includes('images.weserv.nl')) {
                                        featuredImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(featuredImageUrl)}&w=800&h=600&fit=cover&default=${encodeURIComponent('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80')}`;
                                    }
                                } else {
                                    // Fallback a imagen por defecto
                                    featuredImageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80';
                                    console.log(`[BlogPage] No se encontró imagen para post ${post.id}, usando fallback`);
                                }
                                
                                const wpBlog = {
                                    _id: wpId,
                                    id: post.id,
                                    title: post.title?.rendered || 'Sin título',
                                    description: truncateText(getDescription(post), 150),
                                    content: post.content?.rendered || '',
                                    excerpt: post.excerpt?.rendered || '',
                                    date: new Date(post.date).toISOString(),
                                    dateFormatted: new Date(post.date).toLocaleDateString('es-ES'),
                                    image: {
                                        src: featuredImageUrl,
                                        alt: post.title?.rendered || 'Imagen del blog'
                                    },
                                    slug: post.slug,
                                    source: 'wordpress',
                                    author: post.author_name || "Equipo Goza Madrid",
                                    // Asegurar que cada blog tenga propiedades básicas para mostrar, incluso sin conexión
                                    _embedded: post._embedded || {},
                                    categories: post.categories || [],
                                    tags: post.tags || []
                                };
                                
                                combinedBlogs.push(wpBlog);
                                seenPosts.set(wpKey, wpBlog);
                                seenPosts.set(wpId, wpBlog);
                            }
                        });
                    }
                } else {
                    console.error(`Error ${wpResponse.status} al obtener blogs de WordPress`);
                }
            } catch (wpError) {
                console.error("Error cargando blogs de WordPress:", wpError.message);
                
                // Intentar con el fallback de WordPress solo si aún no tenemos blogs
                if (!hasLoadedAnyBlogs) {
                    try {
                        const fallbackWpResponse = await fetch('/api/blogs?limit=100', {
                            headers: {
                                'Accept': 'application/json',
                                'Cache-Control': 'no-store, no-cache, must-revalidate'
                            }
                        });
                        
                        if (fallbackWpResponse.ok) {
                            const wpBlogs = await fallbackWpResponse.json();
                            if (Array.isArray(wpBlogs) && wpBlogs.length > 0) {
                                console.log(`Obtenidos ${wpBlogs.length} blogs desde fallback WordPress`);
                                hasLoadedAnyBlogs = true;
                                
                                wpBlogs.forEach(blog => {
                                    const blogId = blog.id || `wp-${blog.id}`;
                                    if (!seenPosts.has(blogId)) {
                                        // Asegurar que tiene imagen
                                        if (!blog.image) {
                                            blog.image = {
                                                src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
                                                alt: blog.title || 'Imagen del blog'
                                            };
                                        } else if (typeof blog.image === 'string') {
                                            // Asegurarnos de que la URL de la imagen sea segura (HTTPS)
                                            let imgSrc = blog.image;
                                            if (imgSrc.startsWith('http:')) {
                                                imgSrc = imgSrc.replace('http:', 'https:');
                                            }
                                            // Usar proxy de imágenes
                                            imgSrc = `/api/proxy-image?url=${encodeURIComponent(imgSrc)}`;
                                            blog.image = {
                                                src: imgSrc,
                                                alt: blog.title || 'Imagen del blog'
                                            };
                                        } else if (blog.image.src && blog.image.src.startsWith('http:')) {
                                            blog.image.src = blog.image.src.replace('http:', 'https:');
                                            blog.image.src = `/api/proxy-image?url=${encodeURIComponent(blog.image.src)}`;
                                        }
                                        
                                        // Convertir a formato estándar si es necesario
                                        const processedBlog = {
                                            _id: blogId,
                                            id: blog.id,
                                            title: blog.title || 'Sin título',
                                            description: truncateText(blog.excerpt || blog.description || '', 150),
                                            content: blog.content || '',
                                            date: blog.date || new Date().toISOString(),
                                            image: typeof blog.image === 'string' 
                                                ? { src: blog.image, alt: blog.title || 'Imagen del blog' } 
                                                : blog.image,
                                            slug: blog.slug,
                                            source: 'wordpress'
                                        };
                                        
                                        combinedBlogs.push(processedBlog);
                                        seenPosts.set(blogId, processedBlog);
                                    }
                                });
                            }
                        }
                    } catch (fallbackError) {
                        console.error("Error en fallback de WordPress:", fallbackError.message);
                    }
                }
            }
            
            // SIEMPRE intentamos obtener blogs de AWS Beanstalk, sin importar si ya tenemos blogs de WordPress
            try {
                let awsBlogs = [];
                let hasAwsBlogs = false;
            
                // 1. Intentar con el nuevo endpoint AWS Beanstalk
                try {
                    console.log("Cargando blogs desde AWS Beanstalk...");
                    const beanstalkResponse = await fetch('/api/proxy/backend/blogs?limit=100', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-store, no-cache, must-revalidate'
                        },
                        // Aumentar el timeout para evitar que la carga se quede en espera
                        signal: AbortSignal.timeout(15000) // Aumentado a 15 segundos para dar más tiempo
                    }).catch(error => {
                        console.error("Error en fetch a Beanstalk:", error.message);
                        return { ok: false, status: 0, statusText: error.message };
                    });
                    
                    if (beanstalkResponse.ok) {
                        try {
                            const beanstalkData = await beanstalkResponse.json();
                            console.log("Respuesta de Beanstalk:", beanstalkData && Array.isArray(beanstalkData) ? 
                                `Array con ${beanstalkData.length} elementos` : 
                                `Tipo de datos: ${typeof beanstalkData}`);
                                
                            if (beanstalkData && Array.isArray(beanstalkData) && beanstalkData.length > 0) {
                                awsBlogs = beanstalkData;
                                hasAwsBlogs = true;
                                console.log(`Obtenidos ${beanstalkData.length} blogs de AWS Beanstalk`);
                                hasLoadedAnyBlogs = true; // Marcar que hemos cargado blogs
                            } else if (beanstalkData && Array.isArray(beanstalkData) && beanstalkData.length === 0) {
                                console.log("La API de Beanstalk devolvió un array vacío");
                            } else {
                                console.log("Formato de respuesta inesperado de Beanstalk:", typeof beanstalkData);
                            }
                        } catch (jsonError) {
                            console.error("Error al procesar JSON de Beanstalk:", jsonError.message);
                        }
                    } else {
                        // Intentar leer el mensaje de error si es posible
                        try {
                            const errorText = await beanstalkResponse.text().catch(() => "No se pudo leer el texto de error");
                            console.log(`Error ${beanstalkResponse.status} al obtener blogs de Beanstalk. Detalle:`, 
                                errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''));
                        } catch (textError) {
                            console.log(`Error ${beanstalkResponse.status} al obtener blogs de Beanstalk`);
                        }
                    }
                } catch (beanstalkError) {
                    console.error("Error cargando blogs de AWS Beanstalk:", beanstalkError.message);
                }
                
                // 2. Si no hay blogs de AWS o hubo un error, intentar con alternativas - CONEXIÓN DIRECTA A ELASTIC BEANSTALK
                if (!hasAwsBlogs) {
                    // Intentar con un endpoint alternativo utilizando nuestro proxy-raw
                    try {
                        console.log("Intentando cargar blogs a través de proxy-raw...");
                        const directUrl = 'https://nextjs-gozamadrid-qrfk.onrender.com';
                        
                        // Utilizar el nuevo proxy-raw para evitar problemas de contenido mixto
                        const proxyResponse = await fetch('/api/proxy-raw', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                url: `${directUrl}/api/blogs`,
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                                    'User-Agent': 'GozaMadrid-Frontend/1.0',
                                    'Origin': 'https://www.realestategozamadrid.com'
                                },
                                timeout: 15000
                            }),
                            // Aumentar el timeout para evitar que la carga se quede en espera
                            signal: AbortSignal.timeout(20000) // 20 segundos para el fetch al proxy
                        }).catch(error => {
                            console.error("Error en fetch a proxy-raw:", error.message);
                            return { ok: false, status: 0, statusText: error.message };
                        });
                        
                        if (proxyResponse.ok) {
                            try {
                                const proxyData = await proxyResponse.json();
                                console.log("Respuesta del proxy-raw:", proxyData && Array.isArray(proxyData) ? 
                                    `Array con ${proxyData.length} elementos` : 
                                    `Tipo de datos: ${typeof proxyData}`);
                                    
                                if (proxyData && Array.isArray(proxyData) && proxyData.length > 0) {
                                    awsBlogs = proxyData;
                                    hasAwsBlogs = true;
                                    hasLoadedAnyBlogs = true; // Marcar que hemos cargado blogs
                                    console.log(`Obtenidos ${proxyData.length} blogs mediante proxy-raw`);
                                } else if (proxyData && Array.isArray(proxyData) && proxyData.length === 0) {
                                    console.log("El proxy-raw devolvió un array vacío");
                                } else {
                                    console.log("Formato de respuesta inesperado del proxy-raw:", typeof proxyData);
                                }
                            } catch (jsonError) {
                                console.error("Error al procesar JSON del proxy-raw:", jsonError.message);
                            }
                        } else {
                            // Intentar leer el mensaje de error si es posible
                            try {
                                const errorText = await proxyResponse.text().catch(() => "No se pudo leer el texto de error");
                                console.log(`Error ${proxyResponse.status} al obtener blogs mediante proxy-raw. Detalle:`, 
                                    errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''));
                            } catch (textError) {
                                console.log(`Error ${proxyResponse.status} al obtener blogs mediante proxy-raw`);
                            }
                        }
                    } catch (proxyError) {
                        console.error("Error al usar proxy-raw:", proxyError.message);
                    }
                }
                
                // 3. Procesar blogs de AWS si los obtuvimos
                if (hasAwsBlogs && awsBlogs.length > 0) {
                    awsBlogs.forEach(blog => {
                        const blogKey = blog.slug || blog._id;
                        
                        if (!seenPosts.has(blogKey)) {
                            // Procesar imagen para evitar problemas de mixed content
                            let blogImage = blog.image;
                            
                            // Si no tiene imagen principal pero tiene un array de imágenes, usar la primera
                            if (!blogImage && blog.images && Array.isArray(blog.images) && blog.images.length > 0) {
                                const firstImage = blog.images[0];
                                if (typeof firstImage === 'string') {
                                    blogImage = firstImage;
                                } else if (firstImage.src || firstImage.url) {
                                    blogImage = firstImage.src || firstImage.url;
                                }
                            }
                            
                            // Si tenemos una URL de imagen directa
                            if (typeof blogImage === 'string') {
                                // Asegurarnos de que la URL de la imagen sea segura (HTTPS)
                                if (blogImage.startsWith('http:')) {
                                    blogImage = blogImage.replace('http:', 'https:');
                                }
                                // Usar weserv.nl directamente para mejor rendimiento
                                blogImage = {
                                    src: `https://images.weserv.nl/?url=${encodeURIComponent(blogImage)}&n=-1`,
                                    alt: blog.title || 'Imagen del blog'
                                };
                            } 
                            // Si tenemos un objeto de imagen
                            else if (blogImage && typeof blogImage === 'object') {
                                if (blogImage.src) {
                                    let imgSrc = blogImage.src;
                                    if (imgSrc.startsWith('http:')) {
                                        imgSrc = imgSrc.replace('http:', 'https:');
                                    }
                                    blogImage = {
                                        src: `https://images.weserv.nl/?url=${encodeURIComponent(imgSrc)}&n=-1`,
                                        alt: blogImage.alt || blog.title || 'Imagen del blog'
                                    };
                                } else if (blogImage.url) {
                                    let imgUrl = blogImage.url;
                                    if (imgUrl.startsWith('http:')) {
                                        imgUrl = imgUrl.replace('http:', 'https:');
                                    }
                                    blogImage = {
                                        src: `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}&n=-1`,
                                        alt: blogImage.alt || blog.title || 'Imagen del blog'
                                    };
                                }
                            }
                            // Si no hay imagen, usar placeholder
                            else {
                                blogImage = {
                                    src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
                                    alt: blog.title || 'Imagen del blog'
                                };
                            }
                            
                            const processedBlog = {
                                ...blog,
                                _id: blog._id || `aws-${blog.id || Math.random().toString(36).substring(2)}`,
                                source: 'aws',
                                image: blogImage,
                                // Asegurar valores básicos para todos los blogs
                                title: blog.title || 'Sin título',
                                description: blog.description || blog.excerpt || 'Sin descripción',
                                content: blog.content || blog.description || '',
                                slug: blog.slug || `blog-${blog._id || blog.id || Math.random().toString(36).substring(2, 7)}`,
                                date: blog.date || blog.createdAt || new Date().toISOString(),
                                dateFormatted: new Date(blog.date || blog.createdAt || new Date()).toLocaleDateString('es-ES'),
                                author: blog.author || 'Equipo Goza Madrid',
                            };
                            
                            combinedBlogs.push(processedBlog);
                            seenPosts.set(blogKey, processedBlog);
                        }
                    });
                }
            } catch (allAwsError) {
                // Si hay algún error en todo el bloque de AWS, simplemente lo registramos y continuamos
                console.error("Error general obteniendo blogs de AWS:", allAwsError.message);
            }
            
            // Si no hemos podido obtener blogs de ninguna fuente, agregar blogs de muestra en desarrollo
            if (combinedBlogs.length === 0) {
                console.log("No se obtuvieron blogs de ninguna fuente. Agregando blogs de muestra.");
                
                const sampleBlogs = [
                    {
                        _id: 'sample1',
                        title: 'Cómo invertir en el mercado inmobiliario de Madrid en 2024',
                        description: 'Guía completa para inversores que buscan oportunidades en el mercado inmobiliario madrileño, con análisis de zonas y rentabilidades.',
                        content: '<p>Este es un artículo de muestra para desarrollo. Aquí iría el contenido completo del blog.</p>',
                        date: new Date().toISOString(),
                        dateFormatted: new Date().toLocaleDateString('es-ES'),
                        image: {
                            src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
                            alt: 'Inversión inmobiliaria en Madrid'
                        },
                        slug: 'invertir-mercado-inmobiliario-madrid',
                        source: 'sample',
                        author: 'Equipo Goza Madrid'
                    },
                    {
                        _id: 'sample2',
                        title: 'Los 5 barrios con mayor revalorización en Madrid',
                        description: 'Descubre cuáles son los barrios que más han crecido en valor en los últimos años y por qué son una excelente inversión.',
                        content: '<p>Este es un artículo de muestra para desarrollo. Aquí iría el contenido completo del blog.</p>',
                        date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
                        dateFormatted: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('es-ES'),
                        image: {
                            src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
                            alt: 'Barrios en Madrid'
                        },
                        slug: 'barrios-mayor-revalorizacion-madrid',
                        source: 'sample',
                        author: 'Equipo Goza Madrid'
                    }
                ];
                
                combinedBlogs.push(...sampleBlogs);
            }
            
            // Ordenar blogs por fecha (más recientes primero)
            combinedBlogs.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0);
                const dateB = new Date(b.date || b.createdAt || 0);
                return dateB - dateA;
            });
            
            console.log(`Total de blogs obtenidos: ${combinedBlogs.length}`);
            
            if (isMounted) {
                setBlogs(combinedBlogs);
                setLoading(false);
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
                
                // Manejar IDs de muestra sin hacer llamadas a la API
                if (strId.startsWith('sample')) {
                    const sampleBlog = blogs.find(blog => String(blog._id) === strId);
                    if (sampleBlog) {
                        setSelectedBlog(sampleBlog);
                        return;
                    }
                }
                
                if (strId.startsWith('wp-')) {
                    blogId = strId.substring(3);
                } else {
                    blogId = strId;
                }
                
                // Solo hacer llamada a la API si no es un ID de muestra
                if (!strId.startsWith('sample')) {
                    const data = await getBlogById(blogId);
                    
                    if (data) {
                        setSelectedBlog(data);
                    }
                }
            } catch (error) {
                try {
                    const fallbackBlog = blogs.find(blog => String(blog._id) === String(id));
                    if (fallbackBlog) {
                        setSelectedBlog(fallbackBlog);
                    }
                } catch (fbError) {
                    console.error("Error en fallback de blog:", fbError.message || "Error desconocido");
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
                console.error("Error al obtener blog inicial:", error.message || "Error desconocido");
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
                <link rel="canonical" href="https://www.realestategozamadrid.com/blog" />
                <meta property="og:title" content="Blog de Goza Madrid | Artículos y noticias inmobiliarias" />
                <meta property="og:description" content="Encuentra información valiosa sobre el mercado inmobiliario, consejos para comprar o vender tu propiedad, y las últimas tendencias del sector." />
                <meta property="og:url" content="https://www.realestategozamadrid.com/blog" />
                <meta property="og:type" content="website" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }}
                />
            </Head>
            {loading && <LoadingScreen />}
            <main className="relative py-8">
                <AnimatedOnScroll>
                    <div className="relative container mx-auto px-4">
                        {/* Indicador de carga */}
                        {loading ? (
                            <div role="status" aria-label="Cargando artículos del blog">
                                <LoadingScreen fullScreen={false} />
                            </div>
                        ) : (
                            /* Lista de blogs con semántica mejorada */
                            (<section aria-label="Listado de artículos del blog">
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
                                                                     fallbackSrc="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80"
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
                            </section>)
                         )}
                     </div>
                 </AnimatedOnScroll>
             </main>
        </>
    );
}