import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PropiedadTestPage() {
  const router = useRouter();
  const { id: idFromQuery } = router.query;
  
  const [propertyId, setPropertyId] = useState('');
  const [serverUrl, setServerUrl] = useState('https://goza-madrid.onrender.com');
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState([]);

  // Establecer el ID de la propiedad desde la URL cuando esté disponible
  useEffect(() => {
    if (idFromQuery) {
      setPropertyId(idFromQuery);
    }
  }, [idFromQuery]);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, { time: new Date().toISOString(), message }]);
  };

  const addTestResult = (url, success, message) => {
    setTestResults(prev => [
      { time: new Date().toISOString(), url, success, message },
      ...prev
    ]);
  };

  const testUrl = async (url) => {
    try {
      addLog(`Probando URL: ${url}`);
      setLoading(true);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      addLog(`Respuesta: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Datos recibidos correctamente`);
        setProperty(data);
        addTestResult(url, true, `Éxito: ${response.status} ${response.statusText}`);
        return true;
      } else {
        addLog(`Error en la respuesta: ${response.status} ${response.statusText}`);
        setProperty(null);
        addTestResult(url, false, `Error: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (err) {
      addLog(`Error: ${err.message}`);
      setProperty(null);
      addTestResult(url, false, `Error: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!propertyId) {
      setError('Por favor, introduce un ID de propiedad');
      return;
    }
    
    setError(null);
    
    // Probar diferentes URLs
    const urls = [
      `${serverUrl}/property/${propertyId}`,
      `/property/${propertyId}`,
      `/api/property/${propertyId}`,
      `/api/diagnostico?id=${propertyId}`
    ];
    
    for (const url of urls) {
      addLog(`Intentando con URL: ${url}`);
      const success = await testUrl(url);
      if (success) {
        addLog(`Éxito con URL: ${url}`);
        break;
      }
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Test de Propiedad | Goza Madrid</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Test de Propiedad</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>URL del servidor:</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>ID de la propiedad:</label>
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="ID de la propiedad"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
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
            {loading ? 'Probando...' : 'Probar URLs'}
          </button>
        </div>
      </form>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Panel de resultados de pruebas */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Resultados de pruebas</h2>
          <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '4px', height: '200px', overflowY: 'auto' }}>
            {testResults.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>No hay resultados disponibles</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Hora</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>URL</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} style={{ backgroundColor: result.success ? '#d1fae5' : '#fee2e2' }}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        {result.time.split('T')[1].split('.')[0]}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd', fontFamily: 'monospace', fontSize: '12px' }}>
                        {result.url}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        {result.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Panel de logs */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Logs</h2>
          <div style={{ backgroundColor: '#000', color: '#4ade80', padding: '10px', borderRadius: '4px', height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px' }}>
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
      
      {/* Panel de datos de la propiedad */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Datos de la propiedad</h2>
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
              <div style={{ border: '4px solid #f3f4f6', borderTopColor: '#f59e0b', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' }}></div>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : property ? (
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>{property.title || property.name || 'Propiedad sin título'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>ID:</p>
                  <p>{property._id || property.id || 'No disponible'}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Tipo:</p>
                  <p>{property.source || (property._id ? 'MongoDB' : 'WooCommerce')}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Precio:</p>
                  <p>{property.price || 'No disponible'}</p>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Ubicación:</p>
                  <p>{property.location || 'No disponible'}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold' }}>Imágenes:</p>
                {property.images && property.images.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    {property.images.map((img, index) => (
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
                  {JSON.stringify(property, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
} 