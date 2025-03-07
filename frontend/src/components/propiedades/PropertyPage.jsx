"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import AnimatedOnScroll from "../AnimatedScroll";
import { getPropertyPosts } from "../../pages/api";
import PropertyImage from './PropertyImage';
import Head from 'next/head';

// Estilos consistentes con el resto de la web
const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' };

// Componente de Paginación
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const router = useRouter();
  
  // Función para obtener todos los números de página
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
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

            {/* Todos los números de página */}
            {getPageNumbers().map((pageNumber) => (
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

// Función para transformar URLs de imágenes
const getProxiedImageUrl = (url) => {
  if (!url) return "/fondoamarillo.jpg";
  if (url.startsWith('/')) return url; // Imágenes locales
  
  // Para imágenes externas, usar un servicio de proxy
  // Esta es una solución temporal hasta que actualices next.config.js
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=webp`;
};

// Añadir esta función para corregir las ubicaciones
const getCorrectLocation = (property) => {
  // Si es una propiedad de MongoDB, usar la dirección tal cual
  if (property._id && property.address) {
    return property.address;
  }
  
  // Para propiedades de WordPress
  if (property.id) {
    // Usar el nombre de la propiedad como dirección principal
    const propertyName = property.name || '';
    
    // Si el nombre parece una dirección de Madrid, usarla
    if (/calle|avenida|plaza|paseo/i.test(propertyName)) {
      return propertyName + ', Madrid';
    }
    
    // Si hay una dirección en los metadatos
    if (property.meta_data) {
      const addressMeta = property.meta_data.find(meta => 
        meta.key === "direccion" || meta.key === "address" || meta.key === "location"
      );
      
      if (addressMeta && addressMeta.value) {
        // Si el valor es un objeto, intentar extraer la dirección
        if (typeof addressMeta.value === 'object') {
          // Intentar extraer campos comunes de dirección
          const addressObj = addressMeta.value;
          
          // Verificar si es una dirección extranjera por país o ciudad
          const isExtranjeraObj = 
            (addressObj.country && addressObj.country !== 'Spain' && addressObj.country !== 'España') ||
            (addressObj.country_short && addressObj.country_short !== 'ES') ||
            (addressObj.city && ['Kardinya', 'Berlin', 'Northcote'].includes(addressObj.city)) ||
            (addressObj.state && ['Western Australia', 'Victoria', 'WA', 'VIC'].includes(addressObj.state));
          
          // Si es extranjera, usar el nombre de la propiedad
          if (isExtranjeraObj) {
            return propertyName + ', Madrid';
          }
          
          // Si tiene un campo 'address', verificar que no sea extranjera
          if (addressObj.address && typeof addressObj.address === 'string') {
            if (!addressObj.address.includes("Australia") && 
                !addressObj.address.includes("Germany") && 
                !addressObj.address.includes("USA") &&
                !addressObj.address.includes("Loris Way") &&
                !addressObj.address.includes("High St")) {
              return addressObj.address;
            } else {
              return propertyName + ', Madrid';
            }
          }
          
          // Si todo falla, usar el nombre de la propiedad
          return propertyName + ', Madrid';
        } else {
          // Es un valor simple, convertir a string
          const addressValue = String(addressMeta.value);
          
          // Lista ampliada de términos extranjeros para filtrar
          const terminosExtranjeros = [
            "Australia", "Germany", "USA", "Loris Way", "High St", 
            "Kardinya", "Berlin", "Northcote", "WA", "VIC"
          ];
          
          // Verificar que no contenga ningún término extranjero
          const esExtranjera = terminosExtranjeros.some(termino => 
            addressValue.includes(termino)
          );
          
          if (!esExtranjera) {
            return addressValue;
          } else {
            return propertyName + ', Madrid';
          }
        }
      }
    }
    
    // Si todo falla, usar el nombre + Madrid
    return propertyName + ', Madrid';
  }
  
  return 'Madrid, España';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState('');

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
        const isWordPressProperty = property.id && !property._id;
        const isMongoDBProperty = property._id;
        
        // Extraer los datos según el tipo de propiedad
        const id = isWordPressProperty ? property.id : property._id;
        let title = "";

        if (isWordPressProperty) {
          title = property.name || "Propiedad sin título";
        } else if (isMongoDBProperty) {
          title = property.title || property.typeProperty || "Propiedad sin título";
        }

        // Extraer la ubicación
        const location = getCorrectLocation(property);

        // Extraer precio
        let price = "Consultar";
        if (isWordPressProperty && property.price) {
          price = property.price;
        } else if (isMongoDBProperty && property.price) {
          price = property.price;
        }

        // Extraer imagen
        let imageUrl = "/fondoamarillo.jpg";
        if (isWordPressProperty) {
          if (property.images && property.images.length > 0) {
            imageUrl = property.images[0].src;
          }
        } else if (isMongoDBProperty) {
          if (property.images && property.images.length > 0) {
            if (typeof property.images[0] === 'string') {
              imageUrl = property.images[0];
            } else if (property.images[0].src) {
              imageUrl = property.images[0].src;
            } else if (property.images[0].url) {
              imageUrl = property.images[0].url;
            }
          }
        }

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
            "url": `https://www.gozamadrid.com/property/${id}`,
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

  // Modifica este useEffect para manejar mejor los estados
  useEffect(() => {
    // Evitar procesamiento antes de que el router esté listo
    if (!router.isReady) return;
    
    const fetchPropertiesData = async () => {
      // Si ya estamos cargando, no hacer nada
      if (loading) return;
      
      // Obtener el número de página actual de la URL
      const pageToLoad = router.query.page ? parseInt(router.query.page) : 1;
      
      // Actualizar el estado de la página actual
      setCurrentPage(pageToLoad);
      
      // Cargar los datos
      setLoading(true);
      
      try {
        // Usar getPropertyPosts en lugar del fetch directo
        const data = await getPropertyPosts();
        
        // Verificar si hay propiedades de MongoDB
        const mongoDBProperties = data.filter(p => p._id);
        
        // Verificar si hay propiedades de WordPress
        const wordPressProperties = data.filter(p => p.id && !p._id);
        
        // Reordenar las propiedades para mostrar primero las de MongoDB
        const reorderedData = [...mongoDBProperties, ...wordPressProperties];
        
        // Como getPropertyPosts no incluye paginación, tenemos que implementarla manualmente
        const startIndex = (pageToLoad - 1) * propertiesPerPage;
        const endIndex = startIndex + propertiesPerPage;
        const paginatedData = reorderedData.slice(startIndex, endIndex);
        
        setProperties(paginatedData);
        
        // Calcular el número total de páginas
        const calculatedTotalPages = Math.ceil(reorderedData.length / propertiesPerPage);
        setTotalPages(calculatedTotalPages);

        // Actualizar metadatos dinámicos para SEO
        if (reorderedData.length > 0) {
          const propertyTypes = extractPropertyTypes(reorderedData);
          const locations = extractLocations(reorderedData);
          
          // Título dinámico basado en tipos y ubicaciones
          setPageTitle(`${propertyTypes.slice(0, 2).join(', ')} en ${locations.slice(0, 2).join(', ')} | Goza Madrid`);
          
          // Descripción dinámica
          setPageDescription(`Explore nuestra selección de ${propertyTypes.slice(0, 3).join(', ')} disponibles en ${locations.slice(0, 3).join(', ')}. Encuentre su propiedad ideal con Goza Madrid.`);
        }
      } catch (error) {
        console.error("Error al cargar propiedades:", error);
        setError("No pudimos cargar las propiedades. Por favor, intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertiesData();
  }, [router.isReady, router.query.page]);

  // Filtrar propiedades asegurando que properties es un array
  const filteredProperties = Array.isArray(properties) 
    ? properties.filter((property) => {
        const searchField = property.name || property.title || "";
        return searchField.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  // Función simplificada para el manejo del cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage) return;
    
    setCurrentPage(pageNumber); // Actualizar inmediatamente el currentPage
    // No necesitas hacer fetchProperties aquí, el useEffect se encargará de eso
  };

  // Eliminar useCallback para getCurrentProperties
  const getCurrentProperties = () => {
    return filteredProperties;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mb-4"></div>
            <p className="text-lg text-white" style={textShadowStyle}>Cargando propiedades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center max-w-xl">
          <h2 className="text-2xl font-bold text-white mb-4" style={textShadowStyle}>
            Algo salió mal
          </h2>
          <p className="text-white/90 mb-6" style={textShadowLightStyle}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300"
            aria-label="Reintentar cargar las propiedades"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay propiedades para mostrar
  if (properties.length === 0) {
    return (
      <>
        <Head>
          <title>Propiedades no disponibles | Goza Madrid</title>
          <meta name="description" content="Actualmente no hay propiedades disponibles. Por favor, vuelve a consultar más tarde o contacta con nosotros para ayudarte a encontrar tu propiedad ideal." />
          <meta name="robots" content="noindex,follow" />
        </Head>
        <div className="container mx-auto py-12">
          <div className="relative h-[40vh] mb-16 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
            <Image
              src="/real-estate.jpg"
              alt="Propiedades Inmobiliarias"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="text-white ml-4 sm:ml-8 md:ml-12 max-w-2xl">
                <h1 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                  style={textShadowStyle}
                >
                  Nuestras Propiedades
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl" style={textShadowLightStyle}>
                  No hay propiedades disponibles en este momento. Por favor, vuelve a consultar más tarde.
                </p>
              </div>
            </div>
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
        <meta property="og:image" content="https://www.gozamadrid.com/og-image-properties.jpg" />
        <meta property="og:site_name" content="Goza Madrid" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.gozamadrid.com/twitter-image-properties.jpg" />
        
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
        className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
        style={{
          backgroundImage: "url('/gozamadridwp2.jpg')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      ></div>

      <div className="relative min-h-screen py-8">
        <AnimatedOnScroll>
          <main className="relative container mx-auto px-3">
            <div className="layout-specing">
              <div className="md:flex justify-center items-center mb-8">
                <h1 className="text-3xl font-semibold text-center">
                  Propiedades inmobiliarias en venta y alquiler
                </h1>
              </div>

              {/* Buscador por dirección */}
              <div className="mb-8 flex justify-center">
                <label className="sr-only" htmlFor="property-search">Buscar propiedades por dirección</label>
                <input
                  id="property-search"
                  type="text"
                  placeholder="Buscar por dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  aria-label="Buscar propiedades por dirección"
                />
              </div>

              {/* Lista de propiedades en grid */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <section 
                  aria-label="Listado de propiedades"
                  className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mt-6"
                >
                  {getCurrentProperties().map((property, index) => {
                    // Determinar si es una propiedad de WordPress o de MongoDB
                    const isWordPressProperty = property.id && !property._id;
                    const isMongoDBProperty = property._id;
                    
                    // Extraer los datos según el tipo de propiedad
                    const id = isWordPressProperty ? property.id : property._id;
                    let title = "";

                    if (isWordPressProperty) {
                      title = property.name || "Propiedad sin título";
                    } else if (isMongoDBProperty) {
                      // Para propiedades de MongoDB, usar title o typeProperty
                      title = property.title || property.typeProperty || "Propiedad sin título";
                      
                      // Si solo tenemos el tipo de propiedad, agregar la ubicación para hacerlo más descriptivo
                      if (!property.title && property.typeProperty && property.address) {
                        title = `${property.typeProperty} en ${property.address}`;
                      }
                    }

                    const description = isWordPressProperty 
                      ? property.description 
                      : (property.description || "Sin descripción disponible");

                    // Extraer la ubicación
                    let location = "Ubicación no disponible";
                    if (isWordPressProperty) {
                      // Para propiedades de WordPress
                      if (property.meta_data) {
                        // Buscar en meta_data primero
                        const addressMeta = property.meta_data.find(meta => 
                          meta.key === "address" || meta.key === "Ubicación" || meta.key === "ubicacion"
                        );
                        if (addressMeta && addressMeta.value) {
                          location = typeof addressMeta.value === 'object' 
                            ? addressMeta.value.address || addressMeta.value.name || "Ubicación no disponible"
                            : addressMeta.value;
                        }
                      }
                      
                      // Si no se encontró en meta_data, usar short_description
                      if (location === "Ubicación no disponible" && property.short_description) {
                        location = property.short_description;
                      }
                      
                      // Extraer del nombre si contiene una dirección
                      if (location === "Ubicación no disponible" && property.name && 
                          (property.name.includes("Calle") || property.name.includes("Avenida") || 
                           property.name.includes("Plaza"))) {
                        location = property.name;
                      }
                    } else if (isMongoDBProperty) {
                      // Para propiedades de MongoDB
                      location = property.address || "Ubicación no disponible";
                    }

                    // Extraer el precio y formatear sin decimales
                    let price = "Consultar";
                    if (isWordPressProperty && property.price) {
                      price = property.price;
                    } else if (isMongoDBProperty && property.price) {
                      // Para propiedades de MongoDB, verificar si el precio necesita ajuste
                      price = property.price;
                      
                      // Si el precio es un número pequeño (menos de 1000), podría ser que falten los miles
                      if (!isNaN(parseFloat(price)) && parseFloat(price) < 1000) {
                        // Multiplicar por 1000 para convertir a miles
                        price = parseFloat(price) * 1000;
                      }
                    }

                    // Convertir el precio a número si es posible
                    if (typeof price === 'string') {
                      // Eliminar símbolos de moneda y separadores
                      const cleanPrice = price.replace(/[^\d.,]/g, '').replace(',', '.');
                      if (!isNaN(parseFloat(cleanPrice))) {
                        price = parseFloat(cleanPrice);
                      }
                    }

                    // Extraer información de habitaciones y baños
                    let bedrooms = "Consultar";
                    let bathrooms = "Consultar";
                    
                    if (isWordPressProperty) {
                      // Para propiedades de WordPress
                      if (property.meta_data) {
                        // Buscar habitaciones en meta_data
                        const bedroomsMeta = property.meta_data.find(meta => 
                          meta.key === "bedrooms" || meta.key === "habitaciones"
                        );
                        if (bedroomsMeta && bedroomsMeta.value) {
                          bedrooms = bedroomsMeta.value;
                        }
                        
                        // Buscar baños en meta_data
                        const bathroomsMeta = property.meta_data.find(meta => 
                          meta.key === "baños" || meta.key === "bathrooms" || meta.key === "banos"
                        );
                        if (bathroomsMeta && bathroomsMeta.value && bathroomsMeta.value !== "-1") {
                          bathrooms = bathroomsMeta.value;
                        }
                      }
                      
                      // Buscar en la descripción si no se encontró en meta_data
                      if (bedrooms === "Consultar" && property.description) {
                        const bedroomsMatch = property.description.match(/(\d+)\s*habitaciones/i);
                      if (bedroomsMatch) {
                        bedrooms = bedroomsMatch[1];
                      }
                    }
                    
                      if (bathrooms === "Consultar" && property.description) {
                        const bathroomsMatch = property.description.match(/(\d+)\s*baños/i);
                      if (bathroomsMatch) {
                        bathrooms = bathroomsMatch[1];
                        }
                      }
                    } else if (isMongoDBProperty) {
                      // Para propiedades de MongoDB
                      bedrooms = property.bedrooms || property.rooms || "Consultar";
                      bathrooms = property.bathrooms || property.wc || "Consultar";
                    }
                    
                    // Determinar la URL de la imagen
                    let imageUrl = "/fondoamarillo.jpg"; // Imagen por defecto
                    if (isWordPressProperty) {
                      // Para propiedades de WordPress
                      if (property.images && property.images.length > 0) {
                        imageUrl = property.images[0].src;
                      }
                    } else if (isMongoDBProperty) {
                      // Para propiedades de MongoDB
                      if (property.images && property.images.length > 0) {
                        // Verificar la estructura de las imágenes
                        if (typeof property.images[0] === 'string') {
                          imageUrl = property.images[0];
                        } else if (property.images[0].src) {
                          imageUrl = property.images[0].src;
                        } else if (property.images[0].url) {
                          imageUrl = property.images[0].url;
                        }
                      }
                    }
                    
                    
                    
                    
                    // Renderizar la propiedad
                    return (
                      <motion.div
                        key={id || index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.03]"
                      >
                        <Link
                          href={`/property/${id}`}
                          className="group block rounded-xl dark:text-white dark:hover:text-black bg-white dark:bg-slate-900 shadow hover:bg-gold dark:hover:shadow-xl dark:shadow-gray-700 dark:hover:shadow-gray-700 overflow-hidden ease-in-out duration-500"
                        >
                          <div className="relative">
                            <div className="relative w-full aspect-video">
                              <PropertyImage 
                                  src={imageUrl}
                                  alt={title}
                                className="w-full h-full"
                              />
                            </div>

                            <div className="absolute top-4 end-4">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Aquí la lógica para "like" si lo deseas
                                }}
                                className="btn btn-icon bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-full text-slate-100 dark:text-slate-700 focus:text-red-600 dark:focus:text-red-600 hover:text-red-600 dark:hover:text-red-600"
                              >
                                <i className="mdi mdi-heart text-[20px]"></i>
                              </button>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="pb-6">
                              {/* Mostrar la dirección como título principal */}
                              <h3 className="text-lg hover:text-amarillo font-medium ease-in-out duration-500">
                                {getCorrectLocation(property)}
                              </h3>
                              {/* Mostrar el título original como subtítulo si es diferente de la dirección */}
                              {title !== getCorrectLocation(property) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {title}
                                </p>
                              )}
                            </div>

                            <ul className="py-6 border-y border-slate-100 dark:border-gray-800 flex flex-wrap items-center list-none">
                              {/* Superficie en lugar de tipo de propiedad */}
                              <li className="flex items-center me-4 mb-2">
                                <i className="mdi mdi-arrow-expand-all text-2xl me-2 text-amarillo"></i>
                                <span>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400">Superficie</span>
                                  {property.area || property.superficie || 
                                   (property.meta_data?.find(m => m.key === 'area' || m.key === 'superficie' || m.key === 'living_area')?.value) || 
                                   "Consultar"} 
                                  {property.area || property.superficie || property.meta_data?.find(m => m.key === 'area' || m.key === 'superficie' || m.key === 'living_area')?.value ? "m²" : ""}
                                </span>
                              </li>
                              {/* Habitaciones */}
                              <li className="flex items-center me-4 mb-2">
                                <i className="mdi mdi-bed text-2xl me-2 text-amarillo"></i>
                                <span>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400">Habitaciones</span>
                                  {bedrooms} {bedrooms !== "Consultar" ? "" : ""}
                                </span>
                              </li>
                              {/* Baños */}
                              <li className="flex items-center me-4 mb-2">
                                <i className="mdi mdi-shower text-2xl me-2 text-amarillo"></i>
                                <span>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400">Baños</span>
                                  {bathrooms} {bathrooms !== "Consultar" ? "" : ""}
                                </span>
                              </li>
                            </ul>

                            <ul className="pt-6 flex justify-between items-center list-none">
                              <li>
                                <span>Precio</span>
                                <p className="text-lg font-medium">
                                  {typeof price === 'number' 
                                    ? new Intl.NumberFormat('es-ES', { 
                                        style: 'currency', 
                                        currency: 'EUR',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0 
                                      }).format(price)
                                    : price === 0 || !price 
                                      ? "Consultar" 
                                      : typeof price === 'string' ? price : "Consultar"
                                  }
                                </p>
                              </li>
                            </ul>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </section>
              ) : (
                <p className="text-center text-gray-500">
                  No hay propiedades disponibles.
                </p>
              )}

              {/* Componente de paginación */}
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </main>
        </AnimatedOnScroll>
      </div>
    </>
  );
}
