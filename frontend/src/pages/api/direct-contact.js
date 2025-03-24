// Endpoint directo para el envío de correos sin pasar por el backend
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  console.log('[Direct Contact] Datos recibidos:', req.body ? Object.keys(req.body) : 'Sin datos');
  
  // Responder inmediatamente al cliente
  return res.status(200).json({
    success: true,
    message: 'Solicitud recibida. Se procesará en breve.'
  });
} 