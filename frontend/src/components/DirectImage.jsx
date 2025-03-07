import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// Usar una imagen que realmente exista en el sistema
const DEFAULT_IMAGE = '/img/default-image.jpg'; // Volver a la imagen original

const DirectImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc, 
  width,
  height,
  priority = false,
  loading = "lazy",
  sizes,
  quality = 75,
  ...rest 
}) => {
  const [error, setError] = useState(false);
  const [useDirect, setUseDirect] = useState(false); // Nueva bandera para usar URL directa
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');

  // Base64 imagen de respaldo en línea (SVG de placeholder)
  const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='%23999999'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
  
  // Función mejorada para procesar URL de imagen
  const processImageUrl = (url) => {
    if (!url) return fallbackSrc || fallbackSvg;
    
    try {
      // URLs locales
      if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
      }
      
      // URLs de proxy existentes
      if (url.startsWith('/api/image-proxy?url=')) {
        return url;
      }
      
      // URLs externas
      if (useDirect || error) {
        return url.startsWith('http') ? url : (fallbackSrc || fallbackSvg);
      }
      
      // Usar proxy para URLs externas
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    } catch (e) {
      console.error("Error procesando URL de imagen:", e);
      return fallbackSrc || fallbackSvg;
    }
  };
  
  useEffect(() => {
    setImageUrl(processImageUrl(src));
  }, [src, useDirect, error]);
  
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    let isMounted = true;

    img.onload = () => {
      if (isMounted) {
        setError(false);
        setIsLoaded(true);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        if (!useDirect) {
          setUseDirect(true); // Intentar carga directa si falla el proxy
        } else {
          setError(true);
        }
      }
    };

    img.src = imageUrl;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, imageUrl, useDirect]);

  // Observador de intersección para carga lazy
  useEffect(() => {
    if (!imageRef.current || loading !== 'lazy' || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageUrl(processImageUrl(src));
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, loading, isLoaded]);

  const imageProps = {
    ref: imageRef,
    src: error ? (fallbackSrc || fallbackSvg) : imageUrl,
    alt: alt || "Imagen",
    className: `${className || ''} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    loading: priority ? 'eager' : loading,
    onError: () => {
      if (!useDirect) {
        setUseDirect(true);
      } else {
        setError(true);
      }
    },
    onLoad: () => setIsLoaded(true),
    width: width,
    height: height,
    ...rest
  };

  return (
    <>
      <Head>
        {priority && imageUrl && (
          <>
            <link
              rel="preload"
              as="image"
              href={imageUrl}
              imageSrcSet={sizes}
              imageSizes={sizes}
            />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "contentUrl": imageUrl,
                "description": alt,
                "width": width,
                "height": height,
                "encodingFormat": imageUrl.endsWith('.jpg') ? "image/jpeg" : 
                                imageUrl.endsWith('.png') ? "image/png" : 
                                "image/webp"
              })}
            </script>
          </>
        )}
      </Head>

      <div 
        className="relative inline-block"
        role="img"
        aria-label={alt}
      >
        {!isLoaded && !error && (
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse"
            aria-hidden="true"
          />
        )}
        
        <img {...imageProps} />
        
        {error && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
            role="alert"
            aria-label="Error al cargar la imagen"
          >
            <span className="text-sm text-gray-500">
              Imagen no disponible
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectImage; 