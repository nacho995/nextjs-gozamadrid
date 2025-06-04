"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from 'next/router';
import { getBlogPostBySlug } from '@/services/wpApi';
import { getBlogPosts, getBlogById } from '@/services/api';
import BlogImage from './BlogImage';

// Importar iconos individualmente en lugar de usar barrel imports
import { FaArrowLeft } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaShare } from "react-icons/fa";
import { FaTags } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

// Usar una imagen por defecto que sabemos que existe
const DEFAULT_IMAGE = process.env.NODE_ENV === 'production'
  ? 'https://realestategozamadrid.com/default-blog-image.jpg'
  : 'http://localhost:3003/default-blog-image.jpg';

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

const getImageSrc = (image, defaultImage) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  if (!image) {
    // console.log('No hay imagen, usando imagen por defecto:', defaultImage);
    return defaultImage;
  }
  
  // Para imágenes de WordPress, devolver la URL con proxy para evitar errores HTTP2_PROTOCOL_ERROR
  if (image._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    const wpImageUrl = image._embedded['wp:featuredmedia'][0].source_url;
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(wpImageUrl)}&default=https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`;
    // console.log('Imagen de WordPress (_embedded) con proxy:', { original: wpImageUrl, proxy: proxyUrl });
    return proxyUrl;
  }
  
  if (image.source_url) {
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(image.source_url)}&default=https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`;
    // console.log('Imagen de WordPress (source_url) con proxy:', { original: image.source_url, proxy: proxyUrl });
    return proxyUrl;
  }
  
  // Para imágenes de MongoDB como objeto
  if (typeof image === 'object') {
    if (image.src) {
      // Si la URL ya es absoluta, usarla directamente
      if (image.src.startsWith('http') || image.src.startsWith('https')) {
        // console.log('Imagen de MongoDB (objeto con src absoluta):', image.src);
        return image.src;
      }
      
      // Si la URL es relativa, construir la URL completa
      const imgSrc = `${API_URL}${image.src.startsWith('/') ? '' : '/'}${image.src}`;
      // console.log('Imagen de MongoDB (objeto con src relativa):', { original: image.src, processed: imgSrc });
      return imgSrc;
    }
    
    if (image.url) {
      // Si la URL ya es absoluta, usarla directamente
      if (image.url.startsWith('http') || image.url.startsWith('https')) {
        // console.log('Imagen de MongoDB (objeto con url absoluta):', image.url);
        return image.url;
      }
      
      // Si la URL es relativa, construir la URL completa
      const imgUrl = `${API_URL}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
      // console.log('Imagen de MongoDB (objeto con url relativa):', { original: image.url, processed: imgUrl });
      return imgUrl;
    }
  }
  
  // Si es una string
  if (typeof image === 'string') {
    // Si es una URL de WordPress, usar proxy
    if (image.includes('realestategozamadrid.com') || image.includes('gozamadrid.com') || image.includes('wp-content')) {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(image)}&default=https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`;
      // console.log('Imagen de WordPress (string) con proxy:', { original: image, proxy: proxyUrl });
      return proxyUrl;
    }
    
    // Si la URL ya es absoluta, usarla directamente
    if (image.startsWith('http') || image.startsWith('https')) {
      // console.log('Imagen con URL absoluta:', image);
      return image;
    }
    
    // Si la URL es relativa, construir la URL completa
    const imgStr = `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
    // console.log('Imagen con URL relativa:', { original: image, processed: imgStr });
    return imgStr;
  }
  
  // console.log('Tipo de imagen no reconocido, usando imagen por defecto:', { image, defaultImage });
  return defaultImage;
};

const processHTMLContent = (content, blogImages) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  if (!content) return '';
  
  let processedContent = content;
  
  // Primero, eliminar atributos srcset y sizes que pueden causar problemas
  processedContent = processedContent.replace(/srcset="[^"]*"/gi, '');
  processedContent = processedContent.replace(/sizes="[^"]*"/gi, '');
  
  // Eliminar atributos width y height fijos que pueden romper el diseño responsive
  processedContent = processedContent.replace(/width="[^"]*"/gi, '');
  processedContent = processedContent.replace(/height="[^"]*"/gi, '');
  
  // Procesar las imágenes en el contenido HTML
  processedContent = processedContent.replace(
    /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
    (match, before, src, after) => {
      // Eliminar referencias a imageproxy
      if (src.includes('imageproxy/')) {
        // Extraer el alt si existe
        const altMatch = match.match(/alt="([^"]*)"/);
        const alt = altMatch ? altMatch[1] : '';
        
        // Usar una imagen por defecto
        return `<div class="w-full rounded-lg shadow-lg my-8 bg-gray-200 flex items-center justify-center h-64"><span class="text-gray-500">Imagen no disponible</span></div>`;
      }
      
      // Extraer el alt si existe
      const altMatch = match.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : '';
      
      // Si es una imagen de WordPress, usar proxy
      if (src.includes('realestategozamadrid.com') || 
          src.includes('gozamadrid.com') ||
          src.includes('wp-content') ||
          before.includes('wp-image')) {
        
        // Usar un proxy de imágenes para evitar errores HTTP2_PROTOCOL_ERROR
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&default=https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`;
        
        // Devolver una etiqueta de imagen simplificada
        return `<img src="${proxyUrl}" alt="${alt}" loading="lazy" class="w-full rounded-lg shadow-md my-4 object-contain" />`;
      }
      
      // Para imágenes con URL absoluta
      if (src.startsWith('http') || src.startsWith('https')) {
        // Devolver una etiqueta de imagen simplificada
        return `<img src="${src}" alt="${alt}" loading="lazy" class="w-full rounded-lg shadow-md my-4 object-contain" />`;
      }
      
      // Para imágenes con URL relativa (MongoDB)
      const fullSrc = `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
      
      // Devolver una etiqueta de imagen simplificada
      return `<img src="${fullSrc}" alt="${alt}" loading="lazy" class="w-full rounded-lg shadow-md my-4 object-contain" />`;
    }
  );
  
  // Procesar párrafos que contienen solo imágenes para evitar problemas de visualización
  processedContent = processedContent.replace(
    /<p>\s*(<img[^>]*>)\s*<\/p>/gi,
    (match, imgTag) => {
      // Reemplazar el párrafo con la imagen directamente
      return `<div class="my-4">${imgTag}</div>`;
    }
  );
  
  // Procesar párrafos vacíos
  processedContent = processedContent.replace(/<p>\s*<\/p>/gi, '');
  
  return processedContent;
};

// Mejorar la función cleanSpecificProblems para eliminar la imagen problemática
const cleanSpecificProblems = (content) => {
  if (!content) return '';
  
  let cleanedContent = content;
  
  // Eliminar estilos inline excesivos
  cleanedContent = cleanedContent.replace(/style="[^"]*"/gi, 'style="max-width: 100%;"');
  
  // Eliminar clases de WordPress que pueden causar problemas
  cleanedContent = cleanedContent.replace(/class="alignnone[^"]*"/gi, 'class="w-full my-4"');
  cleanedContent = cleanedContent.replace(/class="aligncenter[^"]*"/gi, 'class="w-full my-4 mx-auto"');
  cleanedContent = cleanedContent.replace(/class="alignleft[^"]*"/gi, 'class="float-left mr-4 mb-4"');
  cleanedContent = cleanedContent.replace(/class="alignright[^"]*"/gi, 'class="float-right ml-4 mb-4"');
  
  // Eliminar atributos width y height fijos que pueden romper el diseño responsive
  cleanedContent = cleanedContent.replace(/width="[^"]*"/gi, '');
  cleanedContent = cleanedContent.replace(/height="[^"]*"/gi, '');
  
  // Manejar párrafos con múltiples imágenes
  cleanedContent = cleanedContent.replace(
    /<p>(\s*<img[^>]*>\s*){2,}<\/p>/gi,
    (match) => {
      // Extraer todas las etiquetas de imagen
      const imgTags = match.match(/<img[^>]*>/gi) || [];
      
      // Crear un div con grid para mostrar las imágenes en una cuadrícula
      return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">${imgTags.join('')}</div>`;
    }
  );
  
  // Eliminar elementos de compartir y otros elementos innecesarios
  cleanedContent = cleanedContent.replace(
    /<div[^>]*class="[^"]*sharedaddy[^"]*"[^>]*>[\s\S]*?<\/div>/gi, 
    ''
  );
  
  cleanedContent = cleanedContent.replace(
    /<div[^>]*class="[^"]*share-buttons[^"]*"[^>]*>[\s\S]*?<\/div>/gi, 
    ''
  );
  
  return cleanedContent;
};

