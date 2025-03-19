"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import { getPropertyPosts } from "../../pages/api";
import PropertyImage from './PropertyImage';
import LoadingFallback from './LoadingFallback';
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
  if (!url) {
    console.log("PropertyPage - URL nula o indefinida, usando imagen por defecto");
    return '/img/default-property-image.jpg';
  }
  
  console.log("PropertyPage - URL original:", url);
  
  // Asegurarse de que url sea una cadena de texto
  if (typeof url !== 'string') {
    // Si es un objeto con src o url, usar esa propiedad
    if (url && typeof url === 'object') {
      console.log("PropertyPage - URL es un objeto:", url);
      if (url.src) {
        console.log("PropertyPage - Usando url.src:", url.src);
        return getProxiedImageUrl(url.src);
      }
      if (url.url) {
        console.log("PropertyPage - Usando url.url:", url.url);
        return getProxiedImageUrl(url.url);
      }
      if (url.source_url) {
        console.log("PropertyPage - Usando url.source_url:", url.source_url);
        return getProxiedImageUrl(url.source_url);
      }
    }
    // Si no es una cadena ni un objeto con src/url, devolver la imagen por defecto
    console.log("PropertyPage - URL no válida, usando imagen por defecto");
    return '/img/default-property-image.jpg';
  }
  
  // Si ya es una URL de proxy, devolverla tal cual
  if (url.includes('images.weserv.nl')) {
    console.log("PropertyPage - URL ya es proxy, devolviendo tal cual:", url);
    return url;
  }
  
  // Si es una ruta relativa, construir la URL completa
  if (!url.startsWith('http') && !url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    console.log("PropertyPage - URL relativa convertida a absoluta:", url);
  }
  
  // Para URLs externas, usar un servicio de proxy para evitar errores CORS y QUIC_PROTOCOL_ERROR
  if (url.startsWith('http')) {
    // Usar images.weserv.nl como proxy confiable con configuración básica
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1&default=https://via.placeholder.com/800x600?text=Sin+Imagen`;
    console.log("PropertyPage - URL convertida a proxy:", proxyUrl);
    return proxyUrl;
  }
  
  // Si es una ruta local, devolverla tal cual
  console.log("PropertyPage - URL local, devolviendo tal cual:", url);
  return url;
};

