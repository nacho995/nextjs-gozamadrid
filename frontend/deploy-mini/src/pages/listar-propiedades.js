import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { API_URL } from '@/pages/api';

export default function ListarPropiedadesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [serverUrl, setServerUrl] = useState(API_URL);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, { time: new Date().toISOString(), message }]);
  };

  const fetchPropertiesFromCombinedApi = async () => {
    try {
      setLoading(true);
      const apiUrl = `${window.location.origin}/api/properties`;
      addLog(`Intentando cargar propiedades desde el endpoint combinado: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`Respuesta obtenida: ${JSON.stringify(data).substring(0, 100)}...`);
        
        if (data.properties && Array.isArray(data.properties)) {
          // Contar propiedades por fuente
          const mongodbCount = data.mongodb || 0;
          const woocommerceCount = data.woocommerce || 0;
          
          addLog(`Propiedades cargadas: ${data.properties.length} (MongoDB: ${mongodbCount}, WooCommerce: ${woocommerceCount})`);
          
          // Procesar propiedades
          const processedProperties = data.properties.map(prop => ({
            id: prop._id || prop.id,
            title: prop.title || prop.name || 'Sin título',
            price: prop.price || 'No disponible',
            location: prop.location || prop.address || 'No disponible',
            source: prop.source || (prop._id ? 'MongoDB' : 'WooCommerce'),
            date: prop.date || prop.dateFormatted || 'Desconocida'
          }));
          
          setProperties(processedProperties);
          setError(null);
        } else {
          addLog(`La respuesta no tiene propiedades en el formato esperado: ${JSON.stringify(data).substring(0, 100)}...`);
          setError('La respuesta no tiene el formato esperado');
          
          // Si el endpoint combinado falla, intentar con el endpoint original
          fallbackToOriginalMethod();
        }
      } else {
        addLog(`Error al cargar propiedades: ${response.status} ${response.statusText}`);
        setError(`Error ${response.status}: ${response.statusText}`);
        
        // Si el endpoint combinado falla, intentar con el endpoint original
        fallbackToOriginalMethod();
      }
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
      
      // Si el endpoint combinado falla, intentar con el endpoint original
      fallbackToOriginalMethod();
    } finally {
      setLoading(false);
    }
  };

  // Método original como respaldo
  const fallbackToOriginalMethod = () => {
    addLog('Intentando método original como respaldo...');
    fetchProperties(`${serverUrl}/property`);
  };

  const fetchProperties = async (url) => {
    try {
      setLoading(true);
      addLog(`Intentando cargar propiedades desde: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`Propiedades cargadas: ${Array.isArray(data) ? data.length : 'No es un array'}`);
        
        if (Array.isArray(data)) {
          // Procesar propiedades
          const processedProperties = data.map(prop => ({
            id: prop._id || prop.id,
            title: prop.title || prop.name || 'Sin título',
            price: prop.price || 'No disponible',
            location: prop.location || 'No disponible',
            source: prop._id ? 'MongoDB' : 'WooCommerce'
          }));
          
          setProperties(processedProperties);
          setError(null);
        } else {
          addLog(`La respuesta no es un array: ${JSON.stringify(data).substring(0, 100)}...`);
          setError('La respuesta no tiene el formato esperado');
        }
      } else {
        addLog(`Error al cargar propiedades: ${response.status} ${response.statusText}`);
        setError(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentar cargar propiedades al inicio
    fetchPropertiesFromCombinedApi();
  }, [serverUrl]);

  const handleServerUrlChange = (e) => {
    setServerUrl(e.target.value);
  };

  const handleFetchClick = () => {
    fetchPropertiesFromCombinedApi();
  };

  // Función para probar una propiedad específica
  const testProperty = async (id) => {
    try {
      addLog(`Probando propiedad con ID: ${id}`);
      setLoading(true);
      
      const url = `${serverUrl}/property/${id}`;
      addLog(`URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Propiedad cargada correctamente: ${data.title || data.name || 'Sin título'}`);
        
        // Mostrar información sobre la propiedad
        addLog(`ID: ${data._id || data.id}`);
        addLog(`Título: ${data.title || data.name || 'Sin título'}`);
        addLog(`Precio: ${data.price || 'No disponible'}`);
        addLog(`Ubicación: ${data.location || 'No disponible'}`);
        addLog(`Imágenes: ${data.images ? (Array.isArray(data.images) ? data.images.length : '1') : '0'}`);
        
        return true;
      } else {
        addLog(`Error al cargar propiedad: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (err) {
      addLog(`Error al probar propiedad: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para probar una propiedad de ejemplo
  const testExampleProperty = async () => {
    // IDs de ejemplo para probar
    const exampleIds = [
      '65e9f2a0e6d7b9a7f2d7b9a7', // ID de MongoDB de ejemplo
      '123456', // ID de WooCommerce de ejemplo
    ];
    
    for (const id of exampleIds) {
      addLog(`Probando ID de ejemplo: ${id}`);
      const success = await testProperty(id);
      if (success) {
        addLog(`Prueba exitosa con ID: ${id}`);
        break;
      } else {
        addLog(`Prueba fallida con ID: ${id}`);
      }
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Listar Propiedades | Goza Madrid</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Listar Propiedades</h1>
      
      {/* Configuración del servidor */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Configuración</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>URL del servidor:</label>
            <input
              type="text"
              value={serverUrl}
              onChange={handleServerUrlChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleFetchClick}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: loading ? '#ccc' : '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Cargando...' : 'Cargar propiedades'}
            </button>
            <button
              onClick={testExampleProperty}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: loading ? '#ccc' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Probar ID de ejemplo
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Panel de propiedades */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Propiedades</h2>
          <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '4px', height: '400px', overflowY: 'auto' }}>
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
            ) : properties.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Título</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Precio</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Ubicación</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Fuente</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#fff' }}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{property.id}</span>
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{property.title}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{property.price}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{property.location}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{property.source}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <Link href={`/diagnostico-simple?id=${property.id}`} passHref>
                            <a style={{ padding: '4px 8px', backgroundColor: '#f59e0b', color: '#000', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>
                              Diagnosticar
                            </a>
                          </Link>
                          <button
                            onClick={() => testProperty(property.id)}
                            style={{ padding: '4px 8px', backgroundColor: '#10b981', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '14px', cursor: 'pointer' }}
                          >
                            Probar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No se encontraron propiedades</p>
            )}
          </div>
        </div>
        
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
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => setLogs([])}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Limpiar logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 