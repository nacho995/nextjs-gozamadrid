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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    console.log("PropertyPage - URL relativa convertida a absoluta:", url);
  }
  
  // Para URLs externas, usar un servicio de proxy para evitar errores CORS y QUIC_PROTOCOL_ERROR
  if (url.startsWith('http')) {
    // No usar proxy para URLs de Cloudinary, ya que son seguras y optimizadas
    if (url.includes('cloudinary.com')) {
      console.log("PropertyPage - URL de Cloudinary, devolviendo tal cual:", url);
      return url;
    }
    
    // Para otras URLs, usar un servicio de proxy de imágenes
    try {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=https://www.realestategozamadrid.com/img/default-property-image.jpg`;
      console.log("PropertyPage - URL con proxy:", proxyUrl);
      return proxyUrl;
    } catch (e) {
      console.error("PropertyPage - Error al generar URL con proxy:", e);
      return url; // Devolver la URL original si hay un error
    }
  }
  
  // Si no es una URL completa, usar la imagen por defecto
  console.log("PropertyPage - URL no es URL completa, devolviendo original:", url);
  return url;
};

// Modificar la función para obtener la ubicación correcta
const getCorrectLocation = (property) => {
  // Extraer la ubicación de la propiedad sin agregar "Madrid" automáticamente
  // Si no hay una ubicación, simplemente devolvemos una cadena vacía
  
  // Si es una propiedad de MongoDB
  if (property._id) {
    return property.location || property.address || "";
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
      const addressValue = typeof addressMeta.value === 'object' 
        ? addressMeta.value.address || addressMeta.value.name
        : addressMeta.value;
      
      return addressValue;
    }
  }
  
  // Extraer dirección del nombre de la propiedad
  if (property.name) {
    // Verificar si el nombre contiene una dirección
    if (property.name.includes("Calle") || property.name.includes("Avenida") || 
        property.name.includes("Plaza") || 
        /^(Calle|C\/|Avda\.|Av\.|Pza\.|Plaza)\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\d*/.test(property.name)) {
      return property.name;
    }
  }
  
  // Si no se encontró en meta_data, usar description o short_description
  // y extraer posibles menciones de ubicación
  const fullDescription = property.description || property.short_description || "";
  if (fullDescription) {
    // Buscar menciones de ubicación en la descripción
    if (fullDescription.includes("Ubicación") || fullDescription.includes("ubicación")) {
      // Intentar extraer la primera línea después de "Ubicación"
      const matches = fullDescription.match(/Ubicación.*?[\r\n](.*?)[\r\n]/i);
      if (matches && matches[1]) {
        return matches[1].trim();
      }
    }
  }
  
  // Si nada más funciona, devolver una cadena vacía
  return "";
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
const API_URL = process.env.MONGODB_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';

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
    console.log('[PropertyPage] validateResponse: datos nulos o indefinidos');
    return false;
  }
  
  if (Array.isArray(data)) {
    console.log(`[PropertyPage] validateResponse: datos son un array con ${data.length} elementos`);
    return true;
  }
  
  if (data.properties && Array.isArray(data.properties)) {
    console.log(`[PropertyPage] validateResponse: datos contienen array properties con ${data.properties.length} elementos`);
    return true;
  }
  
  // Intentar extraer datos si la respuesta es un objeto con estructura no estándar
  if (typeof data === 'object') {
    const objectKeys = Object.keys(data);
    console.log(`[PropertyPage] validateResponse: datos son un objeto con claves: ${objectKeys.join(', ')}`);
    
    // Buscar alguna clave que pueda contener un array de propiedades
    for (const key of objectKeys) {
      if (Array.isArray(data[key])) {
        console.log(`[PropertyPage] validateResponse: se encontró array en clave ${key} con ${data[key].length} elementos`);
        return true;
      }
    }
  }
  
  console.log(`[PropertyPage] validateResponse: estructura de datos no reconocida: ${typeof data}`);
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

// Añadir logs para depuración
axiosInstance.interceptors.request.use(
  config => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.params || {});
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    console.log(`[API Response] Status: ${response.status} for ${response.config.url}`, 
      response.data ? (Array.isArray(response.data) ? `Array[${response.data.length}]` : typeof response.data) : 'No data');
    return response;
  },
  error => {
    console.error(`[API Response Error] ${error.config?.url || 'unknown URL'}:`, error.message);
    
    // Log más detallado para analizar la respuesta de error
    if (error.response) {
      console.error(`[API Error Details] Status: ${error.response.status}`, error.response.data);
    }
    
    if (error.request && !error.response) {
      console.error('[API Network Error] No se recibió respuesta del servidor');
    }
    
    return Promise.reject(error);
  }
);

// Función auxiliar para realizar peticiones a WooCommerce de forma robusta
const fetchWooCommerce = async (attempts = 0) => {
  const maxAttempts = 3;
  const timeout = 30000; // 30 segundos de timeout
  
  try {
    console.log(`[PropertyPage] Intento #${attempts + 1} de obtener productos WooCommerce`);
    
    // Primera estrategia: API proxy interna
    try {
      const proxyResponse = await axios.get('/api/proxy', {
        params: {
          source: 'woocommerce',
          path: '/products',
          limit: 100 // Intentar obtener más productos
        },
        timeout: timeout
      });
      
      if (Array.isArray(proxyResponse.data) && proxyResponse.data.length > 0) {
        console.log(`[PropertyPage] Éxito con proxy interno: ${proxyResponse.data.length} productos`);
        return proxyResponse.data;
      }
    } catch (proxyError) {
      console.log('[PropertyPage] Error en proxy interno:', proxyError.message);
    }
    
    // Segunda estrategia: Endpoint específico para propiedades WooCommerce
    try {
      const specificResponse = await axios.get('/api/properties/sources/woocommerce', {
        timeout: timeout
      });
      
      if (Array.isArray(specificResponse.data) && specificResponse.data.length > 0) {
        console.log(`[PropertyPage] Éxito con endpoint específico: ${specificResponse.data.length} productos`);
        return specificResponse.data;
      }
    } catch (specificError) {
      console.log('[PropertyPage] Error en endpoint específico:', specificError.message);
    }
    
    // Tercera estrategia: API directa de WooCommerce
    try {
      const directResponse = await axios.get(
        '/api/proxy/woocommerce/products', {
          params: {
            per_page: 100 // Obtener más productos
          },
          timeout: timeout
        }
      );
      
      if (Array.isArray(directResponse.data) && directResponse.data.length > 0) {
        console.log(`[PropertyPage] Éxito obteniendo ${directResponse.data.length} propiedades directamente de WooCommerce API`);
        
        // Añadir un indicador de fuente para facilitar la identificación
        const processedProperties = directResponse.data.map(property => ({
          ...property,
          source: 'woocommerce'
        }));
        
        return processedProperties;
      } else {
        console.log('[PropertyPage] Respuesta vacía o inválida de la API directa de WooCommerce');
      }
    } catch (directError) {
      console.error('[PropertyPage] Error con la API directa de WooCommerce:', directError.message);
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    if (attempts < maxAttempts - 1) {
      console.log(`[PropertyPage] Reintentando obtener productos WooCommerce...`);
      // Esperar un tiempo antes del siguiente intento (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      return fetchWooCommerce(attempts + 1);
    }
    
    console.log('[PropertyPage] Todos los intentos de obtener productos WooCommerce fallaron');
    return [];
    
  } catch (error) {
    console.error('[PropertyPage] Error general en fetchWooCommerce:', error.message);
    return [];
  }
};

export default function PropertyPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const renderCountRef = useRef(0);
  const abortControllerRef = useRef(null);
  
  // DEBUG: Imprimir información de la API y configuración
  useEffect(() => {
    console.log('API URL configurada:', API_URL);
    console.log('BASE URL configurada:', BASE_URL);
    console.log('Configuración window.appConfig:', window.appConfig);
    
    // Verificar si hay un proxy o CORS configurado - usar proxy interno para evitar errores CORS
    try {
      // Uso de nuestro proxy interno en lugar de fetch directo
      axios.head('/api/proxy', {
        params: {
          source: 'mongodb',
          path: '/properties'
        },
        timeout: 5000
      })
      .then(response => {
        console.log('Verificación de conectividad con API exitosa', response.status);
      })
      .catch(error => {
        console.log('Verificación de conectividad con API a través del proxy falló, es normal en algunos navegadores', error.message);
      });
    } catch (err) {
      console.log('Error al intentar verificar conectividad con API', err.message);
    }
  }, []);

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
  const fetchPropertiesFromAPI = async () => {
    try {
      console.log(`[PropertyPage] Obteniendo propiedades de MongoDB usando: ${API_URL}/api/properties`);
      
      const response = await axios.get(`${API_URL}/api/properties`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        },
        timeout: 30000 // Aumentar el timeout a 30 segundos
      });
      
      if (validateResponse(response.data)) {
        const properties = response.data.properties || [];
        // Añadir indicador de fuente
        return properties.map(property => ({
          ...property,
          source: 'mongodb'
        }));
      }
      return [];
    } catch (error) {
      console.error('[PropertyPage] Error al obtener propiedades de MongoDB:', error);
      throw error; // Propagar el error para manejarlo en fetchAllProperties
    }
  };

  const fetchWooCommerceProperties = async () => {
    try {
      console.log(`[PropertyPage] Obteniendo propiedades de WooCommerce`);
      
      // Intentar primero con el proxy interno
      try {
        const proxyResponse = await axios.get('/api/proxy', {
          params: {
            source: 'woocommerce',
            path: '/products',
            per_page: 100  // Solicitar hasta 100 productos para asegurar obtener todos
          },
          timeout: 20000
        });
        
        if (validateResponse(proxyResponse.data) && Array.isArray(proxyResponse.data) && proxyResponse.data.length > 0) {
          console.log(`[PropertyPage] Éxito obteniendo ${proxyResponse.data.length} propiedades de WooCommerce a través del proxy general`);
          
          // Añadir un indicador de fuente
          const processedProperties = proxyResponse.data.map(property => ({
            ...property,
            source: 'woocommerce'
          }));
          
          return processedProperties;
        } else {
          console.log('[PropertyPage] Respuesta vacía o inválida del proxy general de WooCommerce, intentando proxy específico');
        }
      } catch (proxyError) {
        console.error('[PropertyPage] Error con el proxy general de WooCommerce:', proxyError.message);
      }
      
      // Intentar con el proxy específico para WooCommerce
      try {
        const specificProxyResponse = await axios.get('/api/properties/sources/woocommerce', {
          params: {
            page: 1,
            limit: 100  // Aumentar el límite para obtener todas las propiedades
          },
          timeout: 20000
        });
        
        if (validateResponse(specificProxyResponse.data) && Array.isArray(specificProxyResponse.data) && specificProxyResponse.data.length > 0) {
          console.log(`[PropertyPage] Éxito obteniendo ${specificProxyResponse.data.length} propiedades de WooCommerce a través del proxy específico`);
          
          // Asegurarse de que tengan indicador de fuente
          const processedProperties = specificProxyResponse.data.map(property => ({
            ...property,
            source: 'woocommerce'
          }));
          
          return processedProperties;
        } else {
          console.log('[PropertyPage] Respuesta vacía o inválida del proxy específico de WooCommerce, intentando conexión directa');
        }
      } catch (specificProxyError) {
        console.error('[PropertyPage] Error con el proxy específico de WooCommerce:', specificProxyError.message);
      }
      
      // Si ambos proxies fallan, intentar directamente con la API de WooCommerce
      console.log('[PropertyPage] Intentando conexión directa a WooCommerce API');
      try {
        const directResponse = await axios.get(
          '/api/proxy/woocommerce/products', {
            params: {
              per_page: 100 // Obtener más productos
            },
            timeout: 30000
          }
        );
        
        if (Array.isArray(directResponse.data) && directResponse.data.length > 0) {
          console.log(`[PropertyPage] Éxito obteniendo ${directResponse.data.length} propiedades directamente de WooCommerce API`);
          
          // Añadir un indicador de fuente para facilitar la identificación
          const processedProperties = directResponse.data.map(property => ({
            ...property,
            source: 'woocommerce'
          }));
          
          return processedProperties;
        } else {
          console.log('[PropertyPage] Respuesta vacía o inválida de la API directa de WooCommerce');
        }
      } catch (directError) {
        console.error('[PropertyPage] Error con la API directa de WooCommerce:', directError.message);
      }
      
      // Último intento: conexión directa a la URL completa
      try {
        console.log('[PropertyPage] Intento final: conexión directa a la URL completa de la API de WooCommerce');
        const finalResponse = await axios.get(
          'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products?consumer_key=ck_d69e61427264a7beea70ca9ee543b45dd00cae85&consumer_secret=cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e', {
            timeout: 30000
          }
        );
        
        if (Array.isArray(finalResponse.data) && finalResponse.data.length > 0) {
          console.log(`[PropertyPage] Éxito en intento final: ${finalResponse.data.length} propiedades obtenidas`);
          
          const processedProperties = finalResponse.data.map(property => ({
            ...property,
            source: 'woocommerce'
          }));
          
          return processedProperties;
        }
      } catch (finalError) {
        console.error('[PropertyPage] Error en intento final de WooCommerce:', finalError.message);
      }
      
      // Si todos los intentos fallan, devolver un array vacío
      console.error('[PropertyPage] Todos los intentos de obtener propiedades de WooCommerce fallaron');
      return [];
    } catch (error) {
      console.error('[PropertyPage] Error general al obtener propiedades de WooCommerce:', error);
      throw error; // Propagar el error para manejarlo en fetchAllProperties
    }
  };

  useEffect(() => {
    if (!router.isReady || !configLoaded) {
      console.log('[PropertyPage] Esperando router y configuración...');
      return;
    }

    const fetchAllProperties = async () => {
      setLoading(true);
      setError(null); // Resetear error al inicio
      
      let apiProperties = [];
      let wooCommerceProperties = [];
      let mongoDbError = null;
      let wooCommerceError = null;
      
      try {
        console.log('[PropertyPage] Iniciando carga de propiedades de MongoDB...');
        apiProperties = await fetchPropertiesFromAPI();
        console.log(`[PropertyPage] Propiedades de MongoDB cargadas: ${apiProperties.length}`);
      } catch (mongoError) {
        console.error('[PropertyPage] Error al cargar propiedades de MongoDB:', mongoError);
        mongoDbError = mongoError.message || 'Error al obtener propiedades de MongoDB';
      }
      
      try {
        console.log('[PropertyPage] Iniciando carga de propiedades de WooCommerce...');
        wooCommerceProperties = await fetchWooCommerceProperties();
        console.log(`[PropertyPage] Propiedades de WooCommerce cargadas: ${wooCommerceProperties.length}`);
      } catch (wooError) {
        console.error('[PropertyPage] Error al cargar propiedades de WooCommerce:', wooError);
        wooCommerceError = wooError.message || 'Error al obtener propiedades de WooCommerce';
      }
      
      // Combinar todas las propiedades disponibles
      const allProperties = [...apiProperties, ...wooCommerceProperties];
      
      if (allProperties.length > 0) {
        console.log(`[PropertyPage] Total de propiedades combinadas: ${allProperties.length}`);
        setProperties(allProperties);
        setTotalPages(Math.ceil(allProperties.length / ITEMS_PER_PAGE) || 1);
        
        // Si tenemos propiedades, no mostramos error aunque una de las fuentes haya fallado
        setError(null);
      } else {
        // Si no hay propiedades de ninguna fuente, mostrar mensaje de error combinado
        console.error('[PropertyPage] No se pudieron cargar propiedades de ninguna fuente');
        const errorMessages = [];
        if (mongoDbError) errorMessages.push(`MongoDB: ${mongoDbError}`);
        if (wooCommerceError) errorMessages.push(`WooCommerce: ${wooCommerceError}`);
        
        setError(errorMessages.length > 0 
          ? `No se pudieron cargar propiedades. ${errorMessages.join('. ')}` 
          : 'No se pudieron cargar propiedades de ninguna fuente.');
      }
      
      setLoading(false);
    };

    fetchAllProperties();
  }, [router.isReady, currentPage, configLoaded]);

  // Memoizar las propiedades filtradas
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) {
      console.log('[PropertyPage] No hay propiedades para filtrar');
      return [];
    }
    
    console.log(`[PropertyPage] Filtrando ${properties.length} propiedades con término: "${searchTerm}", tipo: "${selectedType}", ubicación: "${selectedLocation}"`);
    
    return properties.filter(property => {
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const location = (property.location || property.address || '').toLowerCase();
        const title = (property.title || property.name || '').toLowerCase();
        const description = (property.description || '').toLowerCase();
        
        if (!location.includes(searchLower) && 
            !title.includes(searchLower) && 
            !description.includes(searchLower)) {
          return false;
        }
      }
      
      // Filtrar por tipo
      if (selectedType && property.propertyType !== selectedType) {
        return false;
      }
      
      // Filtrar por ubicación
      if (selectedLocation && 
          (!property.location || !property.location.includes(selectedLocation))) {
        return false;
      }
      
      return true;
    });
  }, [properties, searchTerm, selectedType, selectedLocation]);

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

  // Modificar la función handlePropertyClick para ser más robusta
  const handlePropertyClick = useCallback((property) => {
    try {
      if (!property) {
        console.error('Propiedad inválida:', property);
        return;
      }

      // Obtener el ID con verificación adicional
      let navigationId = property._id || property.id;
      
      // Si no hay ID, intentar buscar en meta_data (para propiedades de WooCommerce)
      if (!navigationId && property.meta_data) {
        const idMeta = property.meta_data.find(meta => meta.key === 'property_id');
        if (idMeta && idMeta.value) {
          navigationId = idMeta.value;
        }
      }

      // Verificación final del ID
      if (!navigationId) {
        console.error('ID de propiedad no válido:', property);
        return;
      }

      console.log('[NAVEGACIÓN] Navegando a propiedad:', {
        id: navigationId,
        source: property.source || (property._id ? 'mongodb' : 'woocommerce')
      });

      // Usar window.location.href para asegurar navegación completa
      window.location.href = `/property/${navigationId}`;
    } catch (error) {
      console.error('[PropertyPage] Error al navegar:', error);
      // Fallback de navegación solo si tenemos algún ID
      if (property && (property.id || property._id)) {
        window.location.href = `/property/${property.id || property._id}`;
      }
    }
  }, []);

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
              {filteredProperties.map((property, index) => {
                // Determinar si es una propiedad de MongoDB
                const isMongoDBProperty = property.source === 'mongodb' || property._id || 
                  (property.id && typeof property.id === 'string' && property.id.length > 20);
                
                // Obtener ID según el tipo de propiedad
                const propertyId = isMongoDBProperty ? property._id : property.id;
                
                // Extraer título
                const title = isMongoDBProperty 
                  ? (property.title || 'Propiedad sin título') 
                  : (property.name || 'Propiedad sin título');
                
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
                      maximumFractionDigits: 0
                    }).format(price);
                  }
                } catch (e) {
                  console.error('Error al formatear precio:', e);
                }
                
                // Obtener imagen principal
                let mainImage = '/img/default-property-image.jpg';
                let imageAlt = title;
                
                if (property.images && Array.isArray(property.images) && property.images.length > 0) {
                  const firstImage = property.images[0];
                  console.log(`[DEBUG] Primera imagen para propiedad ${propertyId}:`, firstImage);
                  
                  if (typeof firstImage === 'string') {
                    mainImage = firstImage;
                  } else if (typeof firstImage === 'object') {
                    mainImage = firstImage.src || firstImage.url || firstImage.source_url || '/img/default-property-image.jpg';
                    imageAlt = firstImage.alt || title;
                  }
                  
                  // Usar la función de proxy para asegurar que la imagen se cargue correctamente
                  mainImage = getProxiedImageUrl(mainImage);
                }
                
                // Extraer características
                const bedrooms = property.bedrooms || property.rooms || '1';
                const bathrooms = property.bathrooms || property.wc || '1';
                const area = property.area || property.m2 || '0';
                
                // Extraer características adicionales
                const floor = property.piso || property.floor || null;
                const hasPool = property.pool || property.piscina || false;
                const hasGarage = property.garage || property.garaje || false;
                const hasTerrace = property.terrace || property.terraza || false;
                const hasGarden = property.garden || property.jardin || false;
                
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
                    onClick={() => router.push(`/property/${propertyId}`)}
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
                          {property.title === 'Sin título' ? 
                            (property.location ? `${property.location.split(',')[0]}` : 'Propiedad') : 
                            property.title
                          }
                          {property.location && property.location.trim() !== "" && (
                            <span className="block text-sm font-light text-amarillo mt-2">
                              <FaMapMarkerAlt className="inline-block mr-1 text-xs" /> 
                              {property.location}
                            </span>
                          )}
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
                            handlePropertyClick(property);
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