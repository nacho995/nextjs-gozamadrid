"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign, FaSearchMinus, FaTimes } from "react-icons/fa";
import PropertyImage from './PropertyImage';
import LoadingFallback from './LoadingFallback';
import Head from 'next/head';
import config from '@/config/config';
import axios from 'axios';
// import { wooCommerceCache } from '@/services/woocommerce-cache'; // COMENTADO - WooCommerce eliminado
import { useProperties } from '@/hooks/useProperties';

// Estilos consistentes con el resto de la web
const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' };

// Al inicio del archivo, agregar esta constante para controlar logs
const isDev = process.env.NODE_ENV === 'development';
const logDebug = (message, ...args) => {
  if (isDev && window.appConfig?.debug) {
    // // console.log(message, ...args);
  }
};

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

// Modificar la función getProxiedImageUrl para usar la URL correcta y manejar las imágenes de WooCommerce
const getProxiedImageUrl = (url) => {
  if (!url) {
    return '/img/default-property-image.jpg';
  }

  try {
    // Si es un array de imágenes (como en WooCommerce), usar la primera
    if (Array.isArray(url)) {
      if (url.length === 0) return '/img/default-property-image.jpg';
      
      const firstImage = url[0];
      if (typeof firstImage === 'object') {
        url = firstImage.src || firstImage.source_url || firstImage.url || '/img/default-property-image.jpg';
      } else {
        url = firstImage;
      }
    }
    
    // Si es un objeto (común en WordPress/WooCommerce)
    if (typeof url === 'object') {
      if (url.src) {
        url = url.src;
      } else if (url.url) {
        url = url.url;
      } else if (url.source_url) {
        url = url.source_url;
      } else {
        return '/img/default-property-image.jpg';
      }
    }

    if (typeof url !== 'string') {
      return '/img/default-property-image.jpg';
    }

    // Si ya es una URL de proxy o Cloudinary, devolverla tal cual
    if (url.includes('/api/proxy-image') || url.includes('cloudinary.com')) {
      return url;
    }

    // Si es una URL relativa, convertirla a absoluta
    if (url.startsWith('/')) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      return `${baseUrl}${url}`;
    }

    // Si es una URL de Cloudinary, devolverla tal cual
    if (url.includes('cloudinary.com')) {
      return url;
    }

    // Añadir proxy para URLs externas - usar proxy-image que está diseñado para imágenes
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    return proxyUrl;
  } catch (error) {
    console.error('[PropertyPage] Error en getProxiedImageUrl:', error);
    return '/img/default-property-image.jpg';
  }
};

