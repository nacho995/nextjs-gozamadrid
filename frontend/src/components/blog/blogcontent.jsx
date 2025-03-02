import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaUser, FaTags, FaArrowLeft, FaShare, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBlogPostBySlug } from '@/services/wpApi';
import DirectImage from '../DirectImage';
import styles from './blogcontent.module.css';

// Usar una imagen local en lugar de placeholder.com
const DEFAULT_IMAGE = '/img/default-image.jpg';

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

const processHTMLContent = (content) => {
  if (!content) return '';
  
  // Obtén el dominio de WordPress para usarlo en las imágenes
  const wpDomain = 'https://realestategozamadrid.com';
  
  // Paso 1: Eliminar todas las imágenes conocidas como problemáticas
  let processedContent = content.replace(
    /<img[^>]*class="[^"]*wp-image-3397[^"]*"[^>]*>/gi,
    '' // Eliminar específicamente la imagen con ID 3397 (la que está causando problemas)
  );
  
  // Eliminar imágenes sin src o con src vacío
  processedContent = processedContent.replace(
    /<img[^>]*src\s*=\s*["']?\s*["']?[^>]*>/gi,
    (match) => {
      if (match.includes('src=""') || !match.includes('src=')) {
        console.log('BlogContent: Eliminando imagen sin src:', match);
        return ''; // Eliminar imagen problemática
      }
      return match; // Mantener imágenes con src
    }
  );
  
  // Paso 2: Reemplazar rutas relativas por absolutas para imágenes restantes
  processedContent = processedContent.replace(
    /<img([^>]*)src="([^"]*)"([^>]*)>/gi,
    (match, before, src, after) => {
      // Si la URL está vacía o es problemática, usar imagen de placeholder
      if (!src || src === '' || src === '#') {
        return ''; // En lugar de reemplazar, eliminar estas imágenes
      }
      
      // Si ya es una URL absoluta o una data URI, dejarla como está
      if (src.startsWith('http') || src.startsWith('data:')) {
        return match;
      }
      
      // Convertir URLs relativas a absolutas
      let absoluteSrc = src;
      if (src.startsWith('/')) {
        absoluteSrc = `${wpDomain}${src}`;
      } else {
        absoluteSrc = `${wpDomain}/${src}`;
      }
      
      console.log(`BlogContent: Convertida imagen relativa '${src}' a absoluta: '${absoluteSrc}'`);
      return `<img${before}src="${absoluteSrc}"${after}>`;
    }
  );
  
  // Paso 3: Asegurarse de que las imágenes tengan los atributos necesarios para un buen rendimiento
  processedContent = processedContent.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Verificar que no sean imágenes que deberían eliminarse
      if (attributes.includes('kitchen-living-room-4043091_1280.jpg')) {
        // Esta es la imagen problemática específica
        return '';
      }
      
      // Añadir el atributo loading="lazy" si no está presente
      if (!attributes.includes('loading=')) {
        attributes += ' loading="lazy"';
      }
      
      // Añadir el atributo de manejo de errores
      if (!attributes.includes('onerror=')) {
        attributes += ` onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'; this.style.maxHeight='300px';"`;
      }
      
      return `<img${attributes}>`;
    }
  );
  
  // Paso 4: Eliminar cualquier estructura de HTML inválida o huérfana
  processedContent = processedContent
    .replace(/<figure[^>]*>\s*<\/figure>/gi, '') // Eliminar elementos figure vacíos
    .replace(/<p[^>]*>\s*<\/p>/gi, ''); // Eliminar párrafos vacíos
  
  // Nuevo paso: Añadir clases adicionales a ciertos párrafos para crear variedad visual
  let paragraphCount = 0;
  processedContent = processedContent.replace(
    /<p([^>]*)>([\s\S]*?)<\/p>/gi,
    (match, attributes, content) => {
      paragraphCount++;
      
      // Cada cuarto párrafo tendrá un estilo destacado con borde izquierdo
      if (paragraphCount % 4 === 2) {
        return `<p${attributes} class="ml-4 pl-4 border-l-4 border-amber-500 italic">${content}</p>`;
      }
      
      // Cada quinto párrafo tendrá texto más grande y destacado
      if (paragraphCount % 5 === 0) {
        return `<p${attributes} class="text-lg font-medium text-gray-800">${content}</p>`;
      }
      
      // Cada séptimo párrafo tendrá un fondo
      if (paragraphCount % 7 === 0) {
        return `<p${attributes} class="p-4 rounded-lg border-l-4 border-amber-500">${content}</p>`;
      }
      
      return match;
    }
  );
  
  // Mejorar los headings
  processedContent = processedContent.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    '<h2$1><span class="relative inline-block pb-2 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-transparent after:rounded-full">$2</span></h2>'
  );
  
  // Mejorar las imágenes
  processedContent = processedContent.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Si ya procesamos esta imagen o debemos eliminarla, retornar como está
      if (attributes.includes('kitchen-living-room-4043091_1280.jpg') || 
          attributes.includes('class="ml-4') || 
          attributes.includes('class="float-')) {
        return match;
      }
      
      // Alternar entre float-left y float-right para las imágenes
      const floatClass = paragraphCount % 2 === 0 ? 
        'class="float-right ml-6 mb-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl max-w-[40%]"' : 
        'class="float-left mr-6 mb-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl max-w-[40%]"';
      
      // Reemplazar o añadir la clase
      if (attributes.includes('class="')) {
        return match.replace(/class="([^"]*)"/i, floatClass);
      } else {
        return `<img ${floatClass} ${attributes}>`;
      }
    }
  );
  
  return processedContent;
};

