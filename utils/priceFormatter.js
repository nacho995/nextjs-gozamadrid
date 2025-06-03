/**
 * UTILIDAD CENTRALIZADA PARA FORMATEO DE PRECIOS - Goza Madrid
 * Versión 2.0 - Soluciona problemas de inconsistencias entre fuentes
 * 
 * Problemas que resuelve:
 * - Precios en céntimos vs euros
 * - Precios reducidos (350 = 350.000€)
 * - Diferentes formatos entre MongoDB y WooCommerce
 * - Inconsistencias en producción
 */

/**
 * Detecta y normaliza un precio desde cualquier fuente
 * @param {string|number} rawPrice - Precio sin procesar
 * @param {string} source - Fuente del dato ('mongodb', 'woocommerce', 'auto')
 * @returns {number} - Precio normalizado en euros
 */
export const normalizePrice = (rawPrice, source = 'auto') => {
  if (!rawPrice || rawPrice === 'Consultar' || rawPrice === 'undefined') return 0;
  
  let numericPrice;
  
  // Convertir a número si es una cadena
  if (typeof rawPrice === 'string') {
    // Eliminar cualquier carácter que no sea número, punto, coma o guión
    const cleanPrice = rawPrice.replace(/[^\d.,-]/g, '');
    // Convertir coma decimal europea a punto
    const normalizedPrice = cleanPrice.replace(',', '.');
    numericPrice = parseFloat(normalizedPrice);
  } else {
    numericPrice = Number(rawPrice);
  }
  
  // Verificar si es un número válido
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return 0;
  }

  // LÓGICA DE DETECCIÓN Y CORRECCIÓN INTELIGENTE
  
  // 1. Si el precio está en céntimos (muy común en WooCommerce)
  // Ejemplo: 25000000 = 250.000€ (no 25 millones)
  if (numericPrice >= 1000000 && numericPrice <= 1000000000) {
    // Probablemente está en céntimos, dividir por 100
    const euroPrice = numericPrice / 100;
    console.log(`[PriceFormatter] Precio detectado en céntimos: ${numericPrice} → ${euroPrice}€`);
    return euroPrice;
  }

  // 2. Si el precio está en formato reducido/miles
  // Ejemplo: 350 = 350.000€, 1200 = 1.200.000€
  if (numericPrice >= 50 && numericPrice < 10000) {
    const adjustedPrice = numericPrice * 1000;
    console.log(`[PriceFormatter] Precio detectado en miles: ${numericPrice} → ${adjustedPrice}€`);
    return adjustedPrice;
  }

  // 3. Si es un precio muy bajo (probablemente error)
  // Ejemplo: 2 = podría ser 200.000€ (multiplicar por 100.000)
  if (numericPrice >= 1 && numericPrice < 50) {
    const adjustedPrice = numericPrice * 100000;
    console.log(`[PriceFormatter] Precio muy bajo detectado: ${numericPrice} → ${adjustedPrice}€`);
    return adjustedPrice;
  }

  // 4. Si el precio ya está en euros y parece correcto
  if (numericPrice >= 10000 && numericPrice < 100000000) {
    return numericPrice;
  }

  // 5. Si el precio es extremadamente alto (posiblemente en céntimos mal convertidos)
  if (numericPrice > 100000000) {
    const euroPrice = numericPrice / 10000; // Dividir por 10.000 en casos extremos
    console.log(`[PriceFormatter] Precio extremadamente alto: ${numericPrice} → ${euroPrice}€`);
    return euroPrice;
  }

  // 6. Fallback: devolver el precio original si no encaja en ningún patrón
  console.warn(`[PriceFormatter] Precio no reconocido, usando valor original: ${numericPrice}€`);
  return numericPrice;
};

/**
 * Formatea un precio normalizado como cadena con formato español
 * @param {string|number} rawPrice - Precio sin procesar  
 * @param {object} options - Opciones de formateo
 * @returns {string} - Precio formateado (ej: "350.000 €")
 */
export const formatPrice = (rawPrice, options = {}) => {
  const {
    currency = 'EUR',
    locale = 'es-ES',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showCurrency = true,
    compactNotation = false
  } = options;
  
  const normalizedPrice = normalizePrice(rawPrice);
  
  if (normalizedPrice === 0) {
    return 'Consultar precio';
  }

  // Formato compacto para precios muy altos
  if (compactNotation && normalizedPrice >= 1000000) {
    const millions = normalizedPrice / 1000000;
    if (millions >= 1) {
      return `${millions.toFixed(1)}M €`;
    }
  }

  if (showCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay: 'symbol'
    }).format(normalizedPrice);
  } else {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(normalizedPrice);
  }
};

/**
 * Obtiene el valor numérico limpio de un precio (para cálculos)
 * @param {string|number} rawPrice - Precio sin procesar
 * @returns {number} - Valor numérico del precio en euros
 */
