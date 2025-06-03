/**
 * API de Configuración Estática - SIN VERIFICACIONES
 * Esta API devuelve configuración estática sin hacer verificaciones de endpoints
 * para evitar problemas con Fast Refresh.
 */

export default function handler(req, res) {
  console.log('[API Config] Devolviendo configuración estática');
  
  // Configuración estática que no requiere verificaciones
  const staticConfig = {
    timeout: 15000,
    retries: 3,
    backoff: true,
    endpoints: {
      mongodb: {
        url: '/api/properties/sources/mongodb',
        available: true,
        params: {}
      }
    },
    useProxyForMongoDB: false
  };

  return res.status(200).json({
    success: true,
    config: staticConfig,
    message: 'Configuración estática sin verificaciones'
  });
} 