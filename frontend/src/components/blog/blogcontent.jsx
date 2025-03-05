import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaUser, FaTags, FaArrowLeft, FaShare, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBlogPostBySlug } from '@/services/wpApi';


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
      
      // Añadir el atributo de manejo de errores para ocultar la imagen en lugar de mostrar una por defecto
      if (!attributes.includes('onerror=')) {
        attributes += ` onerror="this.style.display='none'; console.log('Imagen no disponible');"`;
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
        return `<p${attributes} class="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">${content}</p>`;
      }
      
      return match;
    }
  );
  
  // Mejorar los headings - pero excluir los que contienen imágenes
  processedContent = processedContent.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attributes, content) => {
      // Si el contenido tiene una imagen, no añadir el span decorativo
      if (content.includes('<img')) {
        return `<h2${attributes}>${content}</h2>`;
      }
      
      // Para texto normal, añadir el span decorativo
      return `<h2${attributes}><span class="relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-transparent after:rounded-full">${content}</span></h2>`;
    }
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
      window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank');
    }
  };
  
  return (
    <div>
      <h3 className="text-sm uppercase text-gray-500 mb-4 font-semibold tracking-wider">Comparte este artículo:</h3>
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
  const router = useRouter();
  const [blogUrl, setBlogUrl] = useState('');
  
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        if (!slug) {
          throw new Error('Slug no proporcionado');
        }
        
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
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchBlogData();
    } else {
      setError('No se proporcionó un identificador para el blog');
    }
  }, [slug]);
  
  useEffect(() => {
    // Obtener la URL actual del navegador cuando el componente está en el cliente
    if (typeof window !== 'undefined') {
      // Asegúrate de capturar la URL completa incluyendo protocolo, dominio y ruta
      setBlogUrl(window.location.href);
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
    <article className="max-w-4xl mx-auto px-4 py-8">
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
            <Image 
              src={imageSrc}
              alt={typeof title === 'object' ? title.rendered : title}
              fill
              className="object-cover"
              priority
              unoptimized={!imageSrc.includes('realestategozamadrid.com')}
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
            </div>
          </>
        )}

        {/* Extracto mejorado con efecto visual */}
        {excerpt && (
          <div className="relative bg-amarillo/10 border-l-4 border-amarillo p-6 mb-8 text-lg italic rounded-r-xl">
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
          __html: typeof content === 'object' ? processHTMLContent(content.rendered) : processHTMLContent(content)
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
        <ShareButtons url={blogUrl} title={typeof title === 'object' ? title.rendered : title} />
        
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
  );
};

export default BlogContent; 