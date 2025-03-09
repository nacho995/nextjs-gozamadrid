"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BlogImage = ({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }) => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [debugInfo, setDebugInfo] = useState({ original: null, processed: null });
  const [safeSrc, setSafeSrc] = useState('/img/default-blog-image.jpg');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Procesar la URL de la imagen en un efecto para evitar re-renderizados infinitos
  useEffect(() => {
    // Función para procesar la URL de la imagen
    const processImageUrl = (url) => {
      let processedUrl = '/img/default-blog-image.jpg';
      
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

      // Eliminar referencias a imageproxy
      if (url.includes('imageproxy/')) {
        return processedUrl;
      }

      // Si la URL es de WordPress, usar un proxy de imágenes para evitar errores HTTP2_PROTOCOL_ERROR
      if (url.includes('realestategozamadrid.com') || url.includes('gozamadrid.com') || url.includes('wp-content')) {
        // Usar images.weserv.nl como proxy de imágenes
        processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
        return processedUrl;
      }

      // Si la URL es externa, usar nuestro proxy de imágenes solo para imágenes que no son de WordPress
      if (url.startsWith('http') || url.startsWith('https')) {
        // Usar la URL directamente para imágenes externas que no son de WordPress
        return url;
      }

      // Si la URL es relativa, construir la URL completa usando la URL base de la API
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
  }, [src]);

  // Generate a unique ID for structured data references
  const imageId = `blog-image-${Math.random().toString(36).substring(2, 9)}`;
  
  // Schema.org structured data for blog images
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `#${imageId}`,
    "contentUrl": safeSrc || "/img/default-blog-image.jpg",
    "name": alt || "Imagen del blog",
    "description": alt || "Fotografía del blog",
    "representativeOfPage": priority
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
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
              contentUrl: "/img/default-blog-image.jpg" 
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
          <span className="text-gray-500">Sin imagen disponible</span>
          <meta itemProp="contentUrl" content="/img/default-blog-image.jpg" />
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