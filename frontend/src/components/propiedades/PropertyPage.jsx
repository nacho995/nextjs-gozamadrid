"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import { getPropertyPosts } from "../../pages/api";
import PropertyImage from './PropertyImage';
import Head from 'next/head';

// Estilos consistentes con el resto de la web
const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' };

// Componente de Paginación
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const router = useRouter();
  
  // Función para renderizar números de página limitados
  const renderPageNumbers = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Primero actualizamos el estado local
      onPageChange(page);
      
      // Luego navegamos con un pequeño retraso para permitir que el estado se actualice
      setTimeout(() => {
        router.push({
          pathname: router.pathname,
          query: { ...router.query, page }
        }, undefined, { scroll: true });  // Esto asegura que la página se desplace hacia arriba
      }, 10);
    }
  };

  return (
    <div className="grid md:grid-cols-12 grid-cols-1 mt-6">
      <div className="md:col-span-12 text-center">
        <nav aria-label="Navegación de páginas">
          <ul className="inline-flex flex-wrap items-center gap-2 justify-center">
            {/* Botón Anterior */}
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 inline-flex justify-center items-center rounded-full 
                  ${currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo transition-colors'} 
                  shadow-sm`}
                aria-label="Ir a la página anterior"
              >
                <i className="mdi mdi-chevron-left text-[20px]" aria-hidden="true"></i>
              </button>
            </li>

            {/* Números de página limitados */}
            {renderPageNumbers().map((pageNumber) => (
              <li key={pageNumber}>
                <button
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 inline-flex justify-center items-center rounded-full
                    ${pageNumber === currentPage
                      ? 'text-white bg-black hover:bg-gold'
                      : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo'} 
                    transition-colors shadow-sm`}
                  aria-label={`Ir a la página ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            {/* Botón Siguiente */}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 inline-flex justify-center items-center rounded-full 
                  ${currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo transition-colors'} 
                  shadow-sm`}
                aria-label="Ir a la página siguiente"
              >
                <i className="mdi mdi-chevron-right text-[20px]" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

// Modificar la función para obtener la URL de la imagen
const getProxiedImageUrl = (url) => {
  if (!url) return '/img/default-property-image.jpg';
  
  // Asegurarse de que url sea una cadena de texto
  if (typeof url !== 'string') {
    // Si es un objeto con src o url, usar esa propiedad
    if (url && typeof url === 'object') {
      if (url.src) return getProxiedImageUrl(url.src);
      if (url.url) return getProxiedImageUrl(url.url);
    }
    // Si no es una cadena ni un objeto con src/url, devolver la imagen por defecto
    return '/img/default-property-image.jpg';
  }
  
  // Si ya es una URL absoluta, devolverla tal cual
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Modificar la función para obtener la ubicación correcta
const getCorrectLocation = (property) => {
  // Si es una propiedad de MongoDB
  if (property._id) {
    return property.location || property.address || "Ubicación no disponible";
  }
  
  // Si es una propiedad de WordPress
  if (property.meta_data) {
    // Buscar en meta_data primero
    const addressMeta = property.meta_data.find(meta => 
      meta.key === "address" || meta.key === "Ubicación" || meta.key === "ubicacion"
    );
    if (addressMeta && addressMeta.value) {
      return typeof addressMeta.value === 'object' 
        ? addressMeta.value.address || addressMeta.value.name || "Ubicación no disponible"
        : addressMeta.value;
    }
  }
  
  // Si no se encontró en meta_data, usar short_description
  if (property.short_description) {
    return property.short_description;
  }
  
  // Extraer del nombre si contiene una dirección
  if (property.name && 
      (property.name.includes("Calle") || property.name.includes("Avenida") || 
       property.name.includes("Plaza"))) {
    return property.name;
  }
  
  return "Ubicación no disponible";
};

// Función para extraer tipos de propiedades (nueva, para SEO)
const extractPropertyTypes = (properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return ["Viviendas", "Apartamentos", "Propiedades"];
  }

  const types = properties
    .map(p => {
      if (p.typeProperty) return p.typeProperty;
      if (p.meta_data) {
        const typeMeta = p.meta_data.find(meta => 
          meta.key === "property_type" || meta.key === "tipo" || meta.key === "type"
        );
        return typeMeta?.value || null;
      }
      return null;
    })
    .filter(Boolean);

  // Devolver tipos únicos o valores predeterminados si no hay suficientes
  return [...new Set(types)].length > 0 
    ? [...new Set(types)]
    : ["Viviendas", "Apartamentos", "Propiedades"];
};

// Función para extraer ubicaciones principales (nueva, para SEO)
const extractLocations = (properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return ["Madrid", "España"];
  }

  // Extraer ubicaciones de todas las propiedades
  const locations = properties
    .map(p => getCorrectLocation(p))
    .filter(Boolean)
    .map(loc => {
      // Extraer solo la ciudad/zona
      const parts = loc.split(',');
      return parts[0].trim();
    });

  // Devolver ubicaciones únicas o valores predeterminados
  return [...new Set(locations)].length > 0
    ? [...new Set(locations)]
    : ["Madrid", "España"];
};

