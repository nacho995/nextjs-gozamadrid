import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

/**
 * Componente DirectImage mejorado
 * Maneja imágenes locales y externas con fallback
 */
const DirectImage = ({ 
  src, 
  alt = "Imagen",
  className = '', 
  width,
  height,
  priority = false,
  loading = "lazy",
  sizes,
  quality = 75,
  fallbackSrc,
  ...rest 
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    setError(false);
    setLoaded(false);
    
    // Procesar URL
    let processedSrc = src;
    
    // Si es una URL externa y no está ya proxificada, usar el proxy
    if ((src.startsWith('http://') || src.startsWith('https://')) && 
        !src.includes('/api/image-proxy') && 
        !src.includes('/imageproxy/')) {
      processedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    }
    
    setImageSrc(processedSrc);
  }, [src]);

  if (error || !imageSrc) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={{ 
            width: width || '100%',
            height: height || '200px',
            objectFit: 'cover'
          }}
          loading={loading}
        />
      );
    }
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ 
          minWidth: width || '100%',
          minHeight: height || '200px'
        }}
      >
        <span className="text-gray-500">Sin imagen disponible</span>
      </div>
    );
  }

  const isNextImageCompatible = imageSrc.startsWith('/') || imageSrc.startsWith('data:') || imageSrc.startsWith('http');

  return (
    <>
      {priority && (
        <Head>
          <link rel="preload" as="image" href={imageSrc} imageSrcSet={sizes} imageSizes={sizes} />
        </Head>
      )}

      <div className="relative w-full h-full">
        {!loaded && (
          <div className="absolute inset-0 bg-gray-100" aria-hidden="true" />
        )}
        
        {isNextImageCompatible ? (
          <Image
            src={imageSrc}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 object-cover`}
            quality={quality}
            priority={priority}
            loading={loading}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            {...rest}
          />
        ) : (
          <img
            src={imageSrc}
            alt={alt}
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 w-full h-full object-cover`}
            style={{ width: width || '100%', height: height || '100%' }}
            loading={priority ? 'eager' : loading}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            {...rest}
          />
        )}
      </div>
    </>
  );
};

export default DirectImage; 