export const getPriceValue = (rawPrice) => {
  return normalizePrice(rawPrice);
};

/**
 * Valida si un precio es válido y tiene sentido
 * @param {string|number} rawPrice - Precio a validar
 * @returns {boolean} - true si el precio es válido
 */
export const isValidPrice = (rawPrice) => {
  const normalizedPrice = normalizePrice(rawPrice);
  return normalizedPrice > 0 && normalizedPrice >= 1000; // Mínimo 1.000€
};

/**
 * Convierte un precio formateado de vuelta a número
 * @param {string} formattedPrice - Precio formateado (ej: "350.000 €")
 * @returns {number} - El valor numérico
 */
export const parseFormattedPrice = (formattedPrice) => {
  if (!formattedPrice || typeof formattedPrice !== 'string') {
    return 0;
  }
  
  // Eliminar símbolos de moneda, espacios y convertir formato europeo
  const cleanPrice = formattedPrice
    .replace(/[€$£¥₹]/g, '') // Eliminar símbolos de moneda
    .replace(/\s/g, '') // Eliminar espacios
    .replace(/\./g, '') // Eliminar puntos de miles
    .replace(',', '.'); // Convertir coma decimal a punto
  
  const numericValue = parseFloat(cleanPrice);
  return isNaN(numericValue) ? 0 : numericValue;
};

/**
 * Genera rangos de ofertas basados en un precio
 * @param {string|number} rawPrice - El precio base
 * @returns {Array} - Array con rangos de ofertas
 */
export const generateOfferRanges = (rawPrice) => {
  const numericPrice = normalizePrice(rawPrice);
  
  if (numericPrice <= 0) return [];
  
  const ranges = [];
  
  // Ofertas por debajo del precio
  ranges.push({
    label: "5% menos",
    value: Math.round(numericPrice * 0.95),
    percentage: -5,
    formatted: formatPrice(Math.round(numericPrice * 0.95))
  });
  
  ranges.push({
    label: "10% menos", 
    value: Math.round(numericPrice * 0.9),
    percentage: -10,
    formatted: formatPrice(Math.round(numericPrice * 0.9))
  });
  
  ranges.push({
    label: "15% menos",
    value: Math.round(numericPrice * 0.85), 
    percentage: -15,
    formatted: formatPrice(Math.round(numericPrice * 0.85))
  });
  
  // Precio exacto
  ranges.push({
    label: "Precio publicado",
    value: numericPrice,
    percentage: 0,
    formatted: formatPrice(numericPrice)
  });
  
  return ranges;
};

/**
 * Normaliza propiedades de diferentes fuentes (MongoDB, WooCommerce)
 * @param {Object} property - Objeto propiedad sin normalizar
 * @returns {Object} - Propiedad con precio normalizado
 */
export const normalizePropertyPrice = (property) => {
  if (!property) return property;
  
  const source = property.source || 'auto';
  let rawPrice = null;
  
  // Detectar el campo de precio según la fuente
  if (property.price) rawPrice = property.price;
  else if (property.regular_price) rawPrice = property.regular_price;
  else if (property.sale_price) rawPrice = property.sale_price;
  else if (property.meta_data) {
    // Para WooCommerce, buscar en meta_data
    const priceMeta = property.meta_data.find(meta => 
      meta.key === 'price' || meta.key === '_regular_price' || meta.key === '_price'
    );
    if (priceMeta) rawPrice = priceMeta.value;
  }
  
  if (!rawPrice) return property;
  
  // Normalizar el precio
  const normalizedPrice = normalizePrice(rawPrice, source);
  
  return {
    ...property,
    price: normalizedPrice,
    formattedPrice: formatPrice(normalizedPrice),
    originalPrice: rawPrice // Mantener el precio original para debug
  };
};

/**
 * Detecta automáticamente el formato de precio más probable
 * @param {Array} prices - Array de precios para analizar
 * @returns {string} - Formato detectado ('euros', 'cents', 'thousands', 'unknown')
 */
export const detectPriceFormat = (prices) => {
  if (!Array.isArray(prices) || prices.length === 0) return 'unknown';
  
  const numericPrices = prices
    .map(p => normalizePrice(p))
    .filter(p => p > 0);
  
  if (numericPrices.length === 0) return 'unknown';
  
  const avgPrice = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;
  
  if (avgPrice >= 1000000) return 'cents'; // Probablemente en céntimos
  if (avgPrice >= 50000) return 'euros'; // Probablemente en euros
  if (avgPrice >= 50) return 'thousands'; // Probablemente en miles
  
  return 'unknown';
};

export default {
  normalizePrice,
  formatPrice,
  getPriceValue,
  isValidPrice,
  parseFormattedPrice,
  generateOfferRanges,
  normalizePropertyPrice,
  detectPriceFormat
}; 