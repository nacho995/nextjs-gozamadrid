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
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);

  // Base64 imagen de respaldo en línea (SVG de placeholder)
  const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='%23999999'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
  
  // Forma simplificada, usar la URL directamente en la mayoría de los casos
  const imageUrl = src || (fallbackSrc || fallbackSvg);
  
  useEffect(() => {
    console.log("DirectImage renderizando imagen:", src);
  }, [src]);

  const imageProps = {
    ref: imageRef,
    src: error ? (fallbackSrc || fallbackSvg) : imageUrl,
    alt: alt || "Imagen",
    className: `${className || ''} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    loading: priority ? 'eager' : loading,
    onError: () => {
      console.error('DirectImage: Error al cargar la imagen:', imageUrl);
      setError(true);
    },
    onLoad: () => {
      console.log('DirectImage: Imagen cargada correctamente:', imageUrl);
      setIsLoaded(true);
    },
    width: width,
    height: height,
    ...rest
  };

  return (
    <>
      {priority && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={imageUrl}
            imageSrcSet={sizes}
            imageSizes={sizes}
          />
        </Head>
      )}

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