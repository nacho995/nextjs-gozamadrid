import { useState, useEffect, useCallback } from 'react';

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

// Hook para manejo de caché del navegador
const useBrowserCache = () => {
  // Función para obtener del caché del navegador
  const getBrowserCache = useCallback((key) => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > 5 * 60 * 1000; // 5 minutos
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsedCache.data;
    } catch (error) {
      console.error('Error leyendo caché del navegador:', error);
      return null;
    }
  }, []);

  // Función para guardar en caché del navegador
  const setBrowserCache = useCallback((key, data) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error guardando en caché del navegador:', error);
    }
  }, []);

  return { getBrowserCache, setBrowserCache };
};

// Función para limpiar caché expirado
const clearExpiredCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('properties_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsedCache = JSON.parse(cached);
            const isExpired = Date.now() - parsedCache.timestamp > 5 * 60 * 1000; // 5 minutos
            
            if (isExpired) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Si hay error parseando, eliminar la entrada
          keysToRemove.push(key);
        }
      }
    }
    
    // Eliminar las entradas expiradas
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`🧹 Limpiadas ${keysToRemove.length} entradas de caché expiradas`);
    }
  } catch (error) {
    console.error('Error limpiando caché expirado:', error);
  }
};

// Hook principal para propiedades con cache
export const useProperties = (config = {}) => {
  // Extraer configuraciones del objeto pasado como parámetro
  const {
    source = 'all',
    limit = 10,
    page = 1,
    skipInitialLoad = false,
    autoLoad = true,
    enableCache = true
  } = config;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sources: { mongodb: 0, ejemplo: 0 }
  });

  const { getBrowserCache, setBrowserCache } = useBrowserCache();

  // Limpiar caché al montar el componente por primera vez
  useEffect(() => {
    clearExpiredCache();
  }, []);

  // Función para obtener propiedades del caché
  const getCachedProperties = useCallback((sourceType) => {
    if (!enableCache) return null;
    
    const cached = getBrowserCache(`properties_${sourceType}_${limit}_${page}`);
    if (cached) {
      console.log(`🚀 Cache HIT para ${sourceType}: ${cached.length} propiedades`);
      setStats(prevStats => ({
        ...prevStats,
        total: cached.length,
        sources: { mongodb: 0, ejemplo: 0 }
      }));
      
      // Calcular estadísticas por fuente
      const sourceStats = cached.reduce((acc, prop) => {
        if (acc[prop.source] !== undefined) {
          acc[prop.source]++;
        }
        return acc;
      }, {
        mongodb: cached.filter(p => p.source === 'mongodb').length,
        ejemplo: cached.filter(p => p.source === 'ejemplo').length
      });
      
      setStats(prevStats => ({
        ...prevStats,
        total: cached.length,
        sources: sourceStats
      }));
      
      return cached;
    }
    console.log(`💨 Cache MISS para ${sourceType}`);
    return null;
  }, [getBrowserCache, limit, page, enableCache]);

  // Función para obtener propiedades de todas las fuentes
  const loadAllSources = useCallback(async () => {
    console.log('🚀 Iniciando carga de propiedades');
    const allProperties = [];
    
    // Función para obtener propiedades de MongoDB - REACTIVADA
    const fetchMongoDB = async () => {
      try {
        console.log('🔄 Cargando propiedades desde MongoDB...');
        const response = await fetch(`/api/properties/sources/mongodb?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          
          // Manejar nueva estructura de respuesta
          if (data.properties && Array.isArray(data.properties)) {
            console.log(`✅ MongoDB: ${data.properties.length} propiedades cargadas (fuente: ${data.source})`);
            return data.properties.map(prop => ({
              ...prop,
              source: 'mongodb'
            }));
          } else if (Array.isArray(data)) {
            // Fallback para estructura antigua
            console.log(`✅ MongoDB: ${data.length} propiedades cargadas`);
            return data.map(prop => ({
              ...prop,
              source: 'mongodb'
            }));
          } else {
            console.warn('⚠️ MongoDB: Estructura de respuesta inesperada', data);
            return [];
          }
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        console.warn('⚠️ MongoDB no disponible:', error.message);
        return [];
      }
    };

    // Cargar desde ambas fuentes en paralelo
    const [mongoData] = await Promise.all([
      fetchMongoDB(),
    ]);

    allProperties.push(...mongoData);

    // Si no hay datos reales, usar datos de ejemplo
    if (allProperties.length === 0) {
      console.log('📝 Sin datos reales, usando datos de ejemplo');
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      allProperties.push(...EXAMPLE_PROPERTIES.slice(startIndex, endIndex));
    }

    return allProperties;
  }, [page, limit]);

  // Cargar propiedades por fuente específica
  const loadBySource = useCallback(async (sourceType) => {
    switch (sourceType) {
      case 'mongodb':
        try {
          console.log('🔄 Cargando propiedades específicamente desde MongoDB...');
          const response = await fetch(`/api/properties/sources/mongodb?page=${page}&limit=${limit}`);
          if (response.ok) {
            const data = await response.json();
            
            // Manejar nueva estructura de respuesta
            if (data.properties && Array.isArray(data.properties)) {
              console.log(`✅ MongoDB específico: ${data.properties.length} propiedades cargadas (fuente: ${data.source})`);
              // Mostrar información de paginación si está disponible
              if (data.pagination) {
                console.log(`📊 MongoDB pagination: ${data.pagination.currentPage}/${data.pagination.totalPages} (${data.pagination.totalCount} total)`);
                setHasMore(data.pagination.hasMore);
              }
              return data.properties.map(prop => ({
                ...prop,
                source: 'mongodb'
              }));
            } else if (Array.isArray(data)) {
              // Fallback para estructura antigua
              console.log(`✅ MongoDB específico: ${data.length} propiedades cargadas`);
              return data.map(prop => ({
                ...prop,
                source: 'mongodb'
              }));
            } else {
              console.warn('⚠️ MongoDB: Estructura de respuesta inesperada', data);
              return [];
            }
          }
          throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          console.error('Error cargando MongoDB:', error);
          return [];
        }

      case 'ejemplo':
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return EXAMPLE_PROPERTIES.slice(startIndex, endIndex);

      default:
        return [];
    }
  }, [page, limit]);

  // Función principal para cargar propiedades
  const loadProperties = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      let loadedProperties = [];

      // Verificar caché primero (si no es refresh forzado)
      if (!forceRefresh) {
        const cached = getCachedProperties(source);
        if (cached) {
          setProperties(cached);
          setLoading(false);
          return cached;
        }
      }

      // Cargar según la fuente especificada
      if (source === 'all') {
        loadedProperties = await loadAllSources();
      } else {
        loadedProperties = await loadBySource(source);
      }

      // Actualizar estadísticas
      const sourceStats = loadedProperties.reduce((acc, prop) => {
        if (acc[prop.source] !== undefined) {
          acc[prop.source]++;
        }
        return acc;
      }, {
        mongodb: loadedProperties.filter(p => p.source === 'mongodb').length,
        ejemplo: loadedProperties.filter(p => p.source === 'ejemplo').length
      });

      setStats({
        total: loadedProperties.length,
        sources: sourceStats
      });

      // Guardar en caché del navegador
      setBrowserCache(`properties_${source}_${limit}_${page}`, loadedProperties);
      
      setProperties(loadedProperties);
      setHasMore(loadedProperties.length >= limit);
      
      console.log(`✅ Cargadas ${loadedProperties.length} propiedades de ${source}`);
      return loadedProperties;
    } catch (error) {
      console.error('❌ Error cargando propiedades:', error);
      setError(error.message);
      
      // En caso de error, intentar con datos de ejemplo
      if (source === 'all' || source === 'ejemplo') {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const fallbackData = EXAMPLE_PROPERTIES.slice(startIndex, endIndex);
        setProperties(fallbackData);
        setStats({
          total: fallbackData.length,
          sources: { mongodb: 0, ejemplo: EXAMPLE_PROPERTIES.length }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [source, limit, page, getCachedProperties, setBrowserCache, loadAllSources, loadBySource]);

  // Efecto para cargar propiedades cuando cambian los parámetros
  useEffect(() => {
    if (!skipInitialLoad) {
      loadProperties();
    }
  }, [loadProperties, skipInitialLoad]);

  // Función para recargar datos
  const refresh = useCallback(() => {
    return loadProperties(true);
  }, [loadProperties]);

  return {
    properties,
    loading,
    error,
    hasMore,
    stats,
    meta: stats,
    refresh,
    loadProperties
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