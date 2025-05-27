// Sistema de caché robusto para WooCommerce
class WooCommerceCache {
  constructor() {
    this.cache = new Map();
    this.lastFetch = null;
    this.isRefreshing = false;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    this.STALE_DURATION = 60 * 60 * 1000; // 1 hora - datos válidos aunque viejos
  }

  // Obtener propiedades del caché o fetch
  async getProperties(forceRefresh = false) {
    const now = Date.now();
    const cacheKey = 'woocommerce_properties';
    const cached = this.cache.get(cacheKey);

    // Si tenemos datos en caché y no están muy viejos, los devolvemos
    if (cached && !forceRefresh) {
      const age = now - cached.timestamp;
      
      // Datos frescos: devolver inmediatamente
      if (age < this.CACHE_DURATION) {
        console.log('✅ WooCommerce: Devolviendo datos del caché (frescos)');
        return cached.data;
      }
      
      // Datos viejos pero válidos: devolver y refrescar en segundo plano
      if (age < this.STALE_DURATION) {
        console.log('⚡ WooCommerce: Devolviendo datos del caché (stale) y refrescando en segundo plano');
        this.refreshInBackground();
        return cached.data;
      }
    }

    // No hay caché o está muy viejo: intentar fetch
    try {
      const data = await this.fetchFromAPI();
      return data;
    } catch (error) {
      // Si falla el fetch y tenemos datos viejos, los devolvemos
      if (cached) {
        console.log('⚠️ WooCommerce: Error en fetch, devolviendo datos antiguos del caché');
        return cached.data;
      }
      
      // No hay caché ni podemos hacer fetch: devolver array vacío
      console.error('❌ WooCommerce: Sin caché y sin conexión');
      return [];
    }
  }

  // Fetch con reintentos inteligentes
  async fetchFromAPI() {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 segundo
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 WooCommerce: Intento ${attempt}/${maxRetries}`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // AUMENTADO: 10 segundos (antes 5000)
        
        const response = await fetch('/api/properties/sources/woocommerce?limit=100', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Guardar en caché
        this.cache.set('woocommerce_properties', {
          data: Array.isArray(data) ? data : [],
          timestamp: Date.now()
        });
        
        console.log(`✅ WooCommerce: ${data.length} propiedades cargadas y cacheadas`);
        return data;
        
      } catch (error) {
        console.error(`❌ WooCommerce: Error en intento ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          // Espera exponencial con jitter
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`⏳ Esperando ${Math.round(delay)}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error('WooCommerce no disponible después de todos los reintentos');
  }

  // Refrescar caché en segundo plano
  async refreshInBackground() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    try {
      await this.fetchFromAPI();
    } catch (error) {
      console.error('❌ Error refrescando caché en segundo plano:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  // Limpiar caché
  clear() {
    this.cache.clear();
    this.lastFetch = null;
  }
}

// Singleton
export const wooCommerceCache = new WooCommerceCache(); 