// Construir URL base con versión de la API de WordPress y endpoint de posts
let wpApiUrl = `${wpUrl}/wp-json/wp/v2/posts`;

// Agregar parámetros para obtener todos los blogs disponibles
wpApiUrl += `?per_page=100&_embed=true`;

// Si se especifica slug, agregar a la URL
if (slug) {
  wpApiUrl += `&slug=${encodeURIComponent(slug)}`;
} 