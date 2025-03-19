/**
 * API para blogs que siempre devuelve un array vacío por defecto
 * para evitar errores de .map en el frontend cuando hay errores de conectividad
 */
export async function onRequest(context) {
  try {
    // Headers CORS para permitir el acceso desde cualquier origen
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Para solicitudes OPTIONS (preflight requests)
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Intentar obtener los blogs de WordPress (simulado para este ejemplo)
    // En una implementación real, aquí se haría la llamada a la API externa
    const response = {
      success: true,
      message: "Lista de blogs recuperada con éxito",
      blogs: [], // Siempre devolver un array vacío para evitar errores de .map
      total: 0,
      totalPages: 0
    };

    // Devolver respuesta con los headers CORS
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    // En caso de error, siempre devolver un array vacío para evitar errores en el frontend
    const errorResponse = {
      success: false,
      message: "Error al recuperar blogs: " + error.message,
      blogs: [], // Siempre devolver un array vacío para evitar errores de .map
      total: 0,
      totalPages: 0
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
