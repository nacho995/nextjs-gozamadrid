import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
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
  
  // Asegurarse de que src sea una cadena de texto
  const safeSrc = typeof src === 'string' ? src : 
                 (src && typeof src === 'object' && src.src) ? src.src :
                 (src && typeof src === 'object' && src.url) ? src.url :
                 (src && typeof src === 'object' && src.source_url) ? src.source_url :
                 '/img/property-placeholder.jpg';
  
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
  
  // Track image loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Fix: Use document.createElement('img') instead of new Image() to avoid conflict
          const imgElement = document.createElement('img');
          
          imgElement.onload = () => {
            setImageDimensions({
              width: imgElement.naturalWidth || 800,
              height: imgElement.naturalHeight || 600
            });
            setLoaded(true);
          };
          
          if (safeSrc) {
            // For proxy URLs, we need to handle differently
            if (typeof safeSrc === 'string' && safeSrc.startsWith('http') && safeSrc.includes('realestategozamadrid.com')) {
              const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(safeSrc)}&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
              imgElement.src = proxyUrl;
            } else {
              imgElement.src = safeSrc;
            }
          }
          
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [safeSrc]);
  
  // Imagen por defecto si hay error o no hay src
  if (error || !safeSrc) {
    return (
      <>
        {/* Include structured data even for fallback images */}
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
  
  // Usar un servicio de proxy de imágenes para evitar problemas CORS y HTTP2
  if (typeof safeSrc === 'string' && safeSrc.startsWith('http') && safeSrc.includes('realestategozamadrid.com')) {
    // Usar images.weserv.nl como proxy de imágenes
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(safeSrc)}&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    
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
          <img 
            src={proxyUrl}
            alt={alt || "Propiedad inmobiliaria"}
            className={`w-full h-full object-cover ${className}`}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
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
  
  // Para otras URLs externas
  if (typeof safeSrc === 'string' && safeSrc.startsWith('http')) {
    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
          />
        </Head>
        <div 
          ref={imageRef}
          className="relative overflow-hidden"
          itemScope
          itemType="https://schema.org/ImageObject"
          itemID={`#${imageId}`}
        >
          <img 
            src={safeSrc}
            alt={alt || "Propiedad inmobiliaria"}
            className={`w-full h-full object-cover ${className}`}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            itemProp="contentUrl"
            style={{ objectPosition }}
          />
          <meta itemProp="name" content={alt || "Fotografía de propiedad inmobiliaria"} />
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
        <Image
          src={safeSrc}
          alt={alt || "Propiedad inmobiliaria"}
          width={500}
          height={300}
          className={`object-cover ${className}`}
          onError={() => setError(true)}
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