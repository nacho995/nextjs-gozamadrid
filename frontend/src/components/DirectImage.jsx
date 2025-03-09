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
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

  useEffect(() => {
    if (src) {
      // Si la imagen es una ruta relativa y no una URL completa, añadir el prefijo
      if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith('http')) {
        setImageSrc(`${assetPrefix}${src}`);
      } else {
        setImageSrc(src);
      }
      setError(false);
    } else {
      setError(true);
    }
  }, [src, assetPrefix]);

  const handleError = () => {
    setError(true);
  };

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
        className={`relative flex items-center justify-center bg-gray-200 ${className || ''}`}
        style={{ width: width || '100%', height: height || '300px' }}
        {...rest}
      >
        <span className="text-gray-500">Imagen no disponible</span>
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
            onError={handleError}
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
            onError={handleError}
            onLoad={() => setLoaded(true)}
            {...rest}
          />
        )}
      </div>
    </>
  );
};

export default DirectImage; 