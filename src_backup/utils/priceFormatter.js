/**
 * Utilidad centralizada para formatear precios de propiedades
 * Maneja automáticamente la corrección de precios en formato reducido
 */

/**
 * Normaliza y corrige un precio que puede estar en formato reducido
 * @param {string|number} price - El precio original
 * @returns {number} - El precio normalizado
 */
export const normalizePrice = (price) => {
  if (!price || price === 'Consultar') return 0;
  
  let numericPrice;
  
  // Convertir a número si es una cadena
  if (typeof price === 'string') {
    // Eliminar cualquier carácter que no sea número, punto o guión
    const cleanPrice = price.replace(/[^\d.-]/g, '');
    numericPrice = parseFloat(cleanPrice);
  } else {
    numericPrice = price;
  }
  
  // Verificar si es un número válido
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return 0;
  }
  
  // Corregir precios que están en formato reducido
  // Si el precio es menor a 10,000 y mayor a 50, probablemente está en miles
  // Por ejemplo: 350 debería ser 350,000€
  if (numericPrice < 10000 && numericPrice >= 50) {
    numericPrice = numericPrice * 1000;
  }
  
  // Si el precio sigue siendo muy bajo (menor a 50,000), podría necesitar otra corrección
  // Por ejemplo: si alguien puso 50 queriendo decir 50,000€
  if (numericPrice < 50000 && numericPrice >= 10) {
    // Solo aplicar esta corrección si el precio original era menor a 100
    const originalNumber = typeof price === 'string' 
      ? parseFloat(price.replace(/[^\d.-]/g, ''))
      : price;
    
    if (originalNumber < 100) {
      numericPrice = numericPrice * 1000;
    }
  }
  
  return numericPrice;
};

/**
 * Formatea un precio como cadena con formato de moneda española
 * @param {string|number} price - El precio a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} - El precio formateado (ej: "350.000 €")
 */
export const formatPrice = (price, options = {}) => {
  const {
    currency = 'EUR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showCurrency = true
  } = options;
  
  const normalizedPrice = normalizePrice(price);
  
  if (normalizedPrice === 0) {
    return 'Consultar precio';
  }
  
  if (showCurrency) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(normalizedPrice);
  } else {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(normalizedPrice);
  }
};

/**
 * Obtiene el valor numérico de un precio para cálculos
 * @param {string|number} price - El precio original
 * @returns {number} - El valor numérico del precio
 */
export const getPriceValue = (price) => {
  return normalizePrice(price);
};

/**
 * Valida si un precio es válido
 * @param {string|number} price - El precio a validar
 * @returns {boolean} - true si el precio es válido
 */
export const isValidPrice = (price) => {
  const normalizedPrice = normalizePrice(price);
  return normalizedPrice > 0;
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
  
  // Eliminar símbolos de moneda, espacios y convertir comas decimales a puntos
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
 * @param {string|number} price - El precio base
 * @returns {Array} - Array con rangos de ofertas
 */
export const generateOfferRanges = (price) => {
  const numericPrice = normalizePrice(price);
  
  if (numericPrice <= 0) return [];
  
  const ranges = [];
  
  // Ofertas por debajo del precio
  ranges.push({
    label: "5% menos",
    value: Math.round(numericPrice * 0.95),
    percentage: -5
  });
  
  ranges.push({
    label: "10% menos", 
    value: Math.round(numericPrice * 0.9),
    percentage: -10
  });
  
  ranges.push({
    label: "15% menos",
    value: Math.round(numericPrice * 0.85), 
    percentage: -15
  });
  
  // Precio exacto
  ranges.push({
    label: "Precio publicado",
    value: numericPrice,
    percentage: 0
  });
  
  return ranges;
}; 