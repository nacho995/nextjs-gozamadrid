import { useState, useEffect, useRef } from 'react';

/**
 * Componente de depuración para imágenes
 * Muestra la imagen con información detallada sobre su URL y estado de carga
 */
const DebugImage = ({ src, alt, className, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgDetails, setImgDetails] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Reset estado cuando cambia la fuente
    setIsLoaded(false);
    setHasError(false);

    // Extraer información detallada sobre la URL
    let urlType = 'desconocida';
    if (!src) {
      urlType = 'indefinida';
    } else if (src.startsWith('/')) {
      urlType = 'local';
      if (src.startsWith('/uploads/')) {
        urlType = 'local-uploads';
      } else if (src.startsWith('/img/')) {
        urlType = 'local-img';
      }
    } else if (src.startsWith('http')) {
      urlType = 'externa';
      if (src.includes('cloudinary.com')) {
        urlType = 'cloudinary';
      } else if (src.includes('weserv.nl')) {
        urlType = 'proxy-weserv';
      }
    }

    setImgDetails({
      urlType,
      fullUrl: src || 'URL no proporcionada',
      protocol: src ? (src.startsWith('http') ? (src.startsWith('https') ? 'https' : 'http') : 'N/A') : 'N/A',
      isLocal: src ? src.startsWith('/') : false,
      isCloudinary: src ? src.includes('cloudinary.com') : false
    });

  }, [src]);

  return (
    <div className="debug-image-container border border-gray-300 p-2 rounded-md my-2">
      <div className="relative">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-500">Cargando...</span>
          </div>
        )}
        
        <img
          ref={imageRef}
          src={src}
          alt={alt || "Imagen de depuración"}
          className={`${className || ''}`}
          style={{ width: width || 'auto', height: height || 'auto' }}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            console.error('Error al cargar la imagen:', src);
            setHasError(true);
          }}
        />

        {hasError && (
          <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
            <span className="text-sm text-red-500">Error al cargar la imagen</span>
          </div>
        )}
      </div>

      <div className="debug-details mt-2 text-xs bg-gray-50 p-2 rounded">
        <p><strong>Estado:</strong> {hasError ? 'Error' : (isLoaded ? 'Cargada' : 'Cargando')}</p>
        <p><strong>Tipo de URL:</strong> {imgDetails?.urlType}</p>
        <p className="break-all"><strong>URL completa:</strong> {imgDetails?.fullUrl}</p>
        <p><strong>Protocolo:</strong> {imgDetails?.protocol}</p>
        <p><strong>Es local:</strong> {imgDetails?.isLocal ? 'Sí' : 'No'}</p>
        <p><strong>Es Cloudinary:</strong> {imgDetails?.isCloudinary ? 'Sí' : 'No'}</p>
      </div>
    </div>
  );
};

export default DebugImage; 