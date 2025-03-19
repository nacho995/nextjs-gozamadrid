import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function DiagnosticoSimplePage() {
  const router = useRouter();
  const { id: idFromQuery } = router.query;
  
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  // Establecer el ID de la propiedad desde la URL cuando esté disponible
  useEffect(() => {
    if (idFromQuery) {
      setPropertyId(idFromQuery);
      // Ejecutar el diagnóstico automáticamente si viene un ID en la URL
      handleSubmit(null, idFromQuery);
    }
  }, [idFromQuery]);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, { time: new Date().toISOString(), message }]);
  };

  const handleSubmit = async (e, idOverride = null) => {
    // Si se llama desde un evento, prevenirlo
    if (e) e.preventDefault();
    
    // Usar el ID proporcionado o el del estado
    const idToUse = idOverride || propertyId;
    
    if (!idToUse) {
      setError('Por favor, introduce un ID de propiedad');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    setLogs([]);
    
    addLog(`Iniciando diagnóstico para ID: ${idToUse}`);
    
    try {
      // Verificar si es un ID de MongoDB (formato ObjectId)
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(idToUse);
      addLog(`¿Es ID de MongoDB? ${isMongoId}`);
      
      // Crear un controlador de aborto para establecer un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        addLog(`TIMEOUT alcanzado para la propiedad con ID: ${idToUse}`);
        controller.abort();
      }, 15000); // 15 segundos timeout
      
      addLog(`Intentando cargar propiedad con ID: ${idToUse}`);
      
      let response;
      
      if (isMongoId) {
        // Es un ID de MongoDB, obtener de nuestra API
        addLog(`Obteniendo propiedad de MongoDB con ID ${idToUse}`);
        
        try {
          // URL relativa para el cliente
          const url = `/property/${idToUse}`;
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
            throw new Error("Tiempo de espera agotado al obtener la propiedad. Por favor, inténtalo de nuevo.");
          }
          
          throw fetchError;
        }
      } else {
        // Es un ID de WooCommerce, usar nuestro proxy
        addLog(`Obteniendo propiedad de WooCommerce con ID ${idToUse}`);
        
        try {
          // URL relativa para el cliente
          const url = `/api/wordpress-proxy?path=products/${idToUse}`;
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
            throw new Error("Tiempo de espera agotado al obtener la propiedad. Por favor, inténtalo de nuevo.");
          }
          
          throw fetchError;
        }
      }
      
      // Limpiar el timeout
      clearTimeout(timeoutId);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        addLog(`Error en respuesta: ${response.status} ${response.statusText}`);
        throw new Error(`Error al obtener propiedad: ${response.status} ${response.statusText}`);
      }
      
      // Obtener los datos de la respuesta
      addLog(`Intentando obtener JSON de la respuesta`);
      const data = await response.json();
      addLog(`JSON obtenido correctamente`);
      
      // Mostrar los datos obtenidos
      setResult(data);
      addLog(`Diagnóstico completado con éxito`);
      
    } catch (err) {
      addLog(`Error en diagnóstico: ${err.message}`);
      console.error("Error en diagnóstico:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Diagnóstico Simple de Propiedades | Goza Madrid</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Diagnóstico Simple de Propiedades</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="ID de la propiedad"
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px',
              backgroundColor: loading ? '#ccc' : '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Cargando...' : 'Diagnosticar'}
          </button>
        </div>
      </form>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Panel de logs */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Logs</h2>
          <div style={{ backgroundColor: '#000', color: '#4ade80', padding: '10px', borderRadius: '4px', height: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px' }}>
            {logs.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No hay logs disponibles</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  <span style={{ color: '#6b7280' }}>[{log.time.split('T')[1].split('.')[0]}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Panel de resultados */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Resultado</h2>
          <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '4px', height: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{ border: '4px solid #f3f4f6', borderTopColor: '#f59e0b', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : result ? (
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>{result.title || result.name || 'Propiedad sin título'}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>ID:</p>
                    <p>{result._id || result.id || 'No disponible'}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>Tipo:</p>
                    <p>{result.source || 'No disponible'}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>Precio:</p>
                    <p>{result.price || 'No disponible'}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>Ubicación:</p>
                    <p>{result.location || 'No disponible'}</p>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontWeight: 'bold' }}>Imágenes:</p>
                  {result.images && result.images.length > 0 ? (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                      {result.images.map((img, index) => (
                        <li key={index} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {typeof img === 'string' ? img : (img.src || 'Objeto de imagen sin URL')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay imágenes disponibles</p>
                  )}
                </div>
                
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver JSON completo</summary>
                  <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px', marginTop: '10px', fontSize: '12px', overflowX: 'auto' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No hay resultados disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 