import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import { useRouter } from 'next/router';
import { getPropertyById } from '@/pages/api';

export default function DiagnosticoPage() {
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
    <Layout>
      <Head>
        <title>Diagnóstico de Propiedades | Goza Madrid</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico de Propiedades</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="ID de la propiedad"
              className="flex-grow p-3 border border-gray-300 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded font-bold ${
                loading ? 'bg-gray-400' : 'bg-amber-400 hover:bg-amber-500'
              } text-black`}
            >
              {loading ? 'Cargando...' : 'Diagnosticar'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h2 className="font-bold text-lg mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel de logs */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Logs</h2>
            <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No hay logs disponibles</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{log.time.split('T')[1].split('.')[0]}]</span>{' '}
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Panel de resultados */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Resultado</h2>
            <div className="bg-white border border-gray-300 p-4 rounded h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
                </div>
              ) : result ? (
                <div>
                  <h3 className="font-bold text-xl mb-2">{result.title || result.name || 'Propiedad sin título'}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="font-bold">ID:</p>
                      <p>{result._id || result.id || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Tipo:</p>
                      <p>{result.source || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Precio:</p>
                      <p>{result.price || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Ubicación:</p>
                      <p>{result.location || 'No disponible'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-bold">Imágenes:</p>
                    {result.images && result.images.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {result.images.map((img, index) => (
                          <li key={index} className="truncate">
                            {typeof img === 'string' ? img : (img.src || 'Objeto de imagen sin URL')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No hay imágenes disponibles</p>
                    )}
                  </div>
                  
                  <details>
                    <summary className="cursor-pointer font-bold">Ver JSON completo</summary>
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-gray-500">No hay resultados disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 