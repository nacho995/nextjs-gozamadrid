import { useState, useEffect, useCallback, useRef } from 'react';

// Cache global para propiedades
const propertiesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configuración optimizada
const CONFIG = {
  defaultLimit: 50,
  maxLimit: 100,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 20000
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

        // Usar directamente WooCommerce que sabemos que funciona
        const response = await fetch(`/api/properties/sources/woocommerce?page=${pageNum}&limit=${Math.min(limitNum, CONFIG.maxLimit)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        });

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
    if (autoLoad) {
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