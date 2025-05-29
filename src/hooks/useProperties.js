import { useState, useEffect, useCallback, useRef } from 'react';
import { wooCommerceCache } from '@/services/woocommerce-cache';

// Cache global para propiedades
const propertiesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configuración optimizada
const CONFIG = {
  defaultLimit: 20,
  maxLimit: 50,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000
};

// Datos de ejemplo para cuando no hay propiedades reales
const EXAMPLE_PROPERTIES = [
  {
    id: 'ejemplo-1',
    title: 'Moderno Apartamento en Madrid Centro',
    description: 'Hermoso apartamento completamente renovado en el corazón de Madrid',
    price: 450000,
    source: 'ejemplo',
    images: [
      { url: 'https://placekitten.com/800/600', alt: 'Apartamento Madrid Centro' }
    ],
    features: { 
      bedrooms: 3, 
      bathrooms: 2, 
      area: 95 
    },
    location: 'Madrid Centro, Madrid',
    address: 'Calle Gran Vía, Madrid',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'ejemplo-2',
    title: 'Ático con Terraza en Malasaña',
    description: 'Espectacular ático con terraza privada en zona premium',
    price: 680000,
    source: 'ejemplo',
    images: [
      { url: 'https://placekitten.com/800/601', alt: 'Ático Malasaña' }
    ],
    features: { 
      bedrooms: 2, 
      bathrooms: 2, 
      area: 110 
    },
    location: 'Malasaña, Madrid',
    address: 'Calle Fuencarral, Madrid',
    coordinates: { lat: 40.4250, lng: -3.7033 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'ejemplo-3',
    title: 'Casa Familiar en Las Rozas',
    description: 'Amplia casa unifamiliar con jardín privado',
    price: 750000,
    source: 'ejemplo',
    images: [
      { url: 'https://placekitten.com/800/602', alt: 'Casa Las Rozas' }
    ],
    features: { 
      bedrooms: 4, 
      bathrooms: 3, 
      area: 180 
    },
    location: 'Las Rozas, Madrid',
    address: 'Urbanización El Cantizal, Las Rozas',
    coordinates: { lat: 40.4922, lng: -3.8739 },
    createdAt: new Date().toISOString()
  }
];

// Utilidades de cache
const getCacheKey = (page, limit, source) => `${source}_${page}_${limit}`;

const getFromCache = (key) => {
  const cached = propertiesCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  propertiesCache.delete(key);
  return null;
};

const setCache = (key, data) => {
  if (propertiesCache.size >= 100) {
    const oldestKey = propertiesCache.keys().next().value;
    propertiesCache.delete(oldestKey);
  }
  propertiesCache.set(key, { data, timestamp: Date.now() });
};

// Hook principal optimizado
export const useProperties = (options = {}) => {
  const {
    page = 1,
    limit = CONFIG.defaultLimit,
    source = 'all',
    autoLoad = true,
    enableCache = true
  } = options;

  // Estados
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: CONFIG.defaultLimit,
    total: 0,
    hasMore: true,
    sources: { woocommerce: 0, mongodb: 0, ejemplo: 0 }
  });

  // Referencias para evitar re-renders innecesarios
  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);
  const isLoadingRef = useRef(false);
  const hasAttemptedLoadRef = useRef(false);

  // Función de carga con retry y optimizaciones
  const loadProperties = useCallback(async (pageNum = page, limitNum = limit, sourceType = source, options = {}) => {
    console.log(`[useProperties] loadProperties called. Page: ${pageNum}, Limit: ${limitNum}, Source: ${sourceType}`);
    
    // Evitar múltiples cargas simultáneas
    if (isLoadingRef.current) {
      console.log('[useProperties] Ya hay una carga en progreso, ignorando...');
      return [];
    }
    
    const { append = false, useCache = enableCache } = options;
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    const requestId = `${pageNum}_${limitNum}_${sourceType}_${Date.now()}`;
    lastRequestRef.current = requestId;

    // Verificar cache primero
    const cacheKey = getCacheKey(pageNum, limitNum, sourceType);
    if (useCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`🚀 Cache hit: ${cached.length} propiedades`);
        if (append) {
          setProperties(prev => [...prev, ...cached]);
        } else {
          setProperties(cached);
        }
        setMeta(prev => ({
          ...prev,
          page: pageNum,
          limit: limitNum,
          total: cached.length,
          sources: {
            woocommerce: cached.filter(p => p.source === 'woocommerce').length,
            mongodb: cached.filter(p => p.source === 'mongodb').length,
            ejemplo: cached.filter(p => p.source === 'ejemplo').length
          }
        }));
        return cached;
      }
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    // Función de retry con backoff exponencial
    const fetchWithRetry = async (attempt = 1) => {
      try {
        console.log(`🔄 Cargando propiedades: página=${pageNum}, límite=${limitNum}, fuente=${sourceType}, intento=${attempt}`);

        let allProperties = [];
        let hasRealData = false;
        
        if (sourceType === 'all') {
          console.log('🔄 Cargando de ambas fuentes: MongoDB y WooCommerce');
          
          // Función para obtener propiedades de WooCommerce usando el caché
          const fetchWooCommerceWithCache = async () => {
            try {
              console.log('🔄 WooCommerce: Intento 1/3');
              const wooData = await wooCommerceCache.getProperties();
              
              if (wooData && wooData.length > 0) {
                console.log(`✅ WooCommerce: ${wooData.length} propiedades cargadas y cacheadas`);
                return wooData;
              }
              
              console.log('⚠️ Sin datos en caché, intentando refresh...');
              console.log('🔄 WooCommerce: Intento 1/3');
              const refreshedData = await wooCommerceCache.getProperties(true);
              console.log(`✅ WooCommerce: ${(refreshedData || []).length} propiedades cargadas y cacheadas`);
              
              return refreshedData || [];
            } catch (error) {
              console.error('❌ Error obteniendo WooCommerce del caché:', error.message);
              return [];
            }
          };

          // Obtener datos de ambas fuentes
          try {
            const mongoResponse = await fetch(`/api/properties/sources/mongodb?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              signal: abortControllerRef.current.signal
            });
            
            if (mongoResponse.ok) {
              const mongoData = await mongoResponse.json();
              if (Array.isArray(mongoData) && mongoData.length > 0) {
                console.log(`✅ MongoDB: ${mongoData.length} propiedades`);
                allProperties.push(...mongoData);
                hasRealData = true;
              }
            }
          } catch (error) {
            console.warn('⚠️ MongoDB no disponible:', error.message);
          }
          
          try {
            const wooData = await fetchWooCommerceWithCache();
            if (Array.isArray(wooData) && wooData.length > 0) {
              allProperties.push(...wooData);
              hasRealData = true;
            }
          } catch (error) {
            console.warn('⚠️ WooCommerce no disponible:', error.message);
          }
          
        } else if (sourceType === 'mongodb') {
          try {
            const response = await fetch(`/api/properties/sources/mongodb?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              signal: abortControllerRef.current.signal
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                allProperties = data;
                hasRealData = true;
              }
            }
          } catch (error) {
            console.error('Error cargando MongoDB:', error);
          }
        } else {
          // WooCommerce por defecto
          try {
            const data = await wooCommerceCache.getProperties();
            if (Array.isArray(data) && data.length > 0) {
              allProperties = data;
              hasRealData = true;
            }
          } catch (error) {
            console.error('Error cargando WooCommerce:', error);
          }
        }

        // Si no hay datos reales después de todos los intentos, usar ejemplos
        if (!hasRealData && allProperties.length === 0) {
          console.log('🏠 No hay propiedades reales disponibles, usando ejemplos');
          allProperties = EXAMPLE_PROPERTIES.slice(0, limitNum);
        }

        // Verificar si esta es la petición más reciente
        if (lastRequestRef.current !== requestId) {
          console.log('⚠️ Petición obsoleta, ignorando...');
          return;
        }

        // Guardar en cache solo si hay datos reales
        if (useCache && hasRealData && allProperties.length > 0) {
          setCache(cacheKey, allProperties);
        }

        // Actualizar estado
        if (append) {
          setProperties(prev => {
            const newProperties = [...prev, ...allProperties];
            const uniqueProperties = newProperties.filter((prop, index, self) => 
              index === self.findIndex(p => p.id === prop.id)
            );
            return uniqueProperties;
          });
        } else {
          setProperties(allProperties);
        }

        setMeta(prev => ({
          ...prev,
          page: pageNum,
          limit: limitNum,
          total: allProperties.length,
          hasMore: allProperties.length === limitNum,
          sources: {
            woocommerce: allProperties.filter(p => p.source === 'woocommerce').length,
            mongodb: allProperties.filter(p => p.source === 'mongodb').length,
            ejemplo: allProperties.filter(p => p.source === 'ejemplo').length
          }
        }));

        console.log(`✅ Propiedades cargadas: ${allProperties.length} elementos (${hasRealData ? 'reales' : 'ejemplos'})`);
        return allProperties;

      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('🚫 Petición cancelada');
          return;
        }

        console.error(`❌ Error en intento ${attempt}:`, error.message);

        if (attempt < CONFIG.retryAttempts) {
          const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(attempt + 1);
        }

        // En el último intento fallido, devolver ejemplos
        console.log('🏠 Usando propiedades de ejemplo debido a errores');
        return EXAMPLE_PROPERTIES.slice(0, limitNum);
      }
    };

    try {
      const result = await fetchWithRetry();
      hasAttemptedLoadRef.current = true;
      return result || [];
    } catch (error) {
      console.error('💥 Error final:', error.message);
      hasAttemptedLoadRef.current = true;
      setError(error.message);
      
      // Devolver ejemplos como fallback final
      console.log('🏠 Usando propiedades de ejemplo como fallback final');
      const exampleData = EXAMPLE_PROPERTIES.slice(0, limitNum);
      setProperties(exampleData);
      setMeta(prev => ({
        ...prev,
        total: exampleData.length,
        sources: { woocommerce: 0, mongodb: 0, ejemplo: exampleData.length }
      }));
      return exampleData;
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [page, limit, source, enableCache]);

  // Función para cargar más propiedades (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loading || !meta.hasMore) return;
    
    const nextPage = meta.page + 1;
    return loadProperties(nextPage, limit, source, { append: true });
  }, [loading, meta.hasMore, meta.page, limit, source, loadProperties]);

  // Función para refrescar
  const refresh = useCallback(async () => {
    // Limpiar cache para esta configuración
    const cacheKey = getCacheKey(page, limit, source);
    propertiesCache.delete(cacheKey);
    
    hasAttemptedLoadRef.current = false;
    setProperties([]);
    return loadProperties(page, limit, source, { useCache: false });
  }, [page, limit, source, loadProperties]);

  // Función para cambiar filtros
  const changeFilters = useCallback(async (newFilters) => {
    const { page: newPage = 1, limit: newLimit = limit, source: newSource = source } = newFilters;
    
    setProperties([]);
    setMeta(prev => ({
      ...prev,
      page: newPage,
      limit: newLimit,
      hasMore: true
    }));
    
    return loadProperties(newPage, newLimit, newSource);
  }, [limit, source, loadProperties]);

  // Efecto para carga automática - con protección contra bucles
  useEffect(() => {
    console.log('[useProperties] useEffect for autoLoad triggered. autoLoad:', autoLoad, 'hasAttempted:', hasAttemptedLoadRef.current);
    if (autoLoad && !hasAttemptedLoadRef.current && !isLoadingRef.current) {
      console.log('[useProperties] Calling loadProperties from useEffect');
      loadProperties();
    }

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoLoad]); // Solo depende de autoLoad

  // Limpiar cache periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of propertiesCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          propertiesCache.delete(key);
        }
      }
    }, CACHE_TTL);

    return () => clearInterval(interval);
  }, []);

  return {
    // Datos
    properties,
    loading,
    error,
    meta,
    
    // Acciones
    loadProperties,
    loadMore,
    refresh,
    changeFilters,
    
    // Utilidades
    clearCache: () => propertiesCache.clear(),
    getCacheSize: () => propertiesCache.size
  };
};

// Hook para propiedades individuales con cache
export const useProperty = (propertyId) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProperty = useCallback(async () => {
    if (!propertyId) return;

    const cacheKey = `property_${propertyId}`;
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      setProperty(cached);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProperty(data);
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return { property, loading, error, reload: loadProperty };
};

export default useProperties; 