/**
 * Obtiene todos los slugs de blogs para el sitemap
 * @returns {Promise<string[]>} Array con todos los slugs de blogs
 */
export async function getAllBlogSlugs() {
  try {
    // Intentar obtener desde la API principal
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/blogs/slugs`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error obteniendo slugs de blogs: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.slugs)) {
      return data.slugs;
    }
    
    return [];
  } catch (error) {
    console.error('Error en getAllBlogSlugs:', error);
    // Retornar array vacío en caso de error
    return [];
  }
} 