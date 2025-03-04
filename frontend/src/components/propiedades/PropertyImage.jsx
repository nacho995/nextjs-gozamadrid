import Image from 'next/image';
import { useState } from 'react';

export default function PropertyImage({ src, alt, className }) {
  const [error, setError] = useState(false);
  
  // Imagen por defecto si hay error o no hay src
  if (error || !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Sin imagen</span>
      </div>
    );
  }
  
  // Usar un servicio de proxy de imágenes para evitar problemas CORS y HTTP2
  if (src.startsWith('http') && src.includes('realestategozamadrid.com')) {
    // Usar images.weserv.nl como proxy de imágenes
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    
    return (
      <img 
        src={proxyUrl}
        alt={alt || "Propiedad"}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }
  
  // Para otras URLs externas
  if (src.startsWith('http')) {
    return (
      <img 
        src={src}
        alt={alt || "Propiedad"}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }
  
  // Para imágenes locales o del mismo dominio, usar Next Image
  return (
    <Image
      src={src}
      alt={alt || "Propiedad"}
      width={500}
      height={300}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
} 