// Mejorar la función cleanSpecificProblems para eliminar la imagen problemática
const cleanSpecificProblems = (content) => {
  if (!content) return '';
  
  // Eliminar imágenes de compartir y otros elementos innecesarios
  let cleaned = content;
  
  // Regla específica para eliminar la imagen problemática
  cleaned = cleaned.replace(
    /<img[^>]*kitchen-living-room-4043091_1280[^>]*>/gi,
    ''
  );
  
  // Regla específica para eliminar imágenes con clase wp-image-3397
  cleaned = cleaned.replace(
    /<img[^>]*class="[^"]*wp-image-3397[^"]*"[^>]*>/gi,
    ''
  );
  
  // Eliminar imágenes con atributo width="1280" height="1280" (específico del problema)
  cleaned = cleaned.replace(
    /<img[^>]*width="1280"[^>]*height="1280"[^>]*>/gi, 
    ''
  );
  
  // Eliminar imágenes con srcset que incluyen building-8159002_1280 (muy específico)
  cleaned = cleaned.replace(
    /<img[^>]*srcset="[^"]*building-8159002_1280[^"]*"[^>]*>/gi,
    ''
  );
  
  // Eliminar bloques div que contienen únicamente una imagen de WordPress
  cleaned = cleaned.replace(
    /<div[^>]*>\s*<img[^>]*class="[^"]*wp-image-\d+[^"]*"[^>]*>\s*<\/div>/gi,
    ''
  );
  
  // Eliminar las reglas anteriores
  cleaned = cleaned.replace(
    /<div[^>]*class="[^"]*sharedaddy[^"]*"[^>]*>[\s\S]*?<\/div>/gi, 
    ''
  );
  
  cleaned = cleaned.replace(
    /<div[^>]*class="[^"]*share-buttons[^"]*"[^>]*>[\s\S]*?<\/div>/gi, 
    ''
  );
  
  cleaned = cleaned.replace(
    /<figure[^>]*>(?:\s*<figcaption[^>]*>.*?<\/figcaption>\s*)?<\/figure>/gi,
    ''
  );
  
  return cleaned;
};

