import Image from 'next/image';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';

// Constante para controlar los logs en desarrollo
const isDev = process.env.NODE_ENV === 'development';
const logDebug = (message, ...args) => {
  if (isDev && window.appConfig?.debug) {
    console.log(message, ...args);
  }
};

export default function PropertyImage({ 
  src, 
  alt, 
  className, 
  priority = false, 
  objectPosition = 'center',
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  propertyInfo = {}  // Optional property metadata for structured data
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  
  // Normalizar la fuente de la imagen para garantizar consistencia
  const safeSrc = useMemo(() => {
    if (!src) return '/img/property-placeholder.jpg';
    
    if (typeof src === 'string') return src;
    
    if (typeof src === 'object') {
      return src.src || src.url || src.source_url || '/img/property-placeholder.jpg';
    }
    
    return '/img/property-placeholder.jpg';
  }, [src]);
  
  // Generate a unique ID for structured data references
  const imageId = useMemo(() => `property-image-${Math.random().toString(36).substring(2, 9)}`, []);
  
  // Schema.org structured data for real estate images
  const imageSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `#${imageId}`,
    "contentUrl": safeSrc || "/img/property-placeholder.jpg",
    "name": alt || "Imagen de propiedad inmobiliaria",
    "description": alt || "Fotografía de propiedad inmobiliaria",
    "representativeOfPage": priority,
    ...(propertyInfo.address ? {
      "contentLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": propertyInfo.address
        }
      }
    } : {})
  }), [imageId, safeSrc, alt, priority, propertyInfo.address]);
  
  // Función para obtener URL de proxy optimizada
  const getProxyUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') {
      return '/img/property-placeholder.jpg';
    }
    
    // Si es un objeto, extraer la URL
    if (typeof url === 'object') {
      if (url.src) {
        return getProxyUrl(url.src);
      } else if (url.url) {
        return getProxyUrl(url.url);
      } else if (url.source_url) {
        return getProxyUrl(url.source_url);
      } else {
        return '/img/property-placeholder.jpg';
      }
    }
    
    // Si ya es una URL de proxy o una ruta local, devolverla tal cual
    if (url.includes('images.weserv.nl')) {
      return url;
    }
    
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    
    // Si es una URL de datos, devolverla tal cual
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Si es una URL relativa, convertirla a absoluta
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const absoluteUrl = `${baseUrl}/${url}`;
      return absoluteUrl;
    }
    
    // Usar un servicio de proxy confiable para todas las imágenes externas
    // Configuración básica sin conversión de formato para evitar problemas
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    return proxyUrl;
  }, []);
  
  // Obtener la URL del proxy para la imagen actual
  const proxyUrl = useMemo(() => {
    if (typeof safeSrc === 'string' && !safeSrc.startsWith('/') && !safeSrc.startsWith('data:')) {
      return getProxyUrl(safeSrc);
    }
    return safeSrc;
  }, [safeSrc, getProxyUrl]);
  
  // Track image loading con mejor manejo de errores
  useEffect(() => {
    if (!imageRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const imgElement = document.createElement('img');
          
          imgElement.onload = () => {
            setImageDimensions({
              width: imgElement.naturalWidth || 800,
              height: imgElement.naturalHeight || 600
            });
            setLoaded(true);
          };
          
          imgElement.onerror = () => {
            setError(true);
          };
          
          // Usar siempre el proxy para URLs externas para evitar problemas CORS y HTTP2
          imgElement.src = proxyUrl;
          
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    
    observer.observe(imageRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [proxyUrl]);
  
  // Componente de carga elegante
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray="60"
            strokeDashoffset="60"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.5s"
              from="60"
              to="-60"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <span className="mt-2 text-sm font-medium text-gray-700">Cargando imagen...</span>
      </div>
    </div>
  );
  
  // Imagen por defecto si hay error o no hay src
  if (error || !safeSrc) {
    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              ...imageSchema,
              contentUrl: "/img/property-placeholder.jpg" 
            }) }}
          />
        </Head>
        <div 
          className={`bg-gray-200 flex items-center justify-center ${className}`}
          ref={imageRef}
          itemScope
          itemType="https://schema.org/ImageObject"
          aria-label="Imagen no disponible"
          role="img"
          itemID={`#${imageId}`}
        >
          <span className="text-gray-500">Sin imagen</span>
          <meta itemProp="contentUrl" content="/img/property-placeholder.jpg" />
          <meta itemProp="name" content={alt || "Imagen no disponible"} />
        </div>
      </>
    );
  }
  
  // Renderizar la imagen usando la URL optimizada
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            ...imageSchema,
            contentUrl: proxyUrl
          }) }}
        />
      </Head>
      <div 
        ref={imageRef}
        className="relative overflow-hidden"
        itemScope
        itemType="https://schema.org/ImageObject"
        itemID={`#${imageId}`}
      >
        {!loaded && <LoadingIndicator />}
        <img 
          src={proxyUrl}
          alt={alt || "Propiedad inmobiliaria"}
          className={`w-full h-full object-cover ${className} ${!loaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onError={() => {
            setError(true);
          }}
          onLoad={() => setLoaded(true)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          style={{ objectPosition }}
          itemProp="contentUrl"
        />
        <meta itemProp="name" content={alt || "Imagen de propiedad inmobiliaria"} />
      </div>
    </>
  );
}