const ShareButtons = ({ url, title, description }) => {
  const fullUrl = url && url.startsWith('http') ? url : typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title || 'Artículo interesante de Goza Madrid');
  const encodedDescription = encodeURIComponent(description || 'Descubre más sobre el mercado inmobiliario en Madrid');

  const handleShare = async (e) => {
    e.preventDefault();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Artículo de Goza Madrid',
          text: description || 'Descubre más sobre el mercado inmobiliario en Madrid',
          url: fullUrl
        });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };
  
  return (
    <div role="region" aria-label="Compartir en redes sociales">
      <h3 className="text-sm uppercase text-gray-500 mb-4 font-semibold tracking-wider">
        Comparte este artículo:
      </h3>
      <div className="flex gap-3">
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            // Garantiza que el enlace se abra en una ventana nueva con dimensiones específicas
            e.preventDefault();
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
              'facebook-share-dialog',
              'width=626,height=436'
            );
          }}
        >
          <FaFacebook />
        </a>
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en Twitter"
          className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
              'twitter-share-dialog',
              'width=550,height=420'
            );
          }}
        >
          <FaTwitter />
        </a>
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en LinkedIn"
          className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
              'linkedin-share-dialog',
              'width=750,height=600'
            );
          }}
        >
          <FaLinkedin />
        </a>
        <a 
          href="#"
          aria-label="Compartir con otras aplicaciones"
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={handleShare}
        >
          <FaShare />
        </a>
      </div>
    </div>
  );
};

