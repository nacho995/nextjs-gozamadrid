import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { normalizePropertyPrice } from '@/utils/priceFormatter';

// Datos de ejemplo para fallback
const EXAMPLE_PROPERTIES = [
  {
    id: 'example_1',
    title: 'Apartamento de Lujo en Salamanca',
    price: '450000',
    location: 'Madrid, España',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: ['/property1.jpg'],
    source: 'ejemplo'
  },
  {
    id: 'example_2', 
    title: 'Ático con Terraza en Chamberí',
    price: '650000',
    location: 'Madrid, España',
    bedrooms: 2,
    bathrooms: 2,
    area: 100,
    images: ['/property2.jpg'],
    source: 'ejemplo'
  }
];

// Utilidades de cache
const getCacheKey = (page, limit, source) => `${source}_${page}_${limit}`;

const getFromCache = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    // console.error('[Cache] Error obteniendo de cache:', error);
    return null;
  }
};

const setToCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // console.error('[Cache] Error guardando en cache:', error);
  }
};

export const useProperties = (source = 'all', limit = 10, page = 1, skipInitialLoad = false, autoLoad = true) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [meta, setMeta] = useState({ total: 0, sources: {}, page: 1, limit: 10, hasMore: true });

  const hasAttemptedLoadRef = useRef(skipInitialLoad); 
  const currentRequestRef = useRef(null); 
  const isLoadingRef = useRef(loading);
  const [isHydrated, setIsHydrated] = useState(false);

  // Efecto para marcar como hidratado
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  const loadProperties = useCallback(async (pageNum = 1, limitNum = 10, sourceType = 'all', attempt = 1) => {
    if (isLoadingRef.current && attempt === 1) { 
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const requestId = Date.now(); 
    currentRequestRef.current = requestId;

    let allProperties = [];
    let sourcesMeta = { mongodb: 0, woocommerce: 0 };
    let hasRealData = false;

    try {
      const fetchWithFallback = async (apiEndpoint, cacheKey, sourceName, fallbackData = []) => {
        const cached = getFromCache(cacheKey);
        if (cached) {
          sourcesMeta[sourceName.toLowerCase()] = cached.length;
          hasRealData = true;
          return cached;
        }

        try {
          const response = await fetch(`${apiEndpoint}?page=${pageNum}&limit=${limitNum}`);
          if (!response.ok) throw new Error(`Error ${response.status} en ${sourceName}`);
          const data = await response.json();
          
          if (currentRequestRef.current !== requestId) { 
            return []; 
          }

          const validProperties = Array.isArray(data) ? data : (data.properties || []);
          setToCache(cacheKey, validProperties);
          sourcesMeta[sourceName.toLowerCase()] = validProperties.length;
          hasRealData = true;
          return validProperties;
        } catch (fetchError) {
          if (fallbackData.length > 0) {
             sourcesMeta[sourceName.toLowerCase()] = fallbackData.length;
             return fallbackData;
          }
          throw fetchError;
        }
      };

      if (sourceType === 'all' || sourceType === 'mongodb') {
        const mongoProperties = await fetchWithFallback('/api/properties/sources/mongodb', getCacheKey(pageNum, limitNum, 'mongodb'), 'MongoDB', []);
        const normalizedMongodb = mongoProperties.map(property => 
          normalizePropertyPrice({
            ...property,
            source: 'mongodb'
          })
        );
        allProperties = allProperties.concat(normalizedMongodb);
      }

      if (sourceType === 'all' || sourceType === 'woocommerce') {
        const wooProperties = await fetchWithFallback('/api/properties/sources/woocommerce', getCacheKey(pageNum, limitNum, 'woocommerce'), 'WooCommerce', []);
        const normalizedWoocommerce = wooProperties.map(property => 
          normalizePropertyPrice({
            ...property,
            source: 'woocommerce'
          })
        );
        allProperties = allProperties.concat(normalizedWoocommerce);
      }

      if (allProperties.length === 0 && !hasRealData) {
        allProperties = EXAMPLE_PROPERTIES.map(p => ({ ...p, id: `${p.id}_${Date.now()}` }));
      }
      
      if (currentRequestRef.current !== requestId) {
        setLoading(false);
        return;
      }

      setProperties(prev => pageNum === 1 ? allProperties : [...prev, ...allProperties]);
      setHasMore(allProperties.length === limitNum);
      setMeta(prev => ({
        ...prev,
        total: (prev.total || 0) + allProperties.length,
        sources: sourcesMeta,
        page: pageNum,
        limit: limitNum,
        hasMore: allProperties.length === limitNum
      }));

    } catch (e) {
      if (currentRequestRef.current === requestId) {
        setError(e);
        setProperties(EXAMPLE_PROPERTIES.map(p => ({ ...p, id: `${p.id}_${Date.now()}` })));
        setHasMore(false);
        setMeta(prev => ({ ...prev, sources: sourcesMeta, page: pageNum, hasMore: false }));
      }
    } finally {
      if (currentRequestRef.current === requestId) {
        setLoading(false);
        hasAttemptedLoadRef.current = true;
      }
    }
  }, []); // DEPENDENCIAS VACÍAS - loadProperties es estable

  // useEffect OPTIMIZADO - solo carga una vez después de hidratación
  useEffect(() => {
    if (isHydrated && autoLoad && !hasAttemptedLoadRef.current && !skipInitialLoad) {
      loadProperties(page, limit, source);
    }
  }, [isHydrated]); // SOLO isHydrated - sin autoLoad, page, limit, source

  return { properties, loading, error, hasMore, loadProperties, meta, setMeta };
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
      setToCache(cacheKey, data);
      return data;
    } catch (error) {
      // Usar datos de ejemplo sin log
      const data = EXAMPLE_PROPERTIES.find(p => p.id === propertyId) || EXAMPLE_PROPERTIES[0];
      setProperty(data);
      setError(error.message);
      return data;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return { property, loading, error, reload: loadProperty };
}; 