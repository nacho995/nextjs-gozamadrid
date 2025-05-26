"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from "next/legacy/image";
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BlogImage = ({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", fallbackSrc }) => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [debugInfo, setDebugInfo] = useState({ original: null, processed: null });
  const [safeSrc, setSafeSrc] = useState(fallbackSrc || 'https://via.placeholder.com/800x600?text=GozaMadrid');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Procesar la URL de la imagen en un efecto para evitar re-renderizados infinitos
  useEffect(() => {
    // Función para procesar la URL de la imagen
    const processImageUrl = (url) => {
      let processedUrl = fallbackSrc || 'https://via.placeholder.com/800x600?text=GozaMadrid';
      
      if (!url) return processedUrl;

      // Si es un array (formato del esquema de blogs), tomar el primer elemento
      if (Array.isArray(url) && url.length > 0) {
        const firstImage = url[0];
        if (typeof firstImage === 'object' && firstImage.src) {
          return processImageUrl(firstImage.src);
        } else if (typeof firstImage === 'string') {
          return processImageUrl(firstImage);
        }
        return processedUrl;
      }

      // Si url es un objeto, extraer la URL
      if (typeof url === 'object') {
        if (url.src) return processImageUrl(url.src);
        if (url.url) return processImageUrl(url.url);
        if (url.source_url) return processImageUrl(url.source_url);
        return processedUrl;
      }

      // Asegurarse de que url sea una cadena
      if (typeof url !== 'string') {
        return processedUrl;
      }

      // Si la URL ya es un servicio de proxy, usarla directamente
      if (url.includes('images.weserv.nl') || url.includes('via.placeholder.com')) {
        return url;
      }
      
      // Reemplazar http: con https: para evitar problemas de contenido mixto
      if (url.startsWith('http:')) {
        url = url.replace('http:', 'https:');
      }

      // Eliminar referencias a imageproxy
      if (url.includes('imageproxy/')) {
        return processedUrl;
      }

      // Si es una URL relativa y no empieza con /, agregarlo
      if (!url.startsWith('http') && !url.startsWith('/')) {
        url = '/' + url;
      }

      // Si es una URL relativa al servidor, mantenerla tal cual (excepto default-blog-image)
      if (url.startsWith('/') && !url.startsWith('//')) {
        // Comprobar si es la imagen por defecto problemática
        if (url === '/img/default-blog-image.jpg') {
          return 'https://via.placeholder.com/800x600?text=GozaMadrid';
        }
        
        // Si es una URL relativa, intentar usar la URL completa del servidor
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return `${baseUrl}${url}`;
      }

      // Para todas las demás URLs (externas), usar weserv.nl directamente
      if (url.startsWith('http') || url.startsWith('https') || url.startsWith('//')) {
        // Asegurarse de que la URL tenga el protocolo
        if (url.startsWith('//')) {
          url = 'https:' + url;
        }

        // Usar weserv.nl directamente para todas las imágenes externas
        processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1`;
        return processedUrl;
      }

      // Para cualquier otro caso, usar la URL base de la API para construir la URL completa
      processedUrl = `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      return processedUrl;
    };

    // Procesar la URL y actualizar el estado
    const processedSrc = processImageUrl(src);
    setSafeSrc(processedSrc);
    
    // Actualizar la información de depuración
    setDebugInfo({
      original: src,
      processed: processedSrc
    });
  }, [src, fallbackSrc]);

  // Generate a unique ID for structured data references
  const imageId = `blog-image-${Math.random().toString(36).substring(2, 9)}`;
  
  // Schema.org structured data for blog images
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `#${imageId}`,
    "contentUrl": safeSrc || fallbackSrc || "/img/default-blog-image.jpg",
    "name": alt || "Imagen del blog",
    "description": alt || "Fotografía del blog",
    "representativeOfPage": priority
  };

  const handleImageError = () => {
    console.warn(`Error cargando imagen: ${safeSrc}, usando fallback`);
    setError(true);
    setLoading(false);
    // Usar un placeholder externo en lugar de la imagen local
    setSafeSrc('https://via.placeholder.com/800x600?text=GozaMadrid');
  };

  if (!mounted) {
    return null;
  }

  // Imagen por defecto si hay error o no hay src
  if (error || !safeSrc) {
    return (
      <>
        {/* Include structured data even for fallback images */}
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              ...imageSchema,
              contentUrl: 'https://via.placeholder.com/800x600?text=GozaMadrid' 
            }) }}
          />
        </Head>
        <div 
          className={`flex items-center justify-center bg-gray-200 ${className}`}
          ref={imageRef}
          itemScope
          itemType="https://schema.org/ImageObject"
          aria-label="Imagen no disponible"
          role="img"
          itemID={`#${imageId}`}
        >
          <img 
            src="https://via.placeholder.com/800x600?text=GozaMadrid" 
            alt={alt || "Imagen no disponible"} 
            className="object-cover w-full h-full"
          />
          <meta itemProp="contentUrl" content="https://via.placeholder.com/800x600?text=GozaMadrid" />
          <meta itemProp="name" content={alt || "Imagen no disponible"} />
        </div>
      </>
    );
  }

  // Usar un componente img normal para todas las imágenes
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
        />
      </Head>
      <div 
        ref={imageRef}
        className="relative overflow-hidden"
        itemScope
        itemType="https://schema.org/ImageObject"
        itemID={`#${imageId}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse bg-gray-200 rounded-full h-16 w-16"></div>
          </div>
        )}
        
        <img
          src={safeSrc}
          alt={alt || "Imagen del blog"}
          className={`w-full h-full object-cover ${className}`}
          onError={handleImageError}
          onLoad={() => setLoading(false)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          itemProp="contentUrl"
          data-debug={JSON.stringify(debugInfo)}
        />
        <meta itemProp="name" content={alt || "Fotografía del blog"} />
        <meta itemProp="representativeOfPage" content={priority ? "true" : "false"} />
      </div>
    </>
  );
};

export default BlogImage; 