const BlogContent = ({ slug }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const source = router.query.source;

  // Efecto para detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Efecto para cargar los datos del blog
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // console.log(`Obteniendo blog con slug: ${slug}`);
        
        // Si el source es wordpress, buscar por slug
        if (source === 'wordpress') {
          // console.log('Buscando blog de WordPress por slug');
          
          try {
            // Intentar obtener el blog directamente de la API de WordPress
            const blogData = await getBlogPostBySlug(slug);
            
            if (blogData) {
              // console.log('Blog de WordPress encontrado por slug');
              
              // Aplicar limpieza y procesamiento al contenido
              const cleanedContent = cleanSpecificProblems(blogData.content?.rendered || blogData.content || '');
              const processedContent = processHTMLContent(cleanedContent);
              
              // Procesar la imagen destacada si viene de WordPress
              if (!blogData.image && blogData._embedded?.['wp:featuredmedia']?.[0]) {
                const media = blogData._embedded['wp:featuredmedia'][0];
                blogData.image = {
                  src: media.source_url,
                  alt: blogData.title?.rendered || "Imagen del blog"
                };
              }
              
              setBlog({
                ...blogData,
                content: processedContent,
                title: blogData.title?.rendered || blogData.title,
                excerpt: blogData.excerpt?.rendered || blogData.excerpt,
                source: 'wordpress'
              });
            } else {
              // Si no se encuentra, intentar con getBlogPosts
              const allBlogs = await getBlogPosts();
              const wpBlog = allBlogs.find(b => b.source === 'wordpress' && b.slug === slug);
              
              if (wpBlog) {
                // Obtener los datos completos del blog
                const fullBlog = await getBlogById(wpBlog.id);
                
                if (fullBlog) {
                  // Aplicar limpieza y procesamiento al contenido
                  const cleanedContent = cleanSpecificProblems(fullBlog.content);
                  const processedContent = processHTMLContent(cleanedContent);
                  
                  setBlog({
                    ...fullBlog,
                    content: processedContent
                  });
                } else {
                  setBlog(wpBlog);
                }
              } else {
                console.error('Blog de WordPress no encontrado por slug');
                setError('Blog no encontrado');
              }
            }
          } catch (wpError) {
            console.error('Error al obtener blog de WordPress:', wpError);
            
            // Si falla, intentar con getBlogPosts
            const allBlogs = await getBlogPosts();
            const wpBlog = allBlogs.find(b => b.source === 'wordpress' && b.slug === slug);
            
            if (wpBlog) {
              // Obtener los datos completos del blog
              const fullBlog = await getBlogById(wpBlog.id);
              
              if (fullBlog) {
                // Aplicar limpieza y procesamiento al contenido
                const cleanedContent = cleanSpecificProblems(fullBlog.content);
                const processedContent = processHTMLContent(cleanedContent);
                
                setBlog({
                  ...fullBlog,
                  content: processedContent
                });
              } else {
                setBlog(wpBlog);
              }
            } else {
              console.error('Blog de WordPress no encontrado por slug');
              setError('Blog no encontrado');
            }
          }
        } else {
          // Intentar obtener por ID de MongoDB
          // console.log('Buscando blog por ID de MongoDB');
          
          try {
            const data = await getBlogById(slug);
            
            if (data) {
              // console.log('Blog encontrado por ID');
              
              // Aplicar limpieza y procesamiento al contenido
              const cleanedContent = cleanSpecificProblems(data.content);
              const processedContent = processHTMLContent(cleanedContent);
              
              setBlog({
                ...data,
                content: processedContent
              });
            } else {
              console.error('Blog no encontrado por ID');
              setError('Blog no encontrado');
            }
          } catch (idError) {
            console.error('Error al obtener blog por ID:', idError);
            
            // Si falla, intentar buscar por slug en todos los blogs
            // console.log('Intentando buscar por slug en todos los blogs');
            
            const allBlogs = await getBlogPosts();
            const foundBlog = allBlogs.find(b => b.slug === slug);
            
            if (foundBlog) {
              // console.log('Blog encontrado por slug');
              
              // Aplicar limpieza y procesamiento al contenido
              const cleanedContent = cleanSpecificProblems(foundBlog.content);
              const processedContent = processHTMLContent(cleanedContent);
              
              setBlog({
                ...foundBlog,
                content: processedContent
              });
            } else {
              console.error('Blog no encontrado por slug');
              setError('Blog no encontrado');
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener blog:', error);
        setError('Error al cargar el blog');
      } finally {
        setLoading(false);
      }
    };
    
    if (isClient && slug) {
      fetchBlogData();
    }
  }, [slug, source, isClient]);
  
  useEffect(() => {
    if (blog) {
      // console.log('Datos del blog recibidos:', blog);
      // console.log('Content:', blog.content);
      // console.log('ReadTime:', blog.readTime);
    }
  }, [blog]);
  
  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center" role="status" aria-label="Cargando artículo">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-20 text-center" role="alert">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Artículo no encontrado</h2>
        <p className="text-gray-600 mb-6">El artículo que buscas no está disponible o ha sido eliminado.</p>
        <Link href="/blog" className="inline-flex items-center px-5 py-2 bg-amarillo text-white rounded-full hover:bg-amarillo/80 transition-colors">
          <FaArrowLeft className="mr-2" /> Volver a todos los blogs
        </Link>
      </div>
    );
  }
  
  if (!blog) {
    return <div className="container mx-auto p-8" role="alert">No se encontró el blog</div>;
  }
  
  const {
    title,
    content: rawContent,
    image,
    images,
    date,
    author = "Equipo Goza Madrid",
    category = "Inmobiliaria",
    tags = [],
    excerpt,
    readTime: blogReadTime,
  } = blog || {};

  // Asegurar que content y readTime estén disponibles
  const content = rawContent || (blog && blog.content) || blog.description || '';
  const readTime = blogReadTime || (blog && blog.readTime) || '';

  // Añadir log para verificar
  // console.log('Content procesado:', content);
  // console.log('ReadTime procesado:', readTime);

  // Procesar la imagen principal usando la función getImageSrc modificada
  const imageSrc = getImageSrc(image || images, DEFAULT_IMAGE);

  const titleText = typeof title === 'object' ? title.rendered : title;
  const excerptText = typeof excerpt === 'object' ? excerpt.rendered : excerpt;

  // Procesar el contenido HTML solo cuando tengamos los datos necesarios
  const processedContent = typeof content === 'object' 
    ? processHTMLContent(content.rendered, images) 
    : processHTMLContent(content || '<p>No hay contenido disponible para este blog.</p>', images);

  return (
    <>
      <Head>
        <title>{`${titleText} | Blog de Goza Madrid`}</title>
        <meta name="description" content={excerptText?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Artículo del blog de Goza Madrid sobre el mercado inmobiliario'} />
        <meta name="keywords" content={`${category}, ${tags.join(', ')}, inmobiliaria madrid, mercado inmobiliario, propiedades madrid`} />
        <meta property="og:title" content={titleText} />
        <meta property="og:description" content={excerptText?.replace(/<[^>]*>/g, '').slice(0, 160)} />
        <meta property="og:image" content={imageSrc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titleText} />
        <meta name="twitter:description" content={excerptText?.replace(/<[^>]*>/g, '').slice(0, 160)} />
        <meta name="twitter:image" content={imageSrc} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": titleText,
            "image": imageSrc,
            "datePublished": date,
            "author": {
              "@type": "Organization",
              "name": author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Goza Madrid",
              "logo": {
                "@type": "ImageObject",
                "url": "https://realestategozamadrid.com/logo.png"
              }
            },
            "description": excerptText?.replace(/<[^>]*>/g, '').slice(0, 160),
            "articleBody": content?.replace(/<[^>]*>/g, ''),
            "keywords": `${category}, ${tags.join(', ')}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            }
          })}
        </script>
      </Head>
      <article 
        className="max-w-4xl mx-auto px-4 py-8"
        itemScope 
        itemType="https://schema.org/BlogPosting"
      >
        {/* Añadir un decorador visual en la parte superior */}
        <div className="mb-12 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amarillo to-transparent"></div>
        </div>
        
        {/* Botón de regreso con diseño mejorado */}
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors">
            <FaArrowLeft className="mr-2 text-amarillo" /> Volver a blogs
          </Link>
        </div>

        {/* Encabezado con diseño mejorado */}
        <header className="mb-12 relative">
          {/* Imagen destacada con overlay de textura */}
          {imageSrc && (
            <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-2xl mb-12">
              <BlogImage 
                src={imageSrc}
                alt={typeof title === 'object' ? title.rendered : title}
                className="object-cover"
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent mix-blend-multiply"></div>
              
              {/* Patrón de textura sutil */}
              <div className="absolute inset-0 bg-[url('/img/texture-pattern.png')] opacity-10"></div>
              
              {/* Título sobre la imagen */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                  {typeof title === 'object' ? title.rendered : title}
                </h1>
                
                {/* Metadatos sobre la imagen */}
                <div className="flex flex-wrap gap-4 text-sm text-white/90 mb-2">
                  {date && (
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-amarillo" />
                      <span>{date}</span>
                    </div>
                  )}
                  {author && (
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-amarillo" />
                      <span>{author}</span>
                    </div>
                  )}
                  {category && (
                    <div className="flex items-center">
                      <FaTags className="mr-2 text-amarillo" />
                      <span>{category}</span>
                    </div>
                  )}
                  {readTime && (
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-amarillo" />
                      <span>{readTime} min de lectura</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Si no hay imagen, mostrar título normal */}
          {!imageSrc && (
            <>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {typeof title === 'object' ? title.rendered : title}
              </h1>
              
              {/* Metadatos */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {date && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-amarillo" />
                    <span>{date}</span>
                  </div>
                )}
                {author && (
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-amarillo" />
                    <span>{author}</span>
                  </div>
                )}
                {category && (
                  <div className="flex items-center">
                    <FaTags className="mr-2 text-amarillo" />
                    <span>{category}</span>
                  </div>
                )}
                {readTime && (
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-amarillo" />
                    <span>{readTime} min de lectura</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Extracto mejorado con efecto visual */}
          {excerpt && (
            <div className="relative bg-amarillo/10 border-l-4 border-amarillo p-6 mb-8 text-lg italic rounded-r-xl">
              {/* Comillas decorativas */}
              <div className="absolute -top-6 -left-2 text-8xl text-amarillo/20 font-serif">&ldquo;</div>
              <div dangerouslySetInnerHTML={{
                __html: typeof excerpt === 'object' 
                  ? cleanSpecificProblems(excerpt.rendered) 
                  : cleanSpecificProblems(excerpt)
              }} />
              <div className="absolute -bottom-12 -right-2 text-8xl text-amarillo/20 font-serif">&rdquo;</div>
            </div>
          )}
        </header>

        {/* Contenido principal con estilos Tailwind */}
        <div 
          className="
            prose prose-lg max-w-none mb-16
            
            prose-p:mb-6 prose-p:text-gray-700 prose-p:leading-relaxed
            
            first-letter:float-left first-letter:text-6xl first-letter:font-bold 
            first-letter:mr-3 first-letter:text-amarillo first-letter:mt-0
            
            prose-headings:font-bold prose-headings:text-gray-900
            
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 
            prose-h2:border-b-2 prose-h2:border-amarillo/30 prose-h2:w-fit
            
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-h3:bg-amarillo/10 prose-h3:inline-block 
            prose-h3:px-3 prose-h3:py-1 prose-h3:rounded-md
            
            prose-img:rounded-xl prose-img:shadow-lg hover:prose-img:shadow-xl 
            prose-img:transition-all prose-img:mx-auto prose-img:my-8
            hover:prose-img:-translate-y-1
            
            prose-blockquote:bg-amber-50 prose-blockquote:border-l-4 
            prose-blockquote:border-amarillo prose-blockquote:p-4 
            prose-blockquote:rounded-r-lg prose-blockquote:my-8
            prose-blockquote:prose-p:italic prose-blockquote:prose-p:text-gray-700
            
            prose-a:text-amarillo prose-a:font-medium prose-a:no-underline
            hover:prose-a:text-white hover:prose-a:bg-amarillo
            prose-a:transition-colors prose-a:relative prose-a:px-1
            
            prose-li:mb-2 prose-ul:my-6 prose-ol:my-6
            prose-ul:list-disc prose-ol:list-decimal
            
            prose-strong:font-bold prose-strong:text-gray-900
            prose-strong:bg-amarillo/10 prose-strong:px-1 prose-strong:rounded
            
            prose-hr:border-none prose-hr:h-px prose-hr:bg-gradient-to-r
            prose-hr:from-transparent prose-hr:via-amarillo/50 prose-hr:to-transparent
            prose-hr:my-12
            
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 
            prose-code:rounded prose-code:text-sm
            
            sm:prose-p:text-base sm:prose-h2:text-xl sm:prose-h3:text-lg"
          dangerouslySetInnerHTML={{
            __html: processedContent
          }}
        />

        {/* Footer del artículo mejorado */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          
          {/* Separador decorativo */}
          <div className="w-full flex justify-center my-8">
            <div className="flex items-center w-full max-w-md">
              <div className="h-[1px] flex-grow bg-gray-200"></div>
              <div className="mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="h-[1px] flex-grow bg-gray-200"></div>
            </div>
          </div>

          {/* Compartir en redes sociales mejorado */}
          <ShareButtons url={window.location.href} title={titleText} description={excerptText} />
          
          {/* Sección "Artículos relacionados" - esto sería ideal si tienes la información */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">También podría interesarte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/blog" className="group block">
                <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow p-4 h-full flex flex-col">
                  <h4 className="font-bold mb-2 group-hover:text-amarillo transition-colors">Explora más artículos</h4>
                  <p className="text-sm text-gray-500 mb-2">Descubre todos nuestros contenidos sobre inmobiliaria, inversiones y tendencias del mercado.</p>
                  <span className="mt-auto text-amarillo text-sm font-medium flex items-center">
                    Ver más artículos
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </Link>
              
              <Link href="/contacto" className="group block">
                <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow p-4 h-full flex flex-col">
                  <h4 className="font-bold mb-2 group-hover:text-amarillo transition-colors">¿Necesitas asesoramiento?</h4>
                  <p className="text-sm text-gray-500 mb-2">Nuestro equipo de expertos inmobiliarios está listo para ayudarte con cualquier consulta.</p>
                  <span className="mt-auto text-amarillo text-sm font-medium flex items-center">
                    Contactar ahora
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </footer>
        
        {/* Decorador final */}
        <div className="mt-16 flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amarillo to-transparent"></div>
        </div>
      </article>
    </>
  );
};

export default BlogContent; 