import { useState, useEffect } from 'react';

// Usar una imagen que realmente exista en el sistema
const DEFAULT_IMAGE = '/img/default-image.jpg'; // Volver a la imagen original

const DirectImage = ({ src, alt, className, fallbackSrc, ...rest }) => {
  const [error, setError] = useState(false);
  const [useDirect, setUseDirect] = useState(false); // Nueva bandera para usar URL directa
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1;
  
  // Base64 imagen de respaldo en línea (SVG de placeholder)
  const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='%23999999'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
  
  // Función para procesar URL de imagen
  const processImageUrl = (url) => {
    if (!url) return fallbackSvg;
    
    // Si ya estamos en modo directo o tenemos error, no usar proxy
    if (useDirect || error) {
      // Si es una URL externa, usarla directamente
      if (url.startsWith('http')) {
        return url;
      }
      // Si es local o tenemos error, usar fallback o imagen en línea
      return fallbackSrc || fallbackSvg;
    }
    
    // Procesamiento normal (usando proxy)
    try {
      // URLs locales se usan directamente
      if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
      }
      
      // Si ya es un proxy de image-proxy, devolverlo tal cual
      if (url.startsWith('/api/image-proxy?url=')) {
        return url;
      }
      
      // Usar exclusivamente image-proxy para todas las solicitudes
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    } catch (e) {
      console.error("Error procesando URL:", e);
      return fallbackSrc || fallbackSvg;
    }
  };
  
  // URL de imagen procesada
  const imageUrl = processImageUrl(src);
  
  // Usar image.onload para verificar que la imagen carga correctamente
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.onload = () => setError(false);
    img.onerror = () => setError(true);
    img.src = imageUrl; // Usar imageUrl procesada en lugar de src directamente
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, imageUrl]);
  
  if (error || !src) {
    return (
      <img
        src={fallbackSvg}
        alt={alt || "Imagen no disponible"}
        className={className}
        {...rest}
      />
    );
  }
  
  return (
    <img
      src={imageUrl} // Usar imageUrl procesada en lugar de src directamente
      alt={alt || "Imagen"}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
};

export default DirectImage; 