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

    try {
      console.log(`[useProperties] Cargando desde API principal: page=${pageNum}, limit=${limitNum}, source=${sourceType}`);
      
      // Usar la API principal que combina todas las fuentes
      const response = await fetch(`/api/properties?page=${pageNum}&limit=${limitNum}&source=${sourceType}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (currentRequestRef.current !== requestId) { 
        return; 
      }

      // Extraer propiedades y metadatos
      const properties = data.properties || [];
      const meta = data.meta || {};
      
      console.log(`[useProperties] ✅ Recibidas ${properties.length} propiedades`);
      console.log(`[useProperties] Fuentes: MongoDB(${meta.sources?.mongodb || 0}), WooCommerce(${meta.sources?.woocommerce || 0}), Fallback(${meta.sources?.fallback || 0})`);
      
      // Normalizar precios
      const normalizedProperties = properties.map(property => 
        normalizePropertyPrice({
          ...property,
          id: property.id || property._id || `prop_${Math.random().toString(36).substr(2, 9)}`
        })
      );

      if (currentRequestRef.current !== requestId) {
        setLoading(false);
        return;
      }

      setProperties(prev => pageNum === 1 ? normalizedProperties : [...prev, ...normalizedProperties]);
      setHasMore(meta.hasMore || false);
      setMeta(prev => ({
        ...prev,
        total: meta.total || normalizedProperties.length,
        sources: meta.sources || {},
        page: pageNum,
        limit: limitNum,
        hasMore: meta.hasMore || false
      }));

    } catch (e) {
      console.error('[useProperties] Error:', e);
      
      if (currentRequestRef.current === requestId) {
        setError(e);
        // En caso de error, usar datos de ejemplo
        const fallbackProps = EXAMPLE_PROPERTIES.map(p => ({ 
          ...p, 
          id: `${p.id}_${Date.now()}` 
        }));
        setProperties(prev => pageNum === 1 ? fallbackProps : [...prev, ...fallbackProps]);
        setHasMore(false);
        setMeta(prev => ({ 
          ...prev, 
          sources: { fallback: fallbackProps.length }, 
          page: pageNum, 
          hasMore: false,
          error: e.message
        }));
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