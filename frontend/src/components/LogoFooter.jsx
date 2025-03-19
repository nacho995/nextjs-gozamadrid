import React from 'react';
import Image from 'next/image';

/**
 * Componente optimizado para el logo del footer
 * Con restricciones estrictas de tamaño para evitar que se vea gigante
 */
const LogoFooter = ({ src, alt, url }) => {
  return (
    <div className="flex items-center justify-start">
      <div 
        className="w-36 h-14 relative overflow-hidden"
        style={{ 
          maxWidth: '150px', 
          maxHeight: '60px',
          width: '9rem',
          height: '3.5rem'
        }}
      >
        <Image
          src={src || "/logo.png"}
          alt={alt || "Goza Madrid - Agencia Inmobiliaria"}
          fill
          sizes="150px"
          style={{
            objectFit: 'contain',
            objectPosition: 'left center',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          priority
        />
      </div>
    </div>
  );
};

export default LogoFooter; 