// Modificar la función para obtener la ubicación correcta
const getCorrectLocation = (property) => {
  // Si es una propiedad de MongoDB
  if (property._id) {
    return property.location || property.address || "Ubicación no disponible";
  }
  
  // Si es una propiedad de WordPress con campo address directo
  if (property.address) {
    return property.address;
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
  // Estado para tracking de renderizaciones
  const renderCountRef = useRef(0);

  // Para SEO - Metadatos dinámicos
  const [pageTitle, setPageTitle] = useState('Propiedades Inmobiliarias en Madrid | Goza Madrid');
  const [pageDescription, setPageDescription] = useState('Descubra nuestra selección de propiedades inmobiliarias en Madrid. Apartamentos, casas, chalets y locales comerciales disponibles para compra y alquiler.');

  // Aumentar contador de renderizaciones
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[RENDERIZACIONES] PropertyPage renderizada ${renderCountRef.current} veces`);
  });

  // Modificar el número de propiedades por página - AUMENTADO A 30
  const propertiesPerPage = 30;

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
        const isWordPressProperty = 
          property.source === 'woocommerce' || 
          property.type === 'woocommerce' ||
          property.meta_data || 
          (property.id && typeof property.id === 'number') || 
          (property.id && typeof property.id === 'string' && property.id.length < 20 && !property._id);
        
        const isMongoDBProperty = 
          property.source === 'mongodb' || 
          property.type === 'mongodb' ||
          property._id || 
          (property.id && typeof property.id === 'string' && property.id.length > 20);
        
        // Extraer los datos según el tipo de propiedad
        const id = isWordPressProperty ? property.id : property._id;
        let title = "";

        if (isWordPressProperty) {
          title = property.name || "Propiedad sin título";
        } else if (isMongoDBProperty) {
          title = property.title || property.name || "Propiedad sin título";
        }

        // Extraer la ubicación
        const location = property.address || getCorrectLocation(property);

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
          console.log(`[DEBUG] Imagen WooCommerce para ID ${property.id}:`, firstImage);
          
          if (typeof firstImage === 'string') {
            mainImage = firstImage;
          } else if (typeof firstImage === 'object') {
            mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
          }
        } else if (isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          console.log(`[DEBUG] Imagen MongoDB para ID ${property._id}:`, firstImage);
          
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
        
        console.log("[DEBUG PropertyPage] Iniciando obtención de propiedades...");
        
        // Obtener la URL correcta de la API de las configuraciones
        const apiBaseUrl = (typeof window !== 'undefined' && window.appConfig && window.appConfig.frontendUrl) 
          ? window.appConfig.frontendUrl 
          : window.location.origin;
        
        const requestUrl = `${apiBaseUrl}/api/properties`;
        console.log("[DEBUG PropertyPage] Usando URL:", requestUrl);
        console.log("[DEBUG PropertyPage] Config disponible:", typeof window !== 'undefined' ? window.appConfig : 'No disponible');
        
        // Llamar al endpoint /api/properties con la URL base correcta
        const response = await fetch(requestUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[DEBUG PropertyPage] Error HTTP ${response.status}: ${response.statusText}`);
          console.error(`[DEBUG PropertyPage] Detalle del error:`, errorText);
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("[DEBUG PropertyPage] Resultado obtenido:", result);
        
        if (!result.properties || !Array.isArray(result.properties)) {
          console.error("[DEBUG PropertyPage] Los datos recibidos no son un array:", result);
          throw new Error('No se recibieron datos válidos de las propiedades');
        }
        
        const data = result.properties;
        console.log("[DEBUG PropertyPage] Propiedades recibidas:", data?.length || 0);
        
        // Preparar los datos para garantizar que tengan los campos necesarios
        const processedData = data.map(property => {
          // Asegurarse de que tiene todos los campos necesarios
          return {
            ...property,
            // Garantizar que tienen type y source
            type: property.type || (property._id ? 'mongodb' : 'woocommerce'),
            source: property.source || (property._id ? 'mongodb' : 'woocommerce'),
            // Nombre o título unificado
            title: property.title || property.name || 'Propiedad sin título',
            // Identificador único
            id: property.id || property._id
          };
        });
        
        // Separar propiedades por fuente
        const mongoDBProperties = processedData.filter(p => p.type === 'mongodb' || p.source === 'mongodb');
        const wordPressProperties = processedData.filter(p => p.type === 'woocommerce' || p.source === 'woocommerce');
        
        console.log("[DEBUG PropertyPage] Propiedades MongoDB:", mongoDBProperties.length);
        console.log("[DEBUG PropertyPage] Propiedades WooCommerce:", wordPressProperties.length);
        
        // Unir todas las propiedades
        const allProperties = [...mongoDBProperties, ...wordPressProperties];
        
        // Establecer el estado en un paso atómico para garantizar la actualización
        console.log(`[DEBUG] Actualizando estado con ${allProperties.length} propiedades`);
        
        // CAMBIO: Verificación adicional para garantizar que allProperties es un array válido
        if (Array.isArray(allProperties)) {
          console.log(`[DEBUG CRÍTICO] allProperties es un array válido con ${allProperties.length} elementos`);
          setProperties(allProperties);
          setTotalPages(Math.ceil(allProperties.length / propertiesPerPage));
          setInitialized(true);
        } else {
          console.error(`[DEBUG CRÍTICO] allProperties NO es un array válido:`, allProperties);
          setProperties([]);
          setError("No se pudieron procesar las propiedades correctamente");
        }
        
        setLoading(false);
        
        // Actualizar títulos y metadatos para SEO si tenemos propiedades
        if (allProperties.length > 0) {
          const propertyTypes = extractPropertyTypes(allProperties);
          const locations = extractLocations(allProperties);
          
          setPageTitle(`${propertyTypes.slice(0, 2).join(', ')} en ${locations.slice(0, 2).join(', ')} | Goza Madrid`);
          setPageDescription(`Explore nuestra selección de ${propertyTypes.slice(0, 3).join(', ')} disponibles en ${locations.slice(0, 3).join(', ')}. Encuentre su propiedad ideal con Goza Madrid.`);
        }
      } catch (err) {
        console.error("Error al cargar propiedades:", err);
        setError(err.message || "No pudimos cargar las propiedades. Por favor, intenta de nuevo más tarde.");
        setProperties([]);
        setLoading(false);
      }
    };

    fetchProperties();
  }, [router.isReady, propertiesPerPage, initialized]);

  // Filtrar propiedades asegurando que properties es un array
  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) {
      console.error("[DEBUG] 'properties' no es un array:", properties);
      return [];
    }
    
    console.log(`[DEBUG CRÍTICO] Estado actual del array properties: ${properties.length} propiedades`);
    
    // IMPORTANTE: No modificar los objetos originales, crear nuevos
    // Filtrar por término de búsqueda
    const filtered = properties.filter((property) => {
      // Verificar que property es un objeto válido
      if (!property || typeof property !== 'object') {
        console.error("[DEBUG] Propiedad no válida en el array:", property);
        return false;
      }
      
      const searchField = property.name || property.title || "";
      return searchField.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Contar por tipo para logs
    const mongoCount = filtered.filter(p => p.type === 'mongodb' || p.source === 'mongodb').length;
    const wooCount = filtered.filter(p => p.type === 'woocommerce' || p.source === 'woocommerce').length;
    
    console.log(`[DEBUG] Propiedades filtradas: ${filtered.length} (MongoDB: ${mongoCount}, WooCommerce: ${wooCount})`);
    
    return filtered;
  }, [properties, searchTerm]);

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
    
    // Verificar si hay propiedades y asegurar que son un array
    if (!Array.isArray(filteredProperties) || filteredProperties.length === 0) {
      console.log("[DEBUG] No hay propiedades filtradas para mostrar");
      return [];
    }
    
    // Obtener las propiedades para la página actual
    const currentProps = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
    
    // Contar por tipos para logs
    const mongoCount = currentProps.filter(p => p.type === 'mongodb' || p.source === 'mongodb').length;
    const wooCount = currentProps.filter(p => p.type === 'woocommerce' || p.source === 'woocommerce').length;
    
    console.log(`[DEBUG] Propiedades en página ${currentPage}: Total=${currentProps.length}, MongoDB=${mongoCount}, WooCommerce=${wooCount}`);
    
    return currentProps;
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
    return <LoadingFallback />;
  }

  // Renderizar estado de error
  if (error) {
    return (
      <LoadingFallback 
        error={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          setInitialized(false);
        }}
        debugInfo={{
          apiBaseUrl: typeof window !== 'undefined' && window.appConfig ? window.appConfig.frontendUrl : 'No disponible',
          apiUrl: typeof window !== 'undefined' && window.appConfig ? window.appConfig.apiUrl : 'No disponible',
          initialized,
          page: currentPage,
          searchTerm
        }}
      />
    );
  }

  // Si no hay propiedades para mostrar
  if (!Array.isArray(properties) || properties.length === 0) {
    console.error("[ERROR CRÍTICO] Array de propiedades vacío o no válido:", properties);
    return (
      <LoadingFallback 
        error="No hay propiedades disponibles"
        onRetry={() => window.location.reload()}
        debugInfo={{
          stateProperties: Array.isArray(properties) ? `Array con ${properties.length} elementos` : 'No es un array',
          filteredProperties: Array.isArray(filteredProperties) ? `Array con ${filteredProperties.length} elementos` : 'No es un array',
          loading,
          error,
          initialized,
          apiBaseUrl: typeof window !== 'undefined' && window.appConfig ? window.appConfig.frontendUrl : 'No disponible',
          apiUrl: typeof window !== 'undefined' && window.appConfig ? window.appConfig.apiUrl : 'No disponible'
        }}
      />
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

      {/* Panel de depuración - solo visible en desarrollo */}
      {typeof window !== 'undefined' && (window.appConfig?.debug || process.env.NODE_ENV === 'development') && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-4 rounded-lg shadow-lg text-xs font-mono max-w-xs overflow-auto max-h-80">
          <h4 className="font-bold text-amber-400 mb-2">DEBUG</h4>
          <p>Properties: {properties.length}</p>
          <p>Filtered: {filteredProperties.length}</p>
          <p>Current Page: {currentPage}</p>
          <p>Total Pages: {totalPages}</p>
          <p>MongoDB: {properties.filter(p => p.type === 'mongodb' || p.source === 'mongodb').length}</p>
          <p>WooCommerce: {properties.filter(p => p.type === 'woocommerce' || p.source === 'woocommerce').length}</p>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>Initialized: {initialized ? 'true' : 'false'}</p>
          <hr className="my-2 border-gray-600" />
          <button
            onClick={() => {
              console.log('Estado completo:', {
                properties,
                filteredProperties,
                currentProperties: getCurrentProperties()
              });
            }}
            className="bg-amber-500 text-black px-2 py-1 rounded text-xs"
          >
            Log Estado
          </button>
        </div>
      )}

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
            {Array.isArray(filteredProperties) && filteredProperties.length > 0 ? (
              <section 
                aria-label="Listado de propiedades"
                className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-8 mt-8"
              >
                {getCurrentProperties().map((property, index) => {
                  // Añadir logs de depuración para cada propiedad
                  console.log(`[DEBUG] Renderizando propiedad ${index}:`, 
                    JSON.stringify({
                      id: property.id || property._id,
                      title: property.title || property.name,
                      type: property.type,
                      source: property.source
                    })
                  );
                  
                  // Determinar si es una propiedad de WordPress o de MongoDB de diferentes maneras
                  const isWordPressProperty = 
                    property.source === 'woocommerce' || 
                    property.type === 'woocommerce' ||
                    property.meta_data || 
                    (property.id && typeof property.id === 'number') || 
                    (property.id && typeof property.id === 'string' && property.id.length < 20 && !property._id);
                  
                  const isMongoDBProperty = 
                    property.source === 'mongodb' || 
                    property.type === 'mongodb' ||
                    property._id || 
                    (property.id && typeof property.id === 'string' && property.id.length > 20);
                  
                  // Si el tipo no está explícitamente definido, añadirlo a la propiedad
                  if (!property.type && !property.source) {
                    if (isMongoDBProperty) {
                      property.type = 'mongodb';
                      property.source = 'mongodb';
                    } else if (isWordPressProperty) {
                      property.type = 'woocommerce';
                      property.source = 'woocommerce';
                    } else {
                      // Si no podemos determinar el tipo, asignar woocommerce por defecto
                      property.type = 'woocommerce';
                      property.source = 'woocommerce';
                      console.log(`[DEBUG] No se pudo determinar el tipo de la propiedad ${index}, asignando 'woocommerce' por defecto`);
                    }
                  }
                  
                  // Extraer los datos según el tipo de propiedad
                  const id = property.id || property._id;
                  
                  // Si no hay ID, mostrar un error y continuar con la siguiente propiedad
                  if (!id) {
                    console.error("[DEBUG] Propiedad sin ID detectada:", JSON.stringify(property, null, 2));
                    return null;
                  }
                  
                  // Obtener el título de la propiedad (nombre de la calle para propiedades españolas)
                  let title = "";
                  if (isWordPressProperty) {
                    title = property.title || property.name || "Propiedad sin título";
                  } else if (isMongoDBProperty) {
                    title = property.title || property.name || "Propiedad sin título";
                  } else {
                    // Si no podemos determinar la fuente, intentamos obtener el título de cualquier manera
                    title = property.title || property.name || "Propiedad sin título";
                  }
                  
                  // Obtener la descripción
                  const description = property.description || "Sin descripción disponible";
                  
                  // Obtener la ubicación - MODIFICADO para usar la dirección
                  const location = property.address || getCorrectLocation(property);
                  
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
                  
                  // Función para extraer valores de la descripción
                  const extractFromDescription = (description, patterns) => {
                    if (!description) return null;
                    
                    let text = description;
                    if (typeof text === 'string') {
                      // Eliminar etiquetas HTML para texto plano
                      text = text.replace(/<[^>]*>/g, ' ');
                    }
                    
                    for (const pattern of patterns) {
                      const regex = new RegExp(pattern, 'i');
                      const match = regex.exec(text);
                      if (match && match[1]) {
                        const value = match[1].trim().replace(/[^\d]/g, '');
                        return parseInt(value) || 0;
                      }
                    }
                    
                    return null;
                  };

                  if (isWordPressProperty) {
                    // Buscar en meta_data para WordPress
                    if (property.meta_data && Array.isArray(property.meta_data)) {
                      // Buscar el valor de área/superficie
                      const livingArea = property.meta_data.find(meta => 
                        meta.key === "living_area" || meta.key === "area" || meta.key === "m2" || meta.key === "superficie"
                      );
                      
                      // Buscar el valor de dormitorios/habitaciones
                      const bedroomsData = property.meta_data.find(meta => 
                        meta.key === "bedrooms" || meta.key === "habitaciones" || meta.key === "dormitorios"
                      );
                      
                      // Buscar el valor de baños - probar diferentes codificaciones de "baños"
                      const banosData = property.meta_data.find(meta => 
                        meta.key === "baños" || meta.key === "ba\\u00f1os" || meta.key === "bathrooms" || meta.key === "banos"
                      );
                      
                      // Extraer y convertir los valores a números
                      if (livingArea) {
                        const rawSize = typeof livingArea.value === 'string' ? livingArea.value.replace(/[^\d.-]/g, '') : livingArea.value;
                        size = parseInt(rawSize) || 0;
                      }
                      
                      if (bedroomsData) {
                        const rawBedrooms = typeof bedroomsData.value === 'string' ? bedroomsData.value.replace(/[^\d.-]/g, '') : bedroomsData.value;
                        bedrooms = parseInt(rawBedrooms) || 0;
                      }
                      
                      if (banosData) {
                        const rawBathrooms = typeof banosData.value === 'string' ? banosData.value.replace(/[^\d.-]/g, '') : banosData.value;
                        bathrooms = parseInt(rawBathrooms) || 0;
                      }
                    }
                    
                    // Si no se encontraron datos en meta_data, intentar extraer de la descripción
                    if (bedrooms === 0 || bathrooms === 0 || size === 0) {
                      // Extraer habitaciones de la descripción
                      if (bedrooms === 0) {
                        const bedroomsFromDesc = extractFromDescription(
                          property.description,
                          [
                            '(\\d+)\\s*habitaciones', 
                            '(\\d+)\\s*dormitorios', 
                            '(\\d+)\\s*habitación', 
                            '(\\d+)\\s*dormitorio',
                            '(\\d+)\\s*Habitaciones',
                            'habitaciones\\s*:\\s*(\\d+)',
                            'dormitorios\\s*:\\s*(\\d+)'
                          ]
                        );
                        if (bedroomsFromDesc !== null) {
                          bedrooms = bedroomsFromDesc;
                          console.log(`PropertyPage - Habitaciones extraídas de la descripción: ${bedrooms}`);
                        }
                      }
                      
                      // Extraer baños de la descripción
                      if (bathrooms === 0) {
                        const bathroomsFromDesc = extractFromDescription(
                          property.description,
                          [
                            '(\\d+)\\s*baños', 
                            '(\\d+)\\s*baño', 
                            '(\\d+)\\s*Baños',
                            '(\\d+)\\s*Baño',
                            '(\\d+)\\s*aseos',
                            '(\\d+)\\s*aseo',
                            'baños\\s*:\\s*(\\d+)',
                            'aseos\\s*:\\s*(\\d+)'
                          ]
                        );
                        if (bathroomsFromDesc !== null) {
                          bathrooms = bathroomsFromDesc;
                          console.log(`PropertyPage - Baños extraídos de la descripción: ${bathrooms}`);
                        } else if (property.description && property.description.toLowerCase().includes("baño")) {
                          // Si menciona "baño" pero no se puede extraer el número, asumir 1
                          bathrooms = 1;
                          console.log(`PropertyPage - Se asume 1 baño basado en la descripción`);
                        }
                      }
                      
                      // Extraer tamaño de la descripción
                      if (size === 0) {
                        const sizeFromDesc = extractFromDescription(
                          property.description,
                          [
                            '(\\d+)\\s*m²', 
                            '(\\d+)\\s*m2', 
                            '(\\d+)\\s*metros cuadrados',
                            '(\\d+)\\s*metros',
                            '(\\d+)\\s*M',
                            'superficie\\s*:\\s*(\\d+)',
                            'área\\s*:\\s*(\\d+)'
                          ]
                        );
                        if (sizeFromDesc !== null) {
                          size = sizeFromDesc;
                          console.log(`PropertyPage - Tamaño extraído de la descripción: ${size}`);
                        }
                      }
                    }

                    // Si los baños son -1 (valor por defecto), establecer a 0
                    if (bathrooms < 0) bathrooms = 0;
                    
                    console.log(`PropertyPage - Datos finales WooCommerce: bedrooms=${bedrooms}, bathrooms=${bathrooms}, size=${size}`);
                  } else if (isMongoDBProperty) {
                    // Convertir los valores de string a número para MongoDB
                    if (property.bedrooms) {
                      const rawBedrooms = typeof property.bedrooms === 'string' ? property.bedrooms.replace(/[^\d.-]/g, '') : property.bedrooms;
                      bedrooms = parseInt(rawBedrooms) || 0;
                    }
                    
                    if (property.bathrooms) {
                      const rawBathrooms = typeof property.bathrooms === 'string' ? property.bathrooms.replace(/[^\d.-]/g, '') : property.bathrooms;
                      bathrooms = parseInt(rawBathrooms) || 0;
                    }
                    
                    // Usar area o m2 para el tamaño
                    if (property.area) {
                      const rawArea = typeof property.area === 'string' ? property.area.replace(/[^\d.-]/g, '') : property.area;
                      size = parseInt(rawArea) || 0;
                    } else if (property.m2) {
                      const rawM2 = typeof property.m2 === 'string' ? property.m2.replace(/[^\d.-]/g, '') : property.m2;
                      size = parseInt(rawM2) || 0;
                    } else if (property.size) {
                      const rawSize = typeof property.size === 'string' ? property.size.replace(/[^\d.-]/g, '') : property.size;
                      size = parseInt(rawSize) || 0;
                    }
                    
                    console.log(`PropertyPage - Datos finales MongoDB: bedrooms=${bedrooms}, bathrooms=${bathrooms}, size=${size}`);
                  }
                  
                  // Obtener la imagen principal
                  let mainImage = '/img/default-property-image.jpg';
                  
                  if (isWordPressProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
                    const firstImage = property.images[0];
                    console.log(`[DEBUG] Imagen WooCommerce para ID ${property.id}:`, firstImage);
                    
                    if (typeof firstImage === 'string') {
                      mainImage = firstImage;
                    } else if (typeof firstImage === 'object') {
                      mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
                    }
                  } else if (isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
                    const firstImage = property.images[0];
                    console.log(`[DEBUG] Imagen MongoDB para ID ${property._id}:`, firstImage);
                    
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
                          
                          // Log detallado para depuración
                          console.log(`[NAVEGACIÓN DETALLADA] Propiedad completa:`, property);
                          console.log(`[NAVEGACIÓN DETALLADA] ID bruto: ${id}, _id: ${property._id}, tipo: ${property.type || property.source}`);

                          // SOLUCIÓN PARA MONGODB: asegurarse de que tenemos una ID válida
                          let validId = null;
                          
                          // Para propiedades de MongoDB
                          if (isMongoDBProperty) {
                            // Priorizar _id para MongoDB
                            if (property._id) {
                              validId = property._id.toString();
                              console.log(`[NAVEGACIÓN DETALLADA] Usando _id de MongoDB: ${validId}`);
                            }
                            // Si no hay _id pero hay id, usar id
                            else if (property.id) {
                              validId = property.id.toString();
                              console.log(`[NAVEGACIÓN DETALLADA] Usando id de MongoDB: ${validId}`);
                            }
                          } 
                          // Para propiedades de WooCommerce
                          else if (isWordPressProperty && property.id) {
                            validId = property.id.toString();
                            console.log(`[NAVEGACIÓN DETALLADA] Usando id de WooCommerce: ${validId}`);
                          }
                          
                          // Si no tenemos ID válido, no permitir la navegación
                          if (!validId) {
                            console.error("[ERROR CRÍTICO] No se pudo determinar un ID válido para la propiedad:", property);
                            return;
                          }
                          
                          // Log adicional
                          console.log(`[NAVEGACIÓN DETALLADA] ID válido final: ${validId}`);
                          
                          // Construir objeto para la navegación
                          const navigationPath = {
                            pathname: `/property/${validId}`,
                            query: { 
                              source: isMongoDBProperty ? 'mongodb' : 'woocommerce' 
                            }
                          };
                          
                          console.log(`[NAVEGACIÓN DETALLADA] Navegando a:`, navigationPath);
                          
                          // Navegar a la página de detalle
                          router.push(navigationPath);
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
                              {title}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {location}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-white/10">
                            <div className="text-center">
                              <FaRulerCombined className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Superficie</span>
                              <span className="text-white font-medium">{size || 'N/A'} {size ? 'm²' : ''}</span>
                            </div>
                            <div className="text-center">
                              <FaBed className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Habitaciones</span>
                              <span className="text-white font-medium">{bedrooms || (property.bedrooms || '0')}</span>
                            </div>
                            <div className="text-center">
                              <FaBath className="text-2xl mx-auto mb-2 text-amarillo" />
                              <span className="block text-xs text-gray-400">Baños</span>
                              <span className="text-white font-medium">{bathrooms || (property.bathrooms || '0')}</span>
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
              <div className="text-center py-12">
                <p className="text-lg">No se encontraron propiedades que coincidan con tu búsqueda.</p>
                <p className="mt-4 text-sm text-gray-500">Intenta con otros términos o reinicia la búsqueda.</p>
                <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg mt-4 text-left max-w-md mx-auto">
                  <p className="text-sm text-amber-400 font-mono">Debug:</p>
                  <p className="text-sm text-white font-mono">- Total propiedades cargadas: {properties.length}</p>
                  <p className="text-sm text-white font-mono">- Propiedades filtradas: {filteredProperties.length}</p>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-6 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg"
                  >
                    Mostrar todas las propiedades
                  </button>
                )}
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
