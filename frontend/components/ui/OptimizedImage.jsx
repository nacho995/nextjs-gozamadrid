import { useState } from 'react';
import Image from 'next/image';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Lista de imágenes críticas que deben usar la API
  const criticalImages = ['logonuevo.png', 'logo.png', 'favicon.ico'];
  
  const getImageSrc = (originalSrc) => {
    // Si es una imagen crítica, usar la API directamente
    const imageName = originalSrc.split('/').pop();
    if (criticalImages.includes(imageName)) {
      return `/api/images/${imageName}`;
    }
    return originalSrc;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Intentar con la API si la imagen original falla
      const imageName = src.split('/').pop();
      if (criticalImages.includes(imageName)) {
        setImgSrc(`/api/images/${imageName}`);
      }
    }
  };

  const finalSrc = hasError ? getImageSrc(src) : imgSrc;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage; 