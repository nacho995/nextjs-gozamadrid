/**
 * Utilidad para generar datos estructurados JSON-LD sin entidades HTML
 */

/**
 * Genera un script de datos estructurados con formato JSON-LD correcto
 * @param {Object} data - El objeto de datos estructurados
 * @param {string} id - Identificador opcional para el elemento script
 * @returns {string} El HTML del script generado
 */
export const generateStructuredData = (data, id = '') => {
  try {
    // Serializar los datos directamente, sin conversión a entidades HTML
    const jsonString = JSON.stringify(data);
    
    // Generar el elemento script con el JSON-LD
    return `<script id="${id}" type="application/ld+json">${jsonString}</script>`;
  } catch (error) {
    console.error("Error generando datos estructurados:", error);
    return '';
  }
};

/**
 * Genera el HTML para un conjunto de datos estructurados
 * @param {Array<Object>} dataItems - Array de objetos de datos estructurados
 * @returns {string} HTML con todos los scripts generados
 */
export const generateMultipleStructuredData = (dataItems) => {
  try {
    return dataItems.map((item, index) => 
      generateStructuredData(item, `structured-data-${index}`)
    ).join('\n');
  } catch (error) {
    console.error("Error generando múltiples datos estructurados:", error);
    return '';
  }
};

/**
 * Asegura que un objeto no tenga caracteres de escape HTML que puedan causar errores de sintaxis
 * @param {Object} data - El objeto que contiene datos estructurados
 * @returns {Object} Objeto limpio sin caracteres problemáticos
 */
const sanitizeStructuredData = (data) => {
  if (!data) return {};
  
  try {
    // Convertir a string y reemplazar entidades HTML comunes
    const jsonString = JSON.stringify(data)
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    // Convertir de nuevo a objeto
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error sanitizando datos estructurados:", error);
    return data; // Devolver los datos originales si hay un error
  }
};

/**
 * Convierte un objeto a datos estructurados para usar con dangerouslySetInnerHTML
 * @param {Object} data - El objeto de datos estructurados
 * @returns {Object} Objeto para usar con dangerouslySetInnerHTML
 */
export const structuredDataForInnerHTML = (data) => {
  try {
    // Limpiar datos de entidades HTML
    const cleanData = sanitizeStructuredData(data);
    
    // Convertir a string JSON directamente
    return {
      __html: JSON.stringify(cleanData)
    };
  } catch (error) {
    console.error("Error preparando datos estructurados para innerHTML:", error);
    return { __html: '{}' };
  }
};

/**
 * Método mejorado para renderizar datos JSON-LD
 * Esta función devuelve directamente el string JSON para pasarlo directamente al script
 * 
 * @param {Object} data - Objeto de datos estructurados
 * @returns {string} - String JSON limpio
 */
export const getCleanJsonLd = (data) => {
  try {
    // Asegurarse de que los datos están limpios
    const cleanData = sanitizeStructuredData(data);
    
    // Convertir a string JSON
    return JSON.stringify(cleanData, null, 0);
  } catch (error) {
    console.error("Error preparando JSON-LD limpio:", error);
    return "{}";
  }
};

export default {
  generateStructuredData,
  generateMultipleStructuredData,
  structuredDataForInnerHTML,
  getCleanJsonLd
}; 