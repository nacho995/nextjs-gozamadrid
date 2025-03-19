import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';

export default function PropertyImage({ 
  src, 
  alt, 
  className, 
  priority = false, 
  objectPosition = 'center',
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  propertyInfo = {}  // Optional property metadata for structured data
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  
  // Normalizar la fuente de la imagen para garantizar consistencia
  const safeSrc = useMemo(() => {
    if (!src) return '/img/property-placeholder.jpg';
    
    if (typeof src === 'string') return src;
    
    if (typeof src === 'object') {
      return src.src || src.url || src.source_url || '/img/property-placeholder.jpg';
    }
    
    return '/img/property-placeholder.jpg';
  }, [src]);
  
  // Generate a unique ID for structured data references
  const imageId = `property-image-${Math.random().toString(36).substring(2, 9)}`;
  
  // Schema.org structured data for real estate images
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `#${imageId}`,
    "contentUrl": safeSrc || "/img/property-placeholder.jpg",
    "name": alt || "Imagen de propiedad inmobiliaria",
    "description": alt || "Fotografía de propiedad inmobiliaria",
    "representativeOfPage": priority
  };
  
  // If we have property info, enhance the structured data
  if (propertyInfo.address) {
    imageSchema.contentLocation = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": propertyInfo.address
      }
    };
  }
  
  // Función para obtener URL de proxy optimizada
  const getProxyUrl = (url) => {
    if (!url || typeof url !== 'string') {
      console.log("PropertyImage - URL inválida:", url);
      return '/img/property-placeholder.jpg';
    }
    
    console.log("PropertyImage - URL original:", url);
    
    // Si es un objeto, extraer la URL
    if (typeof url === 'object') {
      console.log("PropertyImage - URL es un objeto:", url);
      if (url.src) {
        console.log("PropertyImage - Usando url.src:", url.src);
        return getProxyUrl(url.src);
      } else if (url.url) {
        console.log("PropertyImage - Usando url.url:", url.url);
        return getProxyUrl(url.url);
      } else if (url.source_url) {
        console.log("PropertyImage - Usando url.source_url:", url.source_url);
        return getProxyUrl(url.source_url);
      } else {
        console.log("PropertyImage - Objeto de imagen sin URL reconocible");
        return '/img/property-placeholder.jpg';
      }
    }
    
    // Si ya es una URL de proxy o una ruta local, devolverla tal cual
    if (url.includes('images.weserv.nl')) {
      console.log("PropertyImage - URL ya es proxy, devolviendo tal cual:", url);
      return url;
    }
    
    if (url.startsWith('/') && !url.startsWith('//')) {
      console.log("PropertyImage - URL local, devolviendo tal cual:", url);
      return url;
    }
    
    // Si es una URL de datos, devolverla tal cual
    if (url.startsWith('data:')) {
      console.log("PropertyImage - URL de datos, devolviendo tal cual");
      return url;
    }
    
    // Si es una URL relativa, convertirla a absoluta
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      const baseUrl = window.location.origin;
      const absoluteUrl = `${baseUrl}/${url}`;
      console.log("PropertyImage - URL relativa convertida a absoluta:", absoluteUrl);
      return absoluteUrl;
    }
    
    // Usar un servicio de proxy confiable para todas las imágenes externas
    // Configuración básica sin conversión de formato para evitar problemas
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    console.log("PropertyImage - URL convertida a proxy:", proxyUrl);
    return proxyUrl;
  };
  
  // Track image loading con mejor manejo de errores
  useEffect(() => {
    if (!imageRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const imgElement = document.createElement('img');
          
          imgElement.onload = () => {
            setImageDimensions({
              width: imgElement.naturalWidth || 800,
              height: imgElement.naturalHeight || 600
            });
            setLoaded(true);
          };
          
          imgElement.onerror = () => {
            console.warn(`Error al precargar imagen: ${safeSrc}`);
            setError(true);
          };
          
          // Usar siempre el proxy para URLs externas para evitar problemas CORS y HTTP2
          if (safeSrc && typeof safeSrc === 'string' && !safeSrc.startsWith('/') && !safeSrc.startsWith('data:')) {
            imgElement.src = getProxyUrl(safeSrc);
          } else {
            imgElement.src = safeSrc;
          }
          
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    
    observer.observe(imageRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [safeSrc]);
  
  // Componente de carga elegante
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray="60"
            strokeDashoffset="60"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="1.5s"
              from="60"
              to="-60"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <span className="mt-2 text-sm font-medium text-gray-700">Cargando imagen...</span>
      </div>
    </div>
  );
  
  // Imagen por defecto si hay error o no hay src
  if (error || !safeSrc) {
    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              ...imageSchema,
              contentUrl: "/img/property-placeholder.jpg" 
            }) }}
          />
        </Head>
        <div 
          className={`bg-gray-200 flex items-center justify-center ${className}`}
          ref={imageRef}
          itemScope
          itemType="https://schema.org/ImageObject"
          aria-label="Imagen no disponible"
          role="img"
          itemID={`#${imageId}`}
        >
          <span className="text-gray-500">Sin imagen</span>
          <meta itemProp="contentUrl" content="/img/property-placeholder.jpg" />
          <meta itemProp="name" content={alt || "Imagen no disponible"} />
        </div>
      </>
    );
  }
  
  // Para todas las URLs externas, usar el proxy optimizado
  if (typeof safeSrc === 'string' && !safeSrc.startsWith('/') && !safeSrc.startsWith('data:')) {
    const proxyUrl = getProxyUrl(safeSrc);
    
    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              ...imageSchema,
              contentUrl: proxyUrl
            }) }}
          />
        </Head>
        <div 
          ref={imageRef}
          className="relative overflow-hidden"
          itemScope
          itemType="https://schema.org/ImageObject"
          itemID={`#${imageId}`}
        >
          {!loaded && <LoadingIndicator />}
          <img 
            src={proxyUrl}
            alt={alt || "Propiedad inmobiliaria"}
            className={`w-full h-full object-cover ${className} ${!loaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onError={() => {
              console.warn(`Error al cargar imagen: ${proxyUrl}`);
              setError(true);
            }}
            onLoad={() => setLoaded(true)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            itemProp="contentUrl"
            data-original-url={safeSrc}
            style={{ objectPosition }}
          />
          <meta itemProp="description" content={alt || "Fotografía de propiedad inmobiliaria"} />
          <meta itemProp="representativeOfPage" content={priority ? "true" : "false"} />
          {loaded && (
            <>
              <meta itemProp="width" content={imageDimensions.width} />
              <meta itemProp="height" content={imageDimensions.height} />
            </>
          )}
        </div>
      </>
    );
  }
  
  // Para imágenes locales o del mismo dominio, usar Next Image
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            ...imageSchema,
            contentUrl: typeof safeSrc === 'string' ? safeSrc : '/img/property-placeholder.jpg'
          }) }}
        />
      </Head>
      <div 
        ref={imageRef}
        className="relative overflow-hidden"
        itemScope
        itemType="https://schema.org/ImageObject"
        itemID={`#${imageId}`}
      >
        {!loaded && <LoadingIndicator />}
        <Image
          src={safeSrc}
          alt={alt || "Propiedad inmobiliaria"}
          width={500}
          height={300}
          className={`object-cover ${className} ${!loaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onError={() => {
            console.warn(`Error al cargar imagen Next.js: ${safeSrc}`);
            setError(true);
          }}
          onLoad={() => setLoaded(true)}
          priority={priority}
          sizes={sizes}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
          itemProp="contentUrl"
          style={{ objectPosition }}
          loading={priority ? "eager" : "lazy"}
        />
        <meta itemProp="name" content={alt || "Fotografía de propiedad inmobiliaria"} />
        <meta itemProp="representativeOfPage" content={priority ? "true" : "false"} />
      </div>
    </>
  );
}