export default async function handler(req, res) {
  // Permitir solo solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID de propiedad' });
  }

  const logs = [];
  const addLog = (message) => {
    logs.push({ time: new Date().toISOString(), message });
  };

  try {
    addLog(`Iniciando diagnóstico para ID: ${id}`);

    // Verificar si es un ID de MongoDB (formato ObjectId)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    addLog(`¿Es ID de MongoDB? ${isMongoId}`);

    // Determinar la URL base según el entorno
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
    
    // Crear un controlador de aborto para establecer un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      addLog(`TIMEOUT alcanzado para la propiedad con ID: ${id}`);
      controller.abort();
    }, 15000); // 15 segundos timeout

    addLog(`Intentando cargar propiedad con ID: ${id}`);

    let response;

    if (isMongoId) {
      // Es un ID de MongoDB, obtener de nuestra API
      addLog(`Obteniendo propiedad de MongoDB con ID ${id}`);

      try {
        const url = `${API_URL}/property/${id}`;
        addLog(`URL de petición MongoDB: ${url}`);

        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        addLog(`Respuesta MongoDB recibida: ${response.status} ${response.statusText}`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        addLog(`Error en fetch MongoDB: ${fetchError.message}`);

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({
            error: "Tiempo de espera agotado al obtener la propiedad",
            logs
          });
        }

        throw fetchError;
      }
    } else {
      // Es un ID de WooCommerce, usar nuestro proxy
      addLog(`Obteniendo propiedad de WooCommerce con ID ${id}`);

      try {
        const url = `${API_URL}/api/wordpress-proxy?path=products/${id}`;
        addLog(`URL de petición WooCommerce: ${url}`);

        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        addLog(`Respuesta WooCommerce recibida: ${response.status} ${response.statusText}`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        addLog(`Error en fetch WooCommerce: ${fetchError.message}`);

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({
            error: "Tiempo de espera agotado al obtener la propiedad",
            logs
          });
        }

        throw fetchError;
      }
    }

    // Limpiar el timeout
    clearTimeout(timeoutId);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      addLog(`Error en respuesta: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `Error al obtener propiedad: ${response.status} ${response.statusText}`,
        logs
      });
    }

    // Obtener los datos de la respuesta
    addLog(`Intentando obtener JSON de la respuesta`);
    const data = await response.json();
    addLog(`JSON obtenido correctamente`);

    // Devolver los datos y los logs
    return res.status(200).json({
      success: true,
      data,
      logs
    });

  } catch (err) {
    addLog(`Error en diagnóstico: ${err.message}`);
    console.error("Error en diagnóstico:", err);

    return res.status(500).json({
      error: err.message || "Error desconocido",
      logs
    });
  }
} 