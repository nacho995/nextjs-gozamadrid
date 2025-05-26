import React from 'react';
import Image from "next/legacy/image";

/**
 * Componente optimizado para el logo del footer
 * Con restricciones estrictas de tamaño para evitar que se vea gigante
 */
const LogoFooter = ({ src, alt, url }) => {
  return (
    <div className="flex items-center justify-start">
      <div 
        className="w-24 h-24 relative overflow-hidden"
        style={{ 
          maxWidth: '100px', 
          maxHeight: '100px',
          width: '6rem',
          height: '6rem'
        }}
      >
        <Image
          src={src || "/logonuevo.png"}
          alt={alt || "Goza Madrid - Agencia Inmobiliaria"}
          layout="fill"
          objectFit="contain"
          objectPosition="left center"
          sizes="150px"
          priority
        />
      </div>
    </div>
  );
};

export default LogoFooter; 