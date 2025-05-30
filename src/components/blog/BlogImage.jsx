"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/legacy/image";
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80';

const BlogImage = ({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", fallbackSrc }) => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [debugInfo, setDebugInfo] = useState({ original: null, processed: null });
  const [safeSrc, setSafeSrc] = useState(fallbackSrc || FALLBACK_IMAGE);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para procesar URLs de imagen
  const processImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') {
      let processedUrl = fallbackSrc || FALLBACK_IMAGE;
      console.log('[BlogImage] URL inválida, usando fallback:', processedUrl);
      return processedUrl;
    }

    // Si es una URL completa válida, usarla directamente
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es una ruta relativa, convertirla a absoluta
    if (url.startsWith('/')) {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || '';
      return `${baseUrl}${url}`;
    }

    // Si no es una URL válida, usar fallback
    console.warn('[BlogImage] URL no válida:', url);
    return fallbackSrc || FALLBACK_IMAGE;
  }, [fallbackSrc]);

  // Función para comprobar si una URL es válida
  const isValidImageUrl = useCallback((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Función para obtener un fallback confiable
  const getSafeFallback = useCallback(() => {
    if (fallbackSrc && isValidImageUrl(fallbackSrc)) {
      // No usar via.placeholder.com si está en el fallbackSrc
      if (fallbackSrc.includes('images.weserv.nl') || fallbackSrc.includes('via.placeholder.com')) {
        return FALLBACK_IMAGE;
      }
      return fallbackSrc;
    }
    return FALLBACK_IMAGE;
  }, [fallbackSrc, isValidImageUrl]);

  // Función para manejar errores de carga
  const handleError = useCallback((error) => {
    console.error('Error cargando imagen:', src, 'usando fallback');
    setError(true);
    setLoading(false);
    setSafeSrc(getSafeFallback());
  }, [src, getSafeFallback]);

  // Función para manejar carga exitosa
  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  // Efecto para procesar la URL inicial
  useEffect(() => {
    if (src) {
      const processedSrc = processImageUrl(src);
      if (isValidImageUrl(processedSrc)) {
        setSafeSrc(processedSrc);
        setError(false);
        setLoading(true);
      } else {
        console.warn('[BlogImage] URL procesada no válida:', processedSrc);
        setSafeSrc(getSafeFallback());
        setError(true);
        setLoading(false);
      }
    } else {
      setSafeSrc(getSafeFallback());
      setError(true);
      setLoading(false);
    }
  }, [src, processImageUrl, isValidImageUrl, getSafeFallback]);

  // Función para reintentar la carga
  const retryLoad = useCallback(() => {
    setError(false);
    setLoading(true);
    // Forzar recarga agregando timestamp
    const retryUrl = `${safeSrc}${safeSrc.includes('?') ? '&' : '?'}retry=${Date.now()}`;
    setSafeSrc(retryUrl);
  }, [safeSrc]);

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
              contentUrl: FALLBACK_IMAGE 
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
            src={FALLBACK_IMAGE} 
            alt={alt || "Imagen no disponible"} 
            className="object-cover w-full h-full"
          />
          <meta itemProp="contentUrl" content={FALLBACK_IMAGE} />
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