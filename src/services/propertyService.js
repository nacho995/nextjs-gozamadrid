/**
 * Obtiene todos los IDs de propiedades para el sitemap
 * @returns {Promise<string[]>} Array con todos los IDs de propiedades
 */
export async function getAllPropertyIds() {
  try {
    // Intentar obtener desde la API principal
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/properties/ids`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error obteniendo IDs de propiedades: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.ids)) {
      return data.ids;
    }
    
    return [];
  } catch (error) {
    console.error('Error en getAllPropertyIds:', error);
    // Retornar array vacío en caso de error
    return [];
  }
} 