export default function PropertyPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partialLoading, setPartialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Para SEO - Metadatos dinámicos
  const [pageTitle, setPageTitle] = useState('Propiedades Inmobiliarias en Madrid | Goza Madrid');
  const [pageDescription, setPageDescription] = useState('Descubra nuestra selección de propiedades inmobiliarias en Madrid. Apartamentos, casas, chalets y locales comerciales disponibles para compra y alquiler.');

  // Modificar el número de propiedades por página
  const propertiesPerPage = 10;

  // Efecto para asegurar que tenemos la URL correcta para el SEO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Preparar el Schema.org para la lista de propiedades
  const generatePropertyListSchema = () => {
    // Solo generar si tenemos propiedades
    if (!Array.isArray(properties) || properties.length === 0) {
      return null;
    }

    // Extraer tipos de propiedades y ubicaciones para mejorar el SEO
    const propertyTypes = extractPropertyTypes(properties);
    const locations = extractLocations(properties);

    // Generar schema.org para la lista de propiedades
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": properties.map((property, index) => {
        // Determinar si es una propiedad de WordPress o de MongoDB
        const isWordPressProperty = property.source === 'woocommerce';
        const isMongoDBProperty = property.source === 'mongodb';
        
        // Extraer los datos según el tipo de propiedad
        const id = isWordPressProperty ? property.id : property._id;
        let title = "";

        if (isWordPressProperty) {
          title = property.name || "Propiedad sin título";
        } else if (isMongoDBProperty) {
          title = property.title || property.name || "Propiedad sin título";
        }

        // Extraer la ubicación
        const location = getCorrectLocation(property);

        // Extraer precio
        let price = "Consultar";
        if (isWordPressProperty && property.price) {
          price = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(parseInt(property.price));
        } else if (isMongoDBProperty && property.price) {
          // Convertir el precio a número si es una cadena
          let numericPrice;
          if (typeof property.price === 'string') {
            // Eliminar cualquier carácter que no sea número o punto
            const cleanPrice = property.price.replace(/[^\d.-]/g, '');
            numericPrice = parseFloat(cleanPrice);
            
            // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
            // Esto es para corregir casos donde el precio se guarda como "350" en lugar de "350000"
            if (!isNaN(numericPrice) && numericPrice < 10000) {
              numericPrice = numericPrice * 1000;
            }
          } else {
            numericPrice = property.price;
            // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
            if (numericPrice < 10000) {
              numericPrice = numericPrice * 1000;
            }
          }
          
          price = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(numericPrice);
        }

        // Obtener la imagen principal
        let mainImage = '/img/default-property-image.jpg';
        
        if (isWordPressProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          if (typeof firstImage === 'string') {
            mainImage = firstImage;
          } else if (typeof firstImage === 'object') {
            mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
          }
        } else if (isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          if (typeof firstImage === 'string') {
            mainImage = firstImage;
          } else if (typeof firstImage === 'object') {
            mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
          }
        }
        
        // Procesar la URL de la imagen
        const imageUrl = getProxiedImageUrl(mainImage);

        // Formatear precio para schema.org
        let priceValue = null;
        if (typeof price === 'number') {
          priceValue = price;
        } else if (typeof price === 'string' && !isNaN(parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')))) {
          priceValue = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
        }

        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": title,
            "description": `${title} ubicada en ${location}`,
            "image": imageUrl,
            "url": `https://www.realestategozamadrid.com/property/${id}`,
            "category": property.typeProperty || "Propiedad inmobiliaria",
            "offers": priceValue ? {
              "@type": "Offer",
              "priceCurrency": "EUR",
              "price": priceValue,
              "availability": "https://schema.org/InStock"
            } : undefined
          }
        };
      })
    };
  };

  useEffect(() => {
    const fetchProperties = async () => {
      if (!router.isReady || initialized) return;

      try {
        setLoading(true);
        setError(null);
        
        const data = await getPropertyPosts();
        
        if (!data || !Array.isArray(data)) {
          throw new Error('No se recibieron datos válidos de las propiedades');
        }

        const mongoDBProperties = data.filter(p => p.source === 'mongodb');
        const wordPressProperties = data.filter(p => p.source === 'woocommerce');
        const reorderedData = [...mongoDBProperties, ...wordPressProperties];
        
        setProperties(reorderedData);
        setTotalPages(Math.ceil(reorderedData.length / propertiesPerPage));
        setInitialized(true);

        if (reorderedData.length > 0) {
          const propertyTypes = extractPropertyTypes(reorderedData);
          const locations = extractLocations(reorderedData);
          
          setPageTitle(`${propertyTypes.slice(0, 2).join(', ')} en ${locations.slice(0, 2).join(', ')} | Goza Madrid`);
          setPageDescription(`Explore nuestra selección de ${propertyTypes.slice(0, 3).join(', ')} disponibles en ${locations.slice(0, 3).join(', ')}. Encuentre su propiedad ideal con Goza Madrid.`);
        }
      } catch (err) {
        console.error("Error al cargar propiedades:", err);
        setError(err.message || "No pudimos cargar las propiedades. Por favor, intenta de nuevo más tarde.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [router.isReady, propertiesPerPage, initialized]);

  // Filtrar propiedades asegurando que properties es un array
  const filteredProperties = Array.isArray(properties) 
    ? properties.filter((property) => {
        const searchField = property.name || property.title || "";
        return searchField.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  // Función para el manejo del cambio de página
  const handlePageChange = useCallback((pageNumber) => {
    if (pageNumber === currentPage) return;
    
    setCurrentPage(pageNumber);
    setPartialLoading(true);
    
    // Simular carga parcial
    setTimeout(() => {
      setPartialLoading(false);
    }, 300);
  }, [currentPage]);

  // Función para obtener las propiedades actuales según la página
  const getCurrentProperties = useCallback(() => {
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    return filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  }, [currentPage, filteredProperties, propertiesPerPage]);

  // Cuando el usuario busca, resetear a la primera página
  useEffect(() => {
    if (searchTerm !== "" && currentPage !== 1) {
      setCurrentPage(1);
      
      // Actualizar la URL para reflejar el cambio de página
      if (router.isReady) {
        router.push({
          pathname: router.pathname,
          query: { ...router.query, page: 1 }
        }, undefined, { shallow: true });
      }
    }
  }, [searchTerm, currentPage, router]);

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24">
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
            <p className="text-lg text-white font-medium mb-2 text-shadow-sm">Cargando propiedades...</p>
            <p className="text-sm text-gray-300">Esto puede tardar unos segundos</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-6xl mb-4">
              <i className="mdi mdi-alert-circle"></i>
            </div>
            <h3 className="text-xl text-white font-semibold mb-2">Algo salió mal</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => {
                setLoading(true);
                setError(null);
                setInitialized(false);
              }}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay propiedades para mostrar
  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <>
        <Head>
          <title>Propiedades no disponibles | Goza Madrid</title>
          <meta name="description" content="Actualmente no hay propiedades disponibles. Por favor, vuelve a consultar más tarde o contacta con nosotros para ayudarte a encontrar tu propiedad ideal." />
          <meta name="robots" content="noindex,follow" />
        </Head>
        <div className="container mx-auto py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No hay propiedades disponibles</h1>
            <p className="text-gray-600 mb-8">Por favor, vuelve a consultar más tarde.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-amarillo hover:bg-amarillo/80 text-white font-bold py-2 px-4 rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      </>
    );
  }

  // Generar Schema.org JSON-LD
  const propertyListSchema = generatePropertyListSchema();

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={currentUrl} />
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:image" content="https://www.realestategozamadrid.com/og-image-properties.jpg" />
        <meta property="og:site_name" content="Goza Madrid" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.realestategozamadrid.com/twitter-image-properties.jpg" />
        
        {/* Schema.org structured data */}
        {propertyListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyListSchema) }}
          />
        )}
      </Head>

      {/* Fondo */}
      <div 
        className="fixed inset-0 z-0 opacity-90"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url("/gozamadridwp2.jpg")',
          
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      ></div>

      <div className="relative min-h-screen py-12">
        <main className="relative container mx-auto px-4">
          <div className="layout-specing">
            <div className="md:flex justify-center items-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-center text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Propiedades Exclusivas
                <span className="block text-xl md:text-2xl mt-2 font-light text-amarillo">
                  Inversiones Premium en Madrid
                </span>
              </h1>
            </div>

            {/* Buscador por dirección */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <input
                  id="property-search"
                  type="text"
                  placeholder="Buscar por ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 pl-6 border-2 border-amarillo/30 rounded-xl shadow-xl focus:outline-none focus:border-amarillo bg-black/20 backdrop-blur-md text-white placeholder-gray-400 transition-all duration-300"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                  aria-label="Buscar propiedades por dirección"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-amarillo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lista de propiedades en grid */}
            {filteredProperties && filteredProperties.length > 0 ? (
              <section 
                aria-label="Listado de propiedades"
                className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-8 mt-8"
              >
                {getCurrentProperties().map((property, index) => {
                  // Determinar si es una propiedad de WordPress o de MongoDB
                  const isWordPressProperty = property.source === 'woocommerce';
                  const isMongoDBProperty = property.source === 'mongodb';
                  
                  // Extraer los datos según el tipo de propiedad
                  const id = isWordPressProperty ? property.id : property._id;
                  
                  // Obtener el título de la propiedad (nombre de la calle para propiedades españolas)
                  let title = "";
                  if (isWordPressProperty) {
                    title = property.name || "Propiedad sin título";
                  } else if (isMongoDBProperty) {
                    title = property.title || property.name || "Propiedad sin título";
                  }
                  
                  // Obtener la descripción
                  const description = property.description || "Sin descripción disponible";
                  
                  // Obtener la ubicación
                  const location = property.name || getCorrectLocation(property);
                  
                  // Extraer el precio y formatear sin decimales
                  let price = "Consultar";
                  if (isWordPressProperty && property.price) {
                    price = new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(parseInt(property.price));
                  } else if (isMongoDBProperty && property.price) {
                    // Convertir el precio a número si es una cadena
                    let numericPrice;
                    if (typeof property.price === 'string') {
                      // Eliminar cualquier carácter que no sea número o punto
                      const cleanPrice = property.price.replace(/[^\d.-]/g, '');
                      numericPrice = parseFloat(cleanPrice);
                      
                      // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
                      // Esto es para corregir casos donde el precio se guarda como "350" en lugar de "350000"
                      if (!isNaN(numericPrice) && numericPrice < 10000) {
                        numericPrice = numericPrice * 1000;
                      }
                    } else {
                      numericPrice = property.price;
                      // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
                      if (numericPrice < 10000) {
                        numericPrice = numericPrice * 1000;
                      }
                    }
                    
                    price = new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(numericPrice);
                  }
                  
                  // Obtener características
                  let bedrooms = 0;
                  let bathrooms = 0;
                  let size = 0;

                  if (isWordPressProperty) {
                    // Buscar en meta_data para WordPress
                    if (property.meta_data) {
                      const livingArea = property.meta_data.find(meta => meta.key === "living_area");
                      const bedroomsData = property.meta_data.find(meta => meta.key === "bedrooms");
                      const banosData = property.meta_data.find(meta => meta.key === "baños");
                      
                      size = livingArea ? parseInt(livingArea.value) || 0 : 0;
                      bedrooms = bedroomsData ? parseInt(bedroomsData.value) || 0 : 0;
                      bathrooms = banosData ? parseInt(banosData.value) || 0 : 0;

                      // Si los baños son -1 (valor por defecto), establecer a 0
                      if (bathrooms < 0) bathrooms = 0;
                    }
                  } else if (isMongoDBProperty) {
                    bedrooms = property.bedrooms || 0;
                    bathrooms = property.bathrooms || 0;
                    size = property.size || 0;
                  }
                  
                  // Obtener la imagen principal
                  let mainImage = '/img/default-property-image.jpg';
                  
                  if (isWordPressProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
                    const firstImage = property.images[0];
                    if (typeof firstImage === 'string') {
                      mainImage = firstImage;
                    } else if (typeof firstImage === 'object') {
                      mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
                    }
                  } else if (isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
                    const firstImage = property.images[0];
                    if (typeof firstImage === 'string') {
                      mainImage = firstImage;
                    } else if (typeof firstImage === 'object') {
                      mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
                    }
                  }
                  
                  // Procesar la URL de la imagen
                  const imageUrl = getProxiedImageUrl(mainImage);
                  
                  return (
                    <motion.div
                      key={id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.1, 0.3) }}
                      viewport={{ once: true }}
                      className="group bg-black/30 backdrop-blur-md rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-amarillo/20 transition-all duration-500 transform hover:scale-[1.02]"
                    >
                      <Link
                        href={`/property/${id}`}
                        className="block"
                        onClick={(e) => {
                          // Prevenir la navegación por defecto y usar programática
                          e.preventDefault();
                          
                          // Limpiar el ID y asegurarse que es una cadena
                          const cleanId = String(id).trim();
                          
                          // Determinar el origen de la propiedad basado en el ID
                          // Si contiene letras y tiene más de 10 caracteres, es de MongoDB
                          const isMongoProperty = /[a-zA-Z]/.test(cleanId) && cleanId.length > 10;
                          
                          // Crear URL con el origen correcto
                          const url = `/property/${cleanId}?source=${isMongoProperty ? 'mongodb' : 'woocommerce'}`;
                          
                          // Navegar programáticamente
                          window.location.href = url;
                        }}
                      >
                        <div className="relative">
                          <div className="relative w-full aspect-[16/10] overflow-hidden">
                            <PropertyImage 
                              src={imageUrl}
                              alt={title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          <div className="absolute top-4 end-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:text-amarillo transition-colors duration-300"
                            >
                              <i className="mdi mdi-heart text-2xl"></i>
                            </button>
                          </div>

                          {price !== "Consultar" && (
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <span className="text-amarillo font-semibold">{price}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="pb-6">
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-amarillo transition-colors duration-300">
                              {location}
                            </h3>
                            {title !== location && (
                              <p className="text-sm text-gray-300">
                                {title}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-white/10">
                            <div className="text-center">
                              <FaRulerCombined className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Superficie</span>
                              <span className="text-white font-medium">{size} m²</span>
                            </div>
                            <div className="text-center">
                              <FaBed className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Habitaciones</span>
                              <span className="text-white font-medium">{bedrooms}</span>
                            </div>
                            <div className="text-center">
                              <FaBath className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Baños</span>
                              <span className="text-white font-medium">{bathrooms}</span>
                            </div>
                          </div>

                          <div className="pt-6 flex justify-between items-center">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-amarillo mr-2" />
                              <span className="text-sm text-gray-300">Madrid</span>
                            </div>
                            <button className="px-4 py-2 bg-amarillo/10 text-amarillo rounded-lg hover:bg-amarillo hover:text-black transition-all duration-300">
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </section>
            ) : (
              <div className="flex justify-center items-center py-12">
                <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl text-center max-w-lg">
                  <p className="text-xl text-white font-light">
                    No hay propiedades disponibles que coincidan con su búsqueda.
                  </p>
                </div>
              </div>
            )}

            {/* Paginación con estilo mejorado */}
            <div className="mt-12">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
