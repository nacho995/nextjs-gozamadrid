/**
 * API para blogs que siempre devuelve un array vacío por defecto
 */
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const response = {
    success: true,
    message: "Lista de blogs recuperada con éxito",
    blogs: [], // Array vacío para evitar errores de .map
    posts: [], // Nombre alternativo
    total: 0,
    totalPages: 0
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: corsHeaders
  });
}