const ShareButtons = ({ url, title }) => {
  // Asegurarse de que tenemos una URL completa, no solo relativa
  const fullUrl = url && url.startsWith('http') ? url : typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title || 'Artículo interesante de Goza Madrid');
  
  // URLs para compartir en cada red social
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
  };
  
  // Función para manejar el compartir en caso de que la API de compartir esté disponible
  const handleShare = (e) => {
    e.preventDefault();
    
    if (navigator.share) {
      navigator.share({
        title: title || 'Artículo de Goza Madrid',
        text: 'Mira este artículo interesante',
        url: fullUrl
      })
      .catch(err => console.error('Error al compartir:', err));
    } else {
      // Si Web Share API no está disponible, abrir WhatsApp
      window.open(shareUrls.whatsapp, '_blank');
    }
  };
  
  return (
    <div>
      <h3 className="text-sm uppercase text-gray-500 mb-4 font-semibold tracking-wider">Comparte este artículo:</h3>
      <div className="flex gap-3">
        <a 
          href={shareUrls.facebook}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            // Abrir en ventana emergente para evitar bloqueos
            const width = 626;
            const height = 436;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(
              shareUrls.facebook,
              'facebook-share-dialog',
              `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,directories=0,scrollbars=0`
            );
          }}
        >
          <FaFacebook />
        </a>
        <a 
          href={shareUrls.twitter}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en Twitter"
          className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const width = 550;
            const height = 420;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(
              shareUrls.twitter,
              'twitter-share-dialog',
              `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,directories=0,scrollbars=0`
            );
          }}
        >
          <FaTwitter />
        </a>
        <a 
          href={shareUrls.linkedin}
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Compartir en LinkedIn"
          className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-all hover:scale-110 shadow-md hover:shadow-lg cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const width = 750;
            const height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(
              shareUrls.linkedin,
              'linkedin-share-dialog',
              `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,directories=0,scrollbars=0`
            );
          }}
        >
          <FaLinkedin />
        </a>
        <a 
          href={shareUrls.whatsapp}
          aria-label="Compartir por WhatsApp u otras aplicaciones"
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
  const router = useRouter();
  const [blogUrl, setBlogUrl] = useState('');
  
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        if (!slug) {
          throw new Error('Slug no proporcionado');
        }
        
        console.log('BlogContent: Obteniendo blog con slug:', slug);
        setLoading(true);
        
        // Obtener el blog de WordPress usando el slug
        const blogData = await getBlogPostBySlug(slug);
        
        if (!blogData) {
          throw new Error('Blog no encontrado');
        }
        
        console.log('BlogContent: Blog cargado correctamente. ID:', blogData.id, 'Título:', blogData.title?.rendered);
        
        // Añadir este log para depurar la imagen recibida
        if (blogData) {
          console.log('BlogContent: Datos de imagen:', {
            imageUrl: blogData.imageUrl,
            imageSrc: blogData.image?.src,
            featuredMedia: blogData._embedded?.['wp:featuredmedia']?.[0]?.source_url
          });
          
          // Asegurarse de que blog.image está correctamente definido
          if (!blogData.image && blogData._embedded?.['wp:featuredmedia']?.[0]) {
            const media = blogData._embedded['wp:featuredmedia'][0];
            blogData.image = {
              src: media.source_url,
              alt: blogData.title?.rendered || "Imagen del blog"
            };
          }
        }
        
        setBlog(blogData);
      } catch (err) {
        console.error('Error obteniendo el blog:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      console.log('BlogContent: Slug disponible, iniciando fetch:', slug);
      fetchBlogData();
    } else {
      console.error('BlogContent: No se proporcionó un slug válido');
      setError('No se proporcionó un identificador para el blog');
    }
  }, [slug]);
  
  useEffect(() => {
    // Obtener la URL actual del navegador cuando el componente está en el cliente
    if (typeof window !== 'undefined') {
      // Asegúrate de capturar la URL completa incluyendo protocolo, dominio y ruta
      setBlogUrl(window.location.href);
      console.log("URL actual compartible:", window.location.href);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-20 text-center">
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
    return <div className="container mx-auto p-8">No se encontró el blog</div>;
  }
  
  const {
    title,
    content,
    image,
    date,
    author = "Equipo Goza Madrid",
    category = "Inmobiliaria",
    tags = [],
    excerpt,
  } = blog;

  const imageSrc = typeof image === 'string' 
    ? image 
    : (image?.src || '/img/default-image.jpg');

  return (
    <article className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-xl shadow-xl max-w-4xl">
      <header className="mb-10">
        {/* Botón volver con soporte dark mode */}
        <Link href="/blog" className="inline-flex items-center mb-6 text-gray-600 dark:text-gray-300 hover:text-amarillo dark:hover:text-amarillo transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Volver al blog</span>
        </Link>
        
        {/* Título con soporte dark mode */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
          {typeof title === 'object' ? title.rendered : title}
        </h1>
        
        {/* Metadatos con soporte dark mode */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
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
        </div>

        {/* Extracto mejorado con soporte dark mode */}
        {excerpt && (
          <div className="relative bg-amarillo/10 dark:bg-amarillo/20 border-l-4 border-amarillo p-6 mb-8 text-lg italic rounded-r-xl text-gray-700 dark:text-gray-200">
            {/* Comillas decorativas */}
            <div className="absolute -top-6 -left-2 text-8xl text-amarillo/20 font-serif">"</div>
            <div dangerouslySetInnerHTML={{
              __html: typeof excerpt === 'object' 
                ? cleanSpecificProblems(excerpt.rendered) 
                : cleanSpecificProblems(excerpt)
            }} className="relative z-10" />
          </div>
        )}
      </header>

      {/* Contenido principal con soporte para dark mode */}
      <div 
        className="
          prose prose-lg max-w-none mb-16
          
          prose-p:mb-6 prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-p:leading-relaxed
          
          first-letter:float-left first-letter:text-6xl first-letter:font-bold 
          first-letter:mr-3 first-letter:text-amarillo first-letter:mt-0
          
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 
          prose-h2:border-b-2 prose-h2:border-amarillo/30 prose-h2:w-fit
          
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-h3:bg-amarillo/10 dark:prose-h3:bg-amarillo/20 prose-h3:inline-block 
          prose-h3:px-3 prose-h3:py-1 prose-h3:rounded-md
          
          prose-img:rounded-xl prose-img:shadow-lg hover:prose-img:shadow-xl 
          prose-img:transition-all prose-img:mx-auto prose-img:my-8
          hover:prose-img:-translate-y-1
          
          prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20 prose-blockquote:border-l-4 
          prose-blockquote:border-amarillo prose-blockquote:p-4 
          prose-blockquote:rounded-r-lg prose-blockquote:my-8
          prose-blockquote:prose-p:italic prose-blockquote:prose-p:text-gray-700 dark:prose-blockquote:prose-p:text-gray-200
          
          prose-a:text-amarillo prose-a:font-medium prose-a:no-underline
          hover:prose-a:text-white hover:prose-a:bg-amarillo
          prose-a:transition-colors prose-a:relative prose-a:px-1
          
          prose-li:mb-2 prose-ul:my-6 prose-ol:my-6
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-gray-700 dark:prose-li:text-gray-200
          
          prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-strong:bg-amarillo/10 dark:prose-strong:bg-amarillo/20 prose-strong:px-1 prose-strong:rounded
          
          prose-hr:border-none prose-hr:h-px prose-hr:bg-gradient-to-r
          prose-hr:from-transparent prose-hr:via-amarillo/50 prose-hr:to-transparent
          prose-hr:my-12
          
          prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 
          prose-code:rounded prose-code:text-sm dark:prose-code:text-gray-200
          
          sm:prose-p:text-base sm:prose-h2:text-xl sm:prose-h3:text-lg"
        dangerouslySetInnerHTML={{
          __html: typeof content === 'object' ? processHTMLContent(content.rendered) : processHTMLContent(content)
        }}
      />

      {/* Footer del artículo con soporte dark mode */}
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        {/* Separador decorativo */}
        <div className="w-full flex justify-center my-8">
          <div className="flex items-center w-full max-w-md">
            <div className="h-[1px] flex-grow bg-gray-200 dark:bg-gray-700"></div>
            <div className="mx-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="h-[1px] flex-grow bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Sección "Artículos relacionados" con soporte dark mode */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">También podría interesarte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog" className="group block">
              <div className="bg-white dark:bg-black rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow p-4 h-full flex flex-col">
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-amarillo transition-colors">Explora más artículos</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Descubre todos nuestros contenidos sobre inmobiliaria, inversiones y tendencias del mercado.</p>
                <span className="mt-auto text-amarillo text-sm font-medium flex items-center">
                  Ver más artículos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </Link>
            
            <Link href="/contact" className="group block">
              <div className="bg-white dark:bg-black rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow p-4 h-full flex flex-col">
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-amarillo transition-colors">¿Necesitas asesoramiento?</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Nuestro equipo de expertos inmobiliarios está listo para ayudarte con cualquier consulta.</p>
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
    </article>
  );
};

export default BlogContent; 