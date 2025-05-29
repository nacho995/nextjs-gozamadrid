import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiagnostic = async () => {
      try {
        const response = await fetch('/api/diagnostic/properties-status');
        const data = await response.json();
        setDiagnostic(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostic();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Diagnóstico de APIs</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Cargando diagnóstico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Diagnóstico de APIs</h1>
          <div className="bg-red-100 rounded-lg shadow p-6">
            <h2 className="text-red-800 font-bold">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const StatusCard = ({ title, source, isWorking }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${isWorking ? 'border-green-500' : 'border-red-500'}`}>
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <span className={`w-3 h-3 rounded-full mr-3 ${isWorking ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        <div><strong>Configurado:</strong> {source.configured ? '✅ Sí' : '❌ No'}</div>
        <div><strong>Accesible:</strong> {source.accessible ? '✅ Sí' : '❌ No'}</div>
        <div><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{source.url}</code></div>
        {source.hasCredentials !== undefined && (
          <div><strong>Credenciales:</strong> {source.hasCredentials ? '✅ Sí' : '❌ No'}</div>
        )}
        <div><strong>Propiedades:</strong> {source.properties}</div>
        {source.error && (
          <div className="text-red-600"><strong>Error:</strong> {source.error}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diagnóstico de APIs de Propiedades</h1>
        
        {/* Resumen */}
        <div className={`mb-8 p-6 rounded-lg ${diagnostic.summary.allWorking ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-xl font-bold mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{diagnostic.summary.accessibleSources}/{diagnostic.summary.totalSources}</div>
              <div className="text-sm">Fuentes Accesibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{diagnostic.summary.totalProperties}</div>
              <div className="text-sm">Propiedades Totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{diagnostic.summary.hasData ? '✅' : '❌'}</div>
              <div className="text-sm">Datos Disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{diagnostic.summary.allWorking ? '✅' : '❌'}</div>
              <div className="text-sm">Todo Funcionando</div>
            </div>
          </div>
        </div>

        {/* Detalles por fuente */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatusCard 
            title="MongoDB" 
            source={diagnostic.sources.mongodb}
            isWorking={diagnostic.sources.mongodb.accessible && diagnostic.sources.mongodb.properties > 0}
          />
          <StatusCard 
            title="WooCommerce" 
            source={diagnostic.sources.woocommerce}
            isWorking={diagnostic.sources.woocommerce.accessible && diagnostic.sources.woocommerce.properties > 0}
          />
        </div>

        {/* Información del entorno */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Información del Entorno</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Entorno:</strong> {diagnostic.environment}</div>
            <div><strong>Vercel:</strong> {diagnostic.isVercel ? '✅ Sí' : '❌ No'}</div>
            <div><strong>Timestamp:</strong> {new Date(diagnostic.timestamp).toLocaleString()}</div>
          </div>
        </div>

        {/* Botón para refrescar */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            🔄 Refrescar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
} 