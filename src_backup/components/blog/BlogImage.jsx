"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/legacy/image";
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Múltiples imágenes de fallback
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80'
];

/**
 * Función para limpiar y corregir URLs de imágenes
 */
const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Eliminar URLs problemáticas
  if (url.includes('via.placeholder.com') || 
      url.includes('placeholder.com') ||
      url.includes('example.com')) {
    return null;
  }

  // Corregir subdomain incorrecto de WordPress
  if (url.includes('wordpress.realestategozamadrid.com')) {
    url = url.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
  }

  // Asegurar HTTPS
  if (url.startsWith('http:')) {
    url = url.replace('http:', 'https:');
  }

  return url;
};

/**
 * Función para crear URL de proxy segura
 */
const createProxyUrl = (originalUrl) => {
  const cleanUrl = cleanImageUrl(originalUrl);
  if (!cleanUrl) {
    return null;
  }

  // Si ya es una URL de Unsplash, usarla directamente
  if (cleanUrl.includes('unsplash.com') || cleanUrl.includes('images.unsplash.com')) {
    return cleanUrl;
  }

  // Usar nuestro proxy interno para imágenes de WordPress
  if (cleanUrl.includes('realestategozamadrid.com') && cleanUrl.includes('wp-content')) {
    return `/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
  }

  // Para otras URLs, usar weserv.nl con fallback
  try {
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=800&h=600&fit=cover&default=${encodeURIComponent(FALLBACK_IMAGES[0])}`;
  } catch (error) {
    console.error('[BlogImage] Error creando proxy URL:', error);
    return null;
  }
};

const BlogImage = ({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", fallbackSrc }) => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [debugInfo, setDebugInfo] = useState({ original: null, processed: null });
  const [currentSrc, setCurrentSrc] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Procesar URL de imagen
  const processImageUrl = useCallback((url) => {
    // Usar fallback personalizado si se proporciona
    if (fallbackSrc) {
      const cleanFallback = cleanImageUrl(fallbackSrc);
      if (cleanFallback) {
        return cleanFallback;
      }
    }

    // Procesar URL principal
    const proxyUrl = createProxyUrl(url);
    if (proxyUrl) {
      return proxyUrl;
    }

    // Usar imagen de fallback por defecto
    return FALLBACK_IMAGES[0];
  }, [fallbackSrc]);

  // Efecto para procesar la imagen inicial
  useEffect(() => {
    setMounted(true);
    const processedUrl = processImageUrl(src);
    setCurrentSrc(processedUrl);
  }, [src, processImageUrl]);

  // Manejar errores de carga
  const handleError = useCallback(() => {
    console.error(`Error cargando imagen: ${currentSrc}, usando fallback`);
    setError(true);
    
    // Intentar con el siguiente fallback
    if (fallbackIndex < FALLBACK_IMAGES.length - 1) {
      const nextIndex = fallbackIndex + 1;
      setFallbackIndex(nextIndex);
      setCurrentSrc(FALLBACK_IMAGES[nextIndex]);
      setError(false);
    } else {
      // Si todos los fallbacks fallaron, usar el último
      setCurrentSrc(FALLBACK_IMAGES[FALLBACK_IMAGES.length - 1]);
    }
  }, [currentSrc, fallbackIndex]);

  // Manejar carga exitosa
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
    "contentUrl": currentSrc,
    "name": alt || "Imagen del blog",
    "description": alt || "Fotografía del blog",
    "representativeOfPage": priority
  };

  if (!mounted) {
    return null;
  }

  // Imagen por defecto si hay error o no hay src
  if (error || !currentSrc) {
    return (
      <>
        {/* Include structured data even for fallback images */}
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              ...imageSchema,
              contentUrl: FALLBACK_IMAGES[fallbackIndex] 
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
            src={FALLBACK_IMAGES[fallbackIndex]} 
            alt={alt || "Imagen no disponible"} 
            className="object-cover w-full h-full"
          />
          <meta itemProp="contentUrl" content={FALLBACK_IMAGES[fallbackIndex]} />
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
          src={currentSrc}
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