// Modificar la función para obtener la ubicación correcta
const getCorrectLocation = (property) => {
  // Fallback si no hay datos
  if (!property) return "Madrid, España";
  
  // Lista de ubicaciones no españolas a filtrar
  const nonSpanishLocations = [
    "Canada", "Germany", "Australia", "Duisburg", "King Est", "QC", 
    "Ontario", "Quebec", "Calgary", "Vancouver", "Toronto", "Alberta",
    "Saskatchewan", "Manitoba", "Nova Scotia", "New Brunswick",
    "Prince Edward Island", "Newfoundland", "Labrador"
  ];
  
  // Lista de calles comunes en Madrid para validación
  const commonSpanishStreets = [
    "Calle", "C/", "Avenida", "Avda", "Plaza", "Paseo", "Gran Vía",
    "Castellana", "Alcalá", "Serrano", "Princesa", "Goya", "Castelló",
    "Velázquez", "Génova", "O'Donnell", "Bailén", "Sol", "Mayor"
  ];
  
  // Función para verificar si una ubicación parece estar en España
  const isSpanishLocation = (location) => {
    if (!location) return false;
    
    // Verificar si contiene alguna ubicación no española
    if (nonSpanishLocations.some(nonSpanish => location.includes(nonSpanish))) {
      return false;
    }
    
    // Verificar si contiene alguna referencia a calles españolas
    if (commonSpanishStreets.some(street => location.includes(street))) {
      return true;
    }
    
    // Verificar si la ubicación termina con "España" o "Madrid"
    if (location.includes("España") || location.includes("Madrid")) {
      return true;
    }
    
    // Verificar si las coordenadas están en el rango aproximado de España
    // (si la ubicación parece ser coordenadas)
    if (/[-+]?\d+\.\d+,\s*[-+]?\d+\.\d+/.test(location)) {
      const coords = location.match(/[-+]?\d+\.\d+/g);
      if (coords && coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        // Rango aproximado de España: longitud entre -10 y 5, latitud entre 35 y 44
        if (lng >= -10 && lng <= 5 && lat >= 35 && lat <= 44) {
          return true;
        }
        
        return false;
      }
    }
    
    // Por defecto, asumir que es español si no hay señales claras de lo contrario
    return true;
  };

  try {
    // Primero intentar obtener la ubicación de la propiedad de MongoDB
    if (property.location) {
      const location = property.location.toString();
      
      // Verificar si la ubicación es válida y parece estar en España
      if (isSpanishLocation(location)) {
        return location;
      } else {
        // // console.log(`[PropertyPage] Ubicación no española detectada: "${location}". Usando ubicación predeterminada.`);
        return `${property.title || property.name || 'Propiedad'}, Madrid, España`;
      }
    }
    
    // Luego intentar con la dirección
    if (property.address) {
      const address = property.address.toString();
      
      // Verificar si la dirección es válida y parece estar en España
      if (isSpanishLocation(address)) {
        return address;
      } else {
        // // console.log(`[PropertyPage] Dirección no española detectada: "${address}". Usando dirección predeterminada.`);
        return `${property.title || property.name || 'Propiedad'}, Madrid, España`;
      }
    }
    
    // Intentar extraer de meta_data para propiedades de WooCommerce
    if (property.meta_data && Array.isArray(property.meta_data)) {
      // Buscar meta_data que contenga la dirección
      const addressMeta = property.meta_data.find(meta => 
        meta.key === 'address' || meta.key === 'direccion' || meta.key === 'ubicacion' || meta.key === 'Ubicación'
      );
      
      if (addressMeta && addressMeta.value) {
        let metaLocation = '';
        
        if (typeof addressMeta.value === 'string') {
          metaLocation = addressMeta.value;
        } else if (typeof addressMeta.value === 'object') {
          // Extraer de objeto complejo
          if (addressMeta.value.address) {
            metaLocation = addressMeta.value.address;
          } else if (addressMeta.value.street_name) {
            metaLocation = `${addressMeta.value.street_number || ''} ${addressMeta.value.street_name}, ${addressMeta.value.city || 'Madrid'}`;
          } else if (addressMeta.value.city) {
            metaLocation = addressMeta.value.city;
          } else if (typeof addressMeta.value.toString === 'function') {
            metaLocation = addressMeta.value.toString();
          }
        }
        
        if (metaLocation && isSpanishLocation(metaLocation)) {
          return metaLocation;
        } else {
          // // console.log(`[PropertyPage] Metadatos de ubicación no españoles detectados: "${metaLocation}". Usando ubicación predeterminada.`);
          return `${property.title || property.name || 'Propiedad'}, Madrid, España`;
        }
      }
    }
    
    // Si el título de la propiedad contiene una dirección en Madrid, usarlo
    if (property.title || property.name) {
      const title = property.title || property.name;
      if (commonSpanishStreets.some(street => title.includes(street)) && 
          !nonSpanishLocations.some(nonSpanish => title.includes(nonSpanish))) {
        return title;
      }
    }
    
    // Si todo falla, devolver una ubicación predeterminada
    return `${property.title || property.name || 'Propiedad'}, Madrid, España`;
  } catch (error) {
    console.error('[PropertyPage] Error al extraer ubicación correcta:', error);
    return "Madrid, España";
  }
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
    return ['Madrid'];
  }
  
  // Filtrar y limpiar ubicaciones
  const allLocations = properties
    .map(property => {
      let location = getCorrectLocation(property);
      
      // Asegurarse de que la ubicación es válida y está en España
      if (location && typeof location === 'string') {
        // Extraer sólo la parte de la ciudad (asumiendo formato "Calle, Ciudad")
        const parts = location.split(',');
        if (parts.length > 1) {
          location = parts[parts.length - 2].trim();
        }
        
        // Si es demasiado larga, probablemente es una dirección completa
        if (location.length > 30) {
          location = 'Madrid';
        }
        
        return location;
      }
      
      return 'Madrid';
    })
    .filter(Boolean);
  
  // Añadir "Madrid" y "España" si no están ya
  if (!allLocations.includes('Madrid')) {
    allLocations.push('Madrid');
  }
  
  if (!allLocations.includes('España')) {
    allLocations.push('España');
  }
  
  // Eliminar duplicados y ordenar alfabéticamente
  const uniqueLocations = [...new Set(allLocations)].sort();
  
  return ['Todas', ...uniqueLocations];
};

// Constantes
const ITEMS_PER_PAGE = 100;
const DEFAULT_PAGE = 1;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com';
const API_URL = process.env.NEXT_PUBLIC_API_MONGODB_URL || process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';

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
  if (!data) {
    // // console.log('[PropertyPage] validateResponse: datos nulos o indefinidos');
    return [];
  }
  
  if (Array.isArray(data)) {
    // // console.log(`[PropertyPage] validateResponse: datos son un array con ${data.length} elementos`);
    return data;
  }
  
  if (data.properties && Array.isArray(data.properties)) {
    // // console.log(`[PropertyPage] validateResponse: datos contienen array properties con ${data.properties.length} elementos`);
    return data.properties;
  }
  
  // Intentar extraer datos si la respuesta es un objeto con estructura no estándar
  if (typeof data === 'object') {
    const objectKeys = Object.keys(data);
    // // console.log(`[PropertyPage] validateResponse: datos son un objeto con claves: ${objectKeys.join(', ')}`);
    
    // Buscar alguna clave que pueda contener un array de propiedades
    for (const key of objectKeys) {
      if (Array.isArray(data[key])) {
        // // console.log(`[PropertyPage] validateResponse: se encontró array en clave ${key} con ${data[key].length} elementos`);
        return data[key];
      }
    }
  }
  
  // // console.log(`[PropertyPage] validateResponse: estructura de datos no reconocida: ${typeof data}`);
  return [];
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

// Añadir logs para depuración
axiosInstance.interceptors.request.use(
  config => {
    // Comentar este log para reducir ruido en consola
    // console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.params || {});
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para depuración
axiosInstance.interceptors.response.use(
  response => {
    // Solo log en caso de error - El log de éxito genera demasiado ruido
    return response;
  },
  error => {
    console.error(`[API Response Error] ${error.config?.url || 'unknown URL'}:`, error.message);
    return Promise.reject(error);
  }
);

// Función para obtener propiedades usando endpoints directos (sin proxy obsoleto)
const fetchPropertiesFromAPI = async () => {
  try {
    console.log('[PropertyPage] Usando useProperties hook para cargar de ambas fuentes');
    // Esta función ya no es necesaria, usaremos el hook useProperties
    return [];
  } catch (error) {
    console.error('[PropertyPage] Error al obtener propiedades:', error);
    return [];
  }
};

export default function PropertyPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');
  const [priceRange, setPriceRange] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState(['Todas']);
  const [propertyTypes, setPropertyTypes] = useState(['Todos']);
  const [priceRanges] = useState(['Todos', '0-500k', '500k-1M', '1M-2M', '2M+']);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState([]);
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState('');
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Usar el hook useProperties para cargar de ambas fuentes
  const { 
    properties: allProperties, 
    loading: propertiesLoading, 
    error: propertiesError,
    meta,
    refresh: refreshProperties
  } = useProperties({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    source: 'all', // Cargar de ambas fuentes: MongoDB y WooCommerce
    autoLoad: true,
    enableCache: true
  });

  // Actualizar el efecto para usar las propiedades del hook
  useEffect(() => {
    if (!propertiesLoading && allProperties.length > 0) {
      console.log(`[PropertyPage] Propiedades cargadas: ${allProperties.length} total`);
      console.log(`[PropertyPage] Fuentes: MongoDB: ${meta?.sources?.mongodb || 0}, WooCommerce: ${meta?.sources?.woocommerce || 0}`);
      
      // Extraer ubicaciones y tipos de las propiedades cargadas
      const extractedLocations = extractLocations(allProperties);
      const extractedTypes = extractPropertyTypes(allProperties);
      
      setLocations(extractedLocations);
      setPropertyTypes(['Todos', ...extractedTypes]);
      setIsLoading(false);
      setError(null);
    } else if (!propertiesLoading && propertiesError) {
      console.error('[PropertyPage] Error cargando propiedades:', propertiesError);
      setError(propertiesError);
      setIsLoading(false);
    }
  }, [allProperties, propertiesLoading, propertiesError, meta]);

  // Actualizar el efecto para no llamar a fetchAllProperties
  useEffect(() => {
    setIsClient(true);
    // Verificar la configuración
    if (typeof window !== 'undefined' && window.appConfig) {
      console.log('[PropertyPage] Configuración detectada:', window.appConfig);
      setIsConfigLoaded(true);
    } else {
      console.log('[PropertyPage] Configuración no disponible, continuando sin ella');
      setIsConfigLoaded(true);
    }
  }, []);

  // Actualizar el efecto de cambio de página
  useEffect(() => {
    const pageFromQuery = parseInt(router.query.page) || DEFAULT_PAGE;
    if (pageFromQuery !== currentPage) {
      setCurrentPage(pageFromQuery);
    }
  }, [router.query.page]);

  // Filtrar propiedades basándose en los filtros seleccionados
  const filteredProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];

    return allProperties.filter(property => {
      // Filtro por ubicación
      if (selectedLocation !== 'Todas') {
        const propertyLocation = getCorrectLocation(property).toLowerCase();
        if (!propertyLocation.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Filtro por tipo
      if (selectedType !== 'Todos') {
        const propertyType = property.typeProperty || property.type || '';
        if (propertyType.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // Filtro por rango de precio
      if (priceRange !== 'Todos') {
        const price = parseFloat(property.price) || 0;
        switch (priceRange) {
          case '0-500k':
            if (price >= 500000) return false;
            break;
          case '500k-1M':
            if (price < 500000 || price >= 1000000) return false;
            break;
          case '1M-2M':
            if (price < 1000000 || price >= 2000000) return false;
            break;
          case '2M+':
            if (price < 2000000) return false;
            break;
        }
      }

      // Filtro por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = (property.title || property.name || '').toLowerCase();
        const location = getCorrectLocation(property).toLowerCase();
        const description = (property.description || '').toLowerCase();
        
        if (!title.includes(searchLower) && 
            !location.includes(searchLower) && 
            !description.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [allProperties, selectedLocation, selectedType, priceRange, searchTerm]);

  // Calcular propiedades paginadas
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

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
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
    // // console.log(`[RENDERIZACIONES] PropertyPage renderizada ${renderCountRef.current} veces`);
  });

  // Efecto para asegurar que tenemos la URL correcta para el SEO
  const [currentUrl, setCurrentUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Efecto para mostrar el panel de depuración solo en el cliente tras hidratación
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  useEffect(() => {
    if (window.appConfig?.debug || process.env.NODE_ENV === 'development') {
      setShowDebugPanel(true);
    }
  }, []);

  // Preparar el Schema.org para la lista de propiedades
  const generatePropertyListSchema = () => {
    // Solo generar si tenemos propiedades
    if (!Array.isArray(allProperties) || allProperties.length === 0) {
      return null;
    }

    // Extraer tipos de propiedades y ubicaciones para mejorar el SEO
    const propertyTypes = extractPropertyTypes(allProperties);
    const locations = extractLocations(allProperties);

    // Generar schema.org para la lista de propiedades
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": allProperties.map((property, index) => {
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
        let imageAlt = title;
        
        // Verificar si la propiedad es de WooCommerce y tiene imágenes en formato WooCommerce
        if (!isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          
          if (typeof firstImage === 'string') {
            mainImage = firstImage;
          } else if (typeof firstImage === 'object') {
            mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
            imageAlt = firstImage.alt || title;
          }
        } 
        // Si es propiedad de MongoDB, usar el formato de MongoDB
        else if (property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          
          if (typeof firstImage === 'string') {
            mainImage = firstImage;
          } else if (typeof firstImage === 'object') {
            mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
            imageAlt = firstImage.alt || title;
          }
        }
        
        // Usar la función de proxy para asegurar que la imagen se cargue correctamente
        mainImage = getProxiedImageUrl(mainImage);
        
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
            "image": mainImage,
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

  // Modificar la función handlePropertyClick para ser más robusta
  const handlePropertyClick = useCallback((property, index) => {
    try {
      // Determinamos el ID de navegación según el tipo de propiedad
      let navigationId;
      
      if (!property) {
        console.error('[PropertyPage] No se pudo navegar: propiedad undefined');
        return;
      }
      
      // Verificar si es propiedad de MongoDB
      const isMongoDBProperty = property.source === 'mongodb' || property._id || 
        (property.id && typeof property.id === 'string' && property.id.length > 20);
      
      if (isMongoDBProperty && property._id) {
        navigationId = property._id;
      } else if (property.id) {
        navigationId = property.id;
      } else {
        // Si no tiene ID, usar un ID de respaldo basado en el índice
        navigationId = `fallback-${index}`;
        console.error('[PropertyPage] Error de navegación: Propiedad sin ID válido, usando fallback');
      }
      
      // Navegar a la página de detalles
      window.location.href = `/property/${navigationId}`;
    } catch (error) {
      console.error('[PropertyPage] Error al navegar:', error);
      // Fallback de navegación solo si tenemos algún ID
      if (property && (property.id || property._id)) {
        window.location.href = `/property/${property._id || property.id}`;
      }
    }
  }, []);

  const renderProperties = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center py-20">
          <h3 className="text-xl font-semibold text-red-500">Error al cargar propiedades</h3>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      );
    }

    if (!paginatedProperties || paginatedProperties.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center py-20">
          <h3 className="text-xl font-semibold text-gray-700">No se encontraron propiedades</h3>
          <p className="text-gray-600 mt-2">Intente con otros filtros o revise más tarde.</p>
        </div>
      );
    }

    // Mostrar todas las propiedades disponibles
    const currentProperties = paginatedProperties;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProperties.map((property, index) => {
          // Determinar si es una propiedad de MongoDB
          const isMongoDBProperty = property.source === 'mongodb' || property._id || 
            (property.id && typeof property.id === 'string' && property.id.length > 20);
          
          // Obtener ID según el tipo de propiedad - CORREGIDO para evitar propertyId undefined
          const propertyId = isMongoDBProperty 
            ? (property._id || `fallback-${index}`) 
            : (property.id || `fallback-${index}`);
          
          // Extraer título
          const title = isMongoDBProperty 
            ? (property.title || 'Propiedad sin título') 
            : (property.title || property.name || 'Propiedad sin título');
          
          // Obtener precio formateado
          let formattedPrice = 'Consultar';
          try {
            if (property.price) {
              // Convertir a número si es una cadena de texto
              let price = typeof property.price === 'string' 
                ? parseFloat(property.price.replace(/[^\d.-]/g, '')) 
                : property.price;
              
              // Verificar si el precio parece muy bajo (probablemente en miles)
              if (price < 10000 && price > 100) {
                price = price * 1000; // Convertir a euros reales
              }
              
              formattedPrice = new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(price);
            }
          } catch (e) {
            console.error('Error al formatear precio:', e);
          }
          
          // Obtener imagen principal - mejorado para WooCommerce
          let mainImage = '/img/default-property-image.jpg';
          let imageAlt = title;
          
          // Verificar si la propiedad es de WooCommerce y tiene imágenes en formato WooCommerce
          if (!isMongoDBProperty && property.images && Array.isArray(property.images) && property.images.length > 0) {
            const firstImage = property.images[0];
            
            if (typeof firstImage === 'string') {
              mainImage = firstImage;
            } else if (typeof firstImage === 'object') {
              mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
              imageAlt = firstImage.alt || title;
            }
          } 
          // Si es propiedad de MongoDB, usar el formato de MongoDB
          else if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            const firstImage = property.images[0];
            
            if (typeof firstImage === 'string') {
              mainImage = firstImage;
            } else if (typeof firstImage === 'object') {
              mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
              imageAlt = firstImage.alt || title;
            }
          }
          
          // Usar la función de proxy para asegurar que la imagen se cargue correctamente
          mainImage = getProxiedImageUrl(mainImage);
          
          // Extraer características - Mejorado para WooCommerce
          let bedrooms = '?';
          let bathrooms = '?';
          let area = '?';
          let location = '';
          
          if (isMongoDBProperty) {
            // Si es propiedad de MongoDB, usar los campos directos
            bedrooms = property.bedrooms || property.rooms || '?';
            bathrooms = property.bathrooms || property.wc || '?';
            area = property.area || property.m2 || '?';
            location = property.location || property.address || '';
          } else {
            // Si es WooCommerce, priorizar datos de features
            if (property.features) {
              bedrooms = property.features.bedrooms || property.bedrooms || property.rooms || '?';
              bathrooms = property.features.bathrooms || property.bathrooms || property.wc || '?';
              area = property.features.area || property.area || property.m2 || '?';
            } else {
              // Fallback a campos directos
              bedrooms = property.bedrooms || property.rooms || '?';
              bathrooms = property.bathrooms || property.wc || '?';
              area = property.area || property.m2 || '?';
            }
            
            // Para la ubicación, usar el campo location directamente
            location = property.location || property.address || '';
            
            // Si no hay ubicación, intentar extraerla del título
            if (!location && (property.title || property.name)) {
              const title = property.title || property.name;
              // Si el título es una dirección (contiene "Calle", etc.)
              if (title.includes("Calle") || 
                  title.includes("Avenida") || 
                  title.includes("Plaza") || 
                  /^(Calle|C\/|Avda\.|Av\.|Pza\.|Plaza)\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\d*/.test(title)) {
                location = title;
              }
            }
            
            // Si aún no hay ubicación, buscar en meta_data como fallback
            if (!location && property.meta_data && Array.isArray(property.meta_data)) {
              const addressMeta = property.meta_data.find(meta => 
                meta.key === 'address' || meta.key === 'direccion' || meta.key === 'ubicacion' || meta.key === 'Ubicación'
              );
              
              if (addressMeta) {
                if (typeof addressMeta.value === 'string') {
                  location = addressMeta.value;
                } else if (typeof addressMeta.value === 'object') {
                  location = addressMeta.value.address || 
                           addressMeta.value.name || 
                           (addressMeta.value.street_number && addressMeta.value.street_name ? 
                             `${addressMeta.value.street_number} ${addressMeta.value.street_name}, ${addressMeta.value.city}` : 
                             '');
                }
              }
            }
          }
          
          // Extraer características adicionales
          const floor = property.piso || property.floor || 
                       (property.meta_data ? property.meta_data.find(meta => meta.key === 'Planta' || meta.key === 'storeys')?.value : null);
          
          const hasPool = property.pool || property.piscina || 
                        (property.meta_data ? !!property.meta_data.find(meta => meta.key === 'piscina' || meta.key === 'pool') : false);
          
          const hasGarage = property.garage || property.garaje || 
                          (property.meta_data ? !!property.meta_data.find(meta => meta.key === 'garaje' || meta.key === 'garage') : false);
          
          const hasTerrace = property.terrace || property.terraza || 
                           (property.meta_data ? !!property.meta_data.find(meta => meta.key === 'terraza' || meta.key === 'terrace') : false);
          
          const hasGarden = property.garden || property.jardin || 
                          (property.meta_data ? !!property.meta_data.find(meta => meta.key === 'jardin' || meta.key === 'garden') : false);
          
          // Estilo de sombra para legibilidad
          const textShadowStyle = {
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'
          };
          
          // Generar delay para la animación escalonada
          const delay = index * 0.1;

          return (
            <motion.div
              key={propertyId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => handlePropertyClick(property, index)}
              aria-label={`Ver detalles de ${title}`}
            >
              {/* Tarjeta principal con efecto de vidrio */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(255,215,0,0.2)] transition-all duration-500 hover:scale-[1.02] border border-white/10">
                {/* Imagen principal con overlay degradado */}
                <div className="relative h-72 overflow-hidden">
                  <PropertyImage 
                    src={mainImage}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    quality={85}
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70"></div>
                  
                  {/* Etiqueta de precio elegante */}
                  <div className="absolute top-4 right-4 bg-black/60 text-amarillo px-4 py-2 rounded-lg backdrop-blur-md border border-amarillo/30 shadow-lg">
                    <span className="flex items-center gap-1">
                      <FaEuroSign className="text-sm" />
                      <span className="font-semibold">{formattedPrice}</span>
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Título con ubicación */}
                  <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2" style={textShadowStyle}>
                    {title}
                  </h3>
                  
                  {/* Características principales con iconos destacados - DISEÑO MEJORADO */}
                  <div className="flex justify-between items-stretch py-4 px-2 mb-2 bg-gradient-to-br from-black/60 to-gray-900/40 rounded-lg border border-white/10 shadow-inner">
                    <div className="flex flex-col items-center gap-1 flex-1 px-2">
                      <FaBed className="text-amarillo text-2xl mb-1" />
                      <span className="text-white font-medium text-lg">{bedrooms}</span>
                      <span className="text-gray-400 text-xs">habitaciones</span>
                    </div>
                    
                    <div className="w-px h-auto bg-gray-700/50 mx-1"></div>
                    
                    <div className="flex flex-col items-center gap-1 flex-1 px-2">
                      <FaBath className="text-amarillo text-2xl mb-1" />
                      <span className="text-white font-medium text-lg">{bathrooms}</span>
                      <span className="text-gray-400 text-xs">baños</span>
                    </div>
                    
                    <div className="w-px h-auto bg-gray-700/50 mx-1"></div>
                    
                    <div className="flex flex-col items-center gap-1 flex-1 px-2">
                      <FaRulerCombined className="text-amarillo text-2xl mb-1" />
                      <span className="text-white font-medium text-lg">{area}</span>
                      <span className="text-gray-400 text-xs">m²</span>
                    </div>
                  </div>

                  {/* Características adicionales (iconos) */}
                  <div className="flex flex-wrap gap-2 justify-start mt-4">
                    {floor !== null && (
                      <div className="bg-amarillo/10 border border-amarillo/20 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Planta {floor}
                      </div>
                    )}
                    {hasPool && (
                      <div className="bg-amarillo/10 border border-amarillo/20 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        Piscina
                      </div>
                    )}
                    {hasGarage && (
                      <div className="bg-amarillo/10 border border-amarillo/20 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Garaje
                      </div>
                    )}
                    {hasTerrace && (
                      <div className="bg-amarillo/10 border border-amarillo/20 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Terraza
                      </div>
                    )}
                    {hasGarden && (
                      <div className="bg-amarillo/10 border border-amarillo/20 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amarillo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Jardín
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón elegante "Ver detalles" con Link para mejor navegación */}
                <div className="px-6 pb-6">
                  <Link 
                    href={`/property/${property._id || property.id}`}
                    className="block w-full"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar doble navegación
                      handlePropertyClick(property, index);
                    }}
                    legacyBehavior={false}
                  >
                    <div className="w-full py-3 bg-gradient-to-r from-amarillo/80 to-amber-600/80 text-black font-medium rounded-lg transition-all duration-300 hover:from-amarillo hover:to-amber-600 backdrop-blur-sm shadow-lg border border-amber-500/30 group-hover:scale-105 text-center cursor-pointer">
                      Ver detalles
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Generar Schema.org JSON-LD
  const propertyListSchema = generatePropertyListSchema();

  // Evitar problemas de hidratación - no renderizar hasta que estemos en el cliente
  if (!isClient) {
    return (
      <div className="relative min-h-screen py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {isClient && <link rel="canonical" href={currentUrl} />}
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {isClient && <meta property="og:url" content={currentUrl} />}
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

      {/* Panel de depuración - Renderizado condicional con estado */}
      {showDebugPanel && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-4 rounded-lg shadow-lg text-xs font-mono max-w-xs overflow-auto max-h-80">
          <h4 className="font-bold text-amber-400 mb-2">DEBUG</h4>
          <p>Properties: {allProperties.length}</p>
          <p>Filtered: {filteredProperties.length}</p>
          <p>Current Page: {currentPage}</p>
          <p>Total Pages: {totalPages}</p>
          <p>MongoDB: {allProperties.filter(p => p.source === 'mongodb').length}</p>
          <p>WooCommerce: {allProperties.filter(p => p.source === 'woocommerce').length}</p>
          <p>Loading: {isLoading ? 'true' : 'false'}</p>
          <p>Initialized: {renderCountRef.current > 0 ? 'true' : 'false'}</p>
          <hr className="my-2 border-gray-600" />
          <button
            onClick={() => {
              console.log('Estado completo:', {
                allProperties,
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
            {renderProperties()}
          </div>
        </main>
      </div>
    </>
  );
}