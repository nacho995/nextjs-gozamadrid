"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import api from '@/services/api';
import PropertyImage from './PropertyImage';
import LoadingFallback from './LoadingFallback';
import Head from 'next/head';
import config from '@/config/config';
import axios from 'axios';

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
  
  // Si ya es una URL de proxy o Cloudinary, devolverla tal cual
  if (url.includes('images.weserv.nl') || url.includes('cloudinary.com')) {
    console.log("PropertyPage - URL ya es proxy o Cloudinary, devolviendo tal cual:", url);
    return url;
  }
  
  // Si es una ruta relativa, construir la URL completa
  if (!url.startsWith('http') && !url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.realestategozamadrid.com';
    url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    console.log("PropertyPage - URL relativa convertida a absoluta:", url);
  }
  
  // Para URLs externas, usar un servicio de proxy para evitar errores CORS y QUIC_PROTOCOL_ERROR
  if (url.startsWith('http')) {
    // No usar proxy para URLs de Cloudinary
    if (url.includes('cloudinary.com')) {
      return url;
    }
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

// Constantes
const ITEMS_PER_PAGE = config.ITEMS_PER_PAGE || 12;
const DEFAULT_PAGE = 1;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gozamadrid.com';
const API_URL = process.env.MONGODB_URL || 'https://api.realestategozamadrid.com';

// Función para validar y parsear respuestas JSON
const safeJsonParse = (data) => {
  if (!data) return null;
  try {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error('[PropertyPage] Error al parsear JSON:', error);
    return null;
  }
};

// Función para validar la estructura de la respuesta
const validateResponse = (data) => {
  if (!data) return false;
  if (Array.isArray(data)) return true;
  if (data.properties && Array.isArray(data.properties)) return true;
  return false;
};

// Configuración de axios simplificada
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Simplificar interceptor de peticiones
axiosInstance.interceptors.request.use(
  config => {
    // Siempre usar método GET
    config.method = 'get';
    
    // Eliminar headers problemáticos
    ['Origin', 'Cache-Control', 'Pragma', 'Host'].forEach(
      header => delete config.headers[header]
    );
    
    return config;
  },
  error => Promise.reject(error)
);

// Simplificar interceptor de respuestas
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    console.error('[PropertyPage] Error en la petición:', error.message);
    
    // Si es un error de red, intentar con nuestro proxy interno
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      try {
        const params = error.config?.params || {};
        const proxyUrl = '/api/proxy';
        
        console.log('[PropertyPage] Reintentando con proxy interno:', proxyUrl);
        
        const response = await axios.get(proxyUrl, { 
          params: {
            source: 'mongodb',
            path: '/properties',
            ...params
          }
        });
        
        return response;
      } catch (retryError) {
        console.error('[PropertyPage] Error en reintento:', retryError.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default function PropertyPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const renderCountRef = useRef(0);
  const isFirstRender = useRef(true);
  const { query } = router;
  
  // Efecto para esperar a que la configuración se cargue
  useEffect(() => {
    let timeoutId;
    let attempts = 0;
    const maxAttempts = 10;

    const checkConfig = () => {
      if (window.appConfig) {
        console.log('[PropertyPage] Configuración detectada:', window.appConfig);
        if (!window.appConfig.isConfigLoaded) {
          console.log('[PropertyPage] Esperando configuración completa...');
          if (attempts < maxAttempts) {
            attempts++;
            timeoutId = setTimeout(checkConfig, 1000);
            return;
          }
        }
        setConfigLoaded(true);
      } else {
        if (attempts < maxAttempts) {
          attempts++;
          console.log(`[PropertyPage] Esperando configuración... Intento ${attempts}`);
          timeoutId = setTimeout(checkConfig, 1000);
        } else {
          console.log('[PropertyPage] No se pudo cargar la configuración después de varios intentos');
          setConfigLoaded(true); // Continuar de todos modos
        }
      }
    };
    
    checkConfig();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Efecto para manejar cambios en la URL
  useEffect(() => {
    if (!router.isReady) return;
    
    const page = parseInt(router.query.page) || DEFAULT_PAGE;
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [router.isReady, router.query.page]);

  // Efecto para cargar propiedades
  useEffect(() => {
    if (!router.isReady || !configLoaded) {
      console.log('[PropertyPage] Esperando router y configuración...');
      return;
    }

    let abortController = null;
    let timeoutId = null;

    const fetchProperties = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        setLoading(true);
        console.log(`[PropertyPage] Iniciando fetchProperties para página: ${currentPage} (intento ${retryCount + 1}/${maxRetries + 1})`);
        
        let response;
        try {
          // Intentar primero con nuestro proxy
          response = await axios.get('/api/proxy', {
            params: {
              source: 'mongodb',
              path: '/properties',
              page: currentPage,
              limit: ITEMS_PER_PAGE
            }
          });
        } catch (initialError) {
          console.log('[PropertyPage] Error con proxy, intentando API directa:', initialError.message);
          
          // Segundo intento: API directa
          try {
            response = await axiosInstance.get('/api/properties', {
              params: {
                page: currentPage,
                limit: ITEMS_PER_PAGE
              }
            });
          } catch (apiError) {
            if (retryCount < maxRetries) {
              console.log(`[PropertyPage] Reintentando (${retryCount + 1}/${maxRetries})...`);
              return fetchProperties(retryCount + 1);
            }
            throw apiError;
          }
        }

        const data = response.data;
        if (!validateResponse(data)) {
          throw new Error('Estructura de datos inválida en la respuesta');
        }

        // Procesar las propiedades
        let processedProperties = [];
        let total = 0;

        if (data && data.properties) {
          processedProperties = data.properties;
          total = data.total || data.properties.length;
        } else if (Array.isArray(data)) {
          processedProperties = data;
          total = data.length;
        }

        // Estandarizar el formato de las propiedades
        processedProperties = processedProperties.map(property => {
          const isWooCommerce = !property._id;
          
          // Extraer metadatos de WooCommerce
          let metadata = {};
          if (isWooCommerce && property.meta_data) {
            property.meta_data.forEach(meta => {
              // Eliminar los metadatos con prefijo "_"
              if (!meta.key.startsWith('_')) {
                metadata[meta.key] = meta.value;
              }
            });
          }

          // Construir objeto estandarizado
          return {
            id: property._id || property.id,
            source: isWooCommerce ? 'woocommerce' : 'mongodb',
            title: property.name || property.title,
            description: property.description || property.short_description || '',
            price: property.price || metadata.price || 0,
            location: getCorrectLocation(property),
            images: isWooCommerce ? 
              (property.images || []).map(img => ({
                url: getProxiedImageUrl(img.src || img.source_url),
                alt: img.alt || property.name
              })) :
              (property.images || []).map(img => ({
                url: getProxiedImageUrl(img),
                alt: property.title
              })),
            features: {
              bedrooms: metadata.bedrooms || property.bedrooms || 0,
              bathrooms: metadata.baños || metadata.bathrooms || property.bathrooms || 0,
              area: metadata.living_area || property.area || 0,
              floor: metadata.Planta || property.floor || null
            },
            metadata: metadata,
            rawData: property // Mantener datos originales por si se necesitan
          };
        });

        console.log('[PropertyPage] Propiedades procesadas:', {
          total: processedProperties.length,
          woocommerce: processedProperties.filter(p => p.source === 'woocommerce').length,
          mongodb: processedProperties.filter(p => p.source === 'mongodb').length
        });

        setProperties(processedProperties);
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE) || 1);
        setError(null);

      } catch (error) {
        console.error('[PropertyPage] Error al obtener propiedades:', error);
        
        if (axios.isCancel(error)) {
          console.log('[PropertyPage] La petición fue cancelada');
        } else if (error.code === 'ECONNABORTED') {
          console.log('[PropertyPage] Timeout de la petición');
        } else if (error.response) {
          console.log('[PropertyPage] Error de respuesta:', error.response.status);
        } else if (error.request) {
          console.log('[PropertyPage] Error de red');
        }
        
        if (retryCount < maxRetries) {
          console.log(`[PropertyPage] Reintentando (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchProperties(retryCount + 1);
        }
        
        setError('Error al obtener propiedades. Por favor, intente más tarde.');
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setTimeout(() => setLoading(false), 100);
      }
    };

    fetchProperties();

    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router.isReady, currentPage, configLoaded]);

  // Memoizar las propiedades filtradas
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;

    return properties.filter(property => {
      const searchLower = searchTerm.toLowerCase();
      const location = property.location || property.address || '';
      const title = property.title || property.name || '';
      
      return location.toLowerCase().includes(searchLower) ||
             title.toLowerCase().includes(searchLower);
    });
  }, [properties, searchTerm]);

  // Callback para cambio de página
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page }
    }, undefined, { scroll: true });
  }, [router]);

  // Para SEO - Metadatos dinámicos
  const [pageTitle, setPageTitle] = useState('Propiedades Inmobiliarias en Madrid | Goza Madrid');
  const [pageDescription, setPageDescription] = useState('Descubra nuestra selección de propiedades inmobiliarias en Madrid. Apartamentos, casas, chalets y locales comerciales disponibles para compra y alquiler.');

  // Aumentar contador de renderizaciones
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[RENDERIZACIONES] PropertyPage renderizada ${renderCountRef.current} veces`);
  });

  // Efecto para asegurar que tenemos la URL correcta para el SEO
  const [currentUrl, setCurrentUrl] = useState('');
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

  // Optimizar la navegación
  const handlePropertyClick = useCallback((property) => {
    const navigationId = property._id || property.id;
    if (!navigationId) {
      console.error('ID de propiedad no válido:', property);
      return;
    }

    console.log('[NAVEGACIÓN] Navegando a propiedad:', {
      id: navigationId,
      source: property.source
    });

    router.push(`/property/${navigationId}`, undefined, { 
      shallow: false,
      scroll: true
    });
  }, [router]);

  // Renderizar estado de carga
  if (loading) {
    return <LoadingFallback />;
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg"
        >
          Reintentar
        </button>
      </div>
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
          currentPage,
          totalPages,
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
          <p>MongoDB: {properties.filter(p => p.source === 'mongodb').length}</p>
          <p>WooCommerce: {properties.filter(p => p.source === 'woocommerce').length}</p>
          <p>Loading: {loading ? 'true' : 'false'}</p>
          <p>Initialized: {renderCountRef.current > 0 ? 'true' : 'false'}</p>
          <hr className="my-2 border-gray-600" />
          <button
            onClick={() => {
              console.log('Estado completo:', {
                properties,
                filteredProperties,
                currentProperties: filteredProperties
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

            {/* Grid de propiedades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => {
                // Asegurarse de que tenemos una imagen válida
                const mainImage = property.images[0]?.url || '/img/default-property-image.jpg';
                const imageAlt = property.images[0]?.alt || property.title;
                
                // Formatear el precio
                const formattedPrice = typeof property.price === 'number' 
                  ? property.price.toLocaleString('es-ES')
                  : property.price;
                  
                  return (
                    <motion.div
                    key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group relative bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => handlePropertyClick(property)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver detalles de ${property.title}`}
                  >
                    {/* Imagen principal */}
                    <div className="relative h-64 overflow-hidden">
                            <PropertyImage 
                        src={mainImage}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        quality={85}
                        priority={false}
                      />
                      {/* Etiqueta de precio */}
                      <div className="absolute top-4 right-4 bg-black/80 text-amarillo px-4 py-2 rounded-lg backdrop-blur-sm">
                        <span className="flex items-center gap-1">
                          <FaEuroSign className="text-sm" />
                          <span className="font-semibold">{formattedPrice}</span>
                        </span>
                          </div>
                          </div>

                    {/* Contenido */}
                        <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2" style={textShadowStyle}>
                        {property.title}
                            </h3>
                      
                      {/* Ubicación */}
                      <p className="text-gray-300 mb-4 flex items-center gap-2" style={textShadowLightStyle}>
                        <FaMapMarkerAlt className="text-amarillo" />
                        <span className="line-clamp-1">{property.location}</span>
                      </p>

                      {/* Características */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {property.features.bedrooms > 0 && (
                          <div className="flex flex-col items-center">
                            <FaBed className="text-amarillo mb-1" />
                            <span className="text-white text-sm">{property.features.bedrooms}</span>
                            </div>
                        )}
                        {property.features.bathrooms > 0 && (
                          <div className="flex flex-col items-center">
                            <FaBath className="text-amarillo mb-1" />
                            <span className="text-white text-sm">{property.features.bathrooms}</span>
                            </div>
                        )}
                        {property.features.area > 0 && (
                          <div className="flex flex-col items-center">
                            <FaRulerCombined className="text-amarillo mb-1" />
                            <span className="text-white text-sm">{property.features.area}m²</span>
                            </div>
                        )}
                          </div>

                      {/* Planta (si está disponible) */}
                      {property.features.floor && (
                        <p className="mt-4 text-sm text-gray-300 text-center">
                          Planta: {property.features.floor}
                        </p>
                      )}
                            </div>

                    {/* Overlay al hacer hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-white text-sm line-clamp-3" style={textShadowStyle}>
                          {property.description}
                        </p>
                          </div>
                        </div>
                    </motion.div>
                  );
                })}
                </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}