import { useState, useEffect, useCallback, useRef } from 'react';
import { wooCommerceCache } from '@/services/woocommerce-cache';

// Cache global para propiedades
const propertiesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configuración optimizada
const CONFIG = {
  defaultLimit: 20,
  maxLimit: 50, // Permitir hasta 50 propiedades por petición
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000
};

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
    sources: { woocommerce: 0, mongodb: 0 }
  });

  // Referencias para evitar re-renders innecesarios
  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);

  // Función de carga con retry y optimizaciones
  const loadProperties = useCallback(async (pageNum = page, limitNum = limit, sourceType = source, options = {}) => {
    console.log(`[useProperties] loadProperties called. Page: ${pageNum}, Limit: ${limitNum}, Source: ${sourceType}`);
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
            mongodb: cached.filter(p => p.source === 'mongodb').length
          }
        }));
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    // Función de retry con backoff exponencial
    const fetchWithRetry = async (attempt = 1) => {
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: Math.min(limitNum, CONFIG.maxLimit).toString(),
          source: sourceType,
          cache: useCache.toString()
        });

        console.log(`🔄 Cargando propiedades: página=${pageNum}, límite=${limitNum}, fuente=${sourceType}, intento=${attempt}`);

        let response;
        
        if (sourceType === 'all') {
          // Cargar de ambas fuentes y combinar
          console.log('🔄 Cargando de ambas fuentes: MongoDB y WooCommerce');
          
          // Función para obtener propiedades de WooCommerce usando el caché
          const fetchWooCommerceWithCache = async () => {
            try {
              console.log('🔄 Obteniendo propiedades de WooCommerce del caché...');
              const wooData = await wooCommerceCache.getProperties();
              
              if (wooData && wooData.length > 0) {
                console.log(`✅ WooCommerce caché: ${wooData.length} propiedades`);
                return { 
                  status: 'fulfilled', 
                  value: { 
                    ok: true, 
                    json: async () => wooData 
                  } 
                };
              }
              
              // Si no hay datos en caché, intentar forzar refresh
              console.log('⚠️ Sin datos en caché, intentando refresh...');
              const refreshedData = await wooCommerceCache.getProperties(true);
              
              return { 
                status: 'fulfilled', 
                value: { 
                  ok: true, 
                  json: async () => refreshedData || [] 
                } 
              };
            } catch (error) {
              console.error('❌ Error obteniendo WooCommerce del caché:', error.message);
              return { status: 'rejected', reason: error };
            }
          };

          const [mongoResponse, wooResponse] = await Promise.allSettled([
            fetch(`/api/properties/sources/mongodb?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              signal: abortControllerRef.current.signal
            }),
            fetchWooCommerceWithCache()
          ]);
          
          const allProperties = [];
          
          // Procesar MongoDB
          if (mongoResponse.status === 'fulfilled' && mongoResponse.value.ok) {
            try {
              const mongoData = await mongoResponse.value.json();
              if (Array.isArray(mongoData)) {
                console.log(`✅ MongoDB: ${mongoData.length} propiedades`);
                allProperties.push(...mongoData);
              }
            } catch (error) {
              console.warn('⚠️ Error procesando datos de MongoDB:', error);
            }
          } else {
            console.warn('⚠️ MongoDB no disponible:', mongoResponse.reason?.message || 'Error desconocido');
          }
          
          // Procesar WooCommerce
          if (wooResponse.status === 'fulfilled' && wooResponse.value.ok) {
            try {
              const wooData = await wooResponse.value.json();
              if (Array.isArray(wooData)) {
                console.log(`✅ WooCommerce: ${wooData.length} propiedades`);
                allProperties.push(...wooData);
              }
            } catch (error) {
              console.warn('⚠️ Error procesando datos de WooCommerce:', error);
            }
          } else {
            console.warn('⚠️ WooCommerce no disponible:', wooResponse.reason?.message || 'Error desconocido');
          }
          
          // Si no hay propiedades de ninguna fuente, lanzar error
          if (allProperties.length === 0) {
            throw new Error('No se pudieron cargar propiedades de ninguna fuente');
          }
          
          // Crear una respuesta simulada con los datos combinados
          response = {
            ok: true,
            json: async () => allProperties
          };
          
        } else if (sourceType === 'mongodb') {
          response = await fetch(`/api/properties/sources/mongodb?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: abortControllerRef.current.signal
          });
        } else {
          // WooCommerce por defecto
          response = await fetch(`/api/properties/sources/woocommerce?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: abortControllerRef.current.signal
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Verificar si esta es la petición más reciente
        if (lastRequestRef.current !== requestId) {
          console.log('⚠️ Petición obsoleta, ignorando...');
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error('Respuesta inválida del servidor');
        }

        // Guardar en cache
        if (useCache && data.length > 0) {
          setCache(cacheKey, data);
        }

        // Actualizar estado
        if (append) {
          setProperties(prev => {
            const newProperties = [...prev, ...data];
            // Eliminar duplicados por ID
            const uniqueProperties = newProperties.filter((prop, index, self) => 
              index === self.findIndex(p => p.id === prop.id)
            );
            return uniqueProperties;
          });
        } else {
          setProperties(data);
        }

        setMeta(prev => ({
          ...prev,
          page: pageNum,
          limit: limitNum,
          total: data.length,
          hasMore: data.length === limitNum,
          sources: {
            woocommerce: data.filter(p => p.source === 'woocommerce').length,
            mongodb: data.filter(p => p.source === 'mongodb').length
          }
        }));

        console.log(`✅ Propiedades cargadas: ${data.length} elementos`);
        return data;

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

        throw error;
      }
    };

    try {
      return await fetchWithRetry();
    } catch (error) {
      console.error('💥 Error final:', error.message);
      setError(error.message);
      return [];
    } finally {
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

  // Efecto para carga automática
  useEffect(() => {
    console.log('[useProperties] useEffect for autoLoad triggered. autoLoad:', autoLoad);
    if (autoLoad) {
      console.log('[useProperties] Calling loadProperties from useEffect');
      loadProperties();
    }

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoLoad, loadProperties]);

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