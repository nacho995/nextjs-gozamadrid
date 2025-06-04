"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/legacy/image";
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Múltiples imágenes de fallback de Unsplash
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80'
];

const BlogImage = ({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", fallbackSrc }) => {
  const [safeSrc, setSafeSrc] = useState(fallbackSrc || FALLBACK_IMAGES[0]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [debugInfo, setDebugInfo] = useState({ original: null, processed: null });

  const processImageUrl = useCallback((url) => {
    let processedUrl = fallbackSrc || FALLBACK_IMAGES[0];
    
    if (url && typeof url === 'string') {
      // Eliminar URLs problemáticas
      if (url.includes('via.placeholder.com') || 
          url.includes('placeholder.com') ||
          url.includes('example.com')) {
        console.warn('URL problemática detectada, usando fallback:', url);
        return FALLBACK_IMAGES[0];
      }

      // Corregir subdomain incorrecto de WordPress
      if (url.includes('wordpress.realestategozamadrid.com')) {
        url = url.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
      }

      // Si es una imagen de Unsplash, usarla directamente
      if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
        return url;
      }

      // Para imágenes de WordPress, usar nuestro proxy
      if (url.includes('realestategozamadrid.com') && url.includes('wp-content')) {
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
      }

      // Usar weserv como proxy con fallback de Unsplash
      try {
        if (url.includes('images.weserv.nl') || url.includes('via.placeholder.com')) {
          return FALLBACK_IMAGES[0];
        }
        
        processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=600&fit=cover&default=${encodeURIComponent(FALLBACK_IMAGES[0])}`;
      } catch (error) {
        console.error('Error procesando URL:', error);
        processedUrl = FALLBACK_IMAGES[0];
      }
    }

    setDebugInfo({
      original: src,
      processed: processedUrl
    });

    return processedUrl;
  }, [src, fallbackSrc]);

  useEffect(() => {
    setMounted(true);
    const processedUrl = processImageUrl(src);
    setSafeSrc(processedUrl);
  }, [src, processImageUrl]);

  const redirectToFallback = useCallback(() => {
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
  }, []);

  const handleError = useCallback(() => {
    console.error(`Error cargando imagen: ${safeSrc}, usando fallback`);
    setError(true);
    setSafeSrc(FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]);
  }, [safeSrc]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  // Generate a unique ID for structured data references
  const imageId = `blog-image-${Math.random().toString(36).substring(2, 9)}`;
  
  // Schema.org structured data for blog images
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `#${imageId}`,
    "contentUrl": safeSrc,
    "name": alt || "Imagen del blog",
    "description": alt || "Fotografía del blog",
    "representativeOfPage": priority
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
              contentUrl: FALLBACK_IMAGES[0] 
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
            src={FALLBACK_IMAGES[0]} 
            alt={alt || "Imagen no disponible"} 
            className="object-cover w-full h-full"
          />
          <meta itemProp="contentUrl" content={FALLBACK_IMAGES[0]} />
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
          onError={handleError}
          onLoad={handleLoad}
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