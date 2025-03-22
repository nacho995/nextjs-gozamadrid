
import { useState, useEffect } from 'react';
import Head from 'next/head';

const TestResult = ({ test }) => {
  if (!test) return null;

  const renderDetails = (details) => {
    if (!details) return null;
    
    if (typeof details === 'string') {
      return <p className="mt-2 text-sm text-gray-600">{details}</p>;
    }
    
    if (Array.isArray(details)) {
      return (
        <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
          {details.map((detail, i) => <li key={i}>{detail}</li>)}
        </ul>
      );
    }
    
    if (typeof details === 'object') {
      return (
        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
          {JSON.stringify(details, null, 2)}
        </pre>
      );
    }

    return null;
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-900">{test.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {test.success ? 'OK' : 'Error'}
        </span>
      </div>
      {renderDetails(test.details)}
      {test.error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {test.error.message || JSON.stringify(test.error)}
        </div>
      )}
    </div>
  );
};

export default function DiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiagnostic = async () => {
      try {
        const response = await fetch('/api/diagnostic/woocommerce');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setDiagnosticData(data);
      } catch (err) {
        console.error('Error fetching diagnostic:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostic();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold">Ejecutando diagnóstico...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!diagnosticData) return null;

  return (
    <>
      <Head>
        <title>Diagnóstico WooCommerce - Goza Madrid</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Cabecera */}
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Diagnóstico WooCommerce
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Timestamp: {new Date(diagnosticData.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Estado General */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Estado General</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={`rounded-lg p-4 ${
                  diagnosticData.overallStatus.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="mt-1 text-lg font-semibold">
                    {diagnosticData.overallStatus.success ? 'Funcionando' : 'Con Problemas'}
                  </p>
                </div>
                <div className="rounded-lg p-4 bg-yellow-50">
                  <p className="text-sm font-medium text-gray-500">Problemas Críticos</p>
                  <p className="mt-1 text-lg font-semibold">
                    {diagnosticData.overallStatus.criticalIssues}
                  </p>
                </div>
                <div className="rounded-lg p-4 bg-blue-50">
                  <p className="text-sm font-medium text-gray-500">Advertencias</p>
                  <p className="mt-1 text-lg font-semibold">
                    {diagnosticData.overallStatus.warnings}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Configuración</h2>
              <div className="mt-3">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL WooCommerce</dt>
                    <dd className="mt-1 text-sm text-gray-900">{diagnosticData.environment.woocommerce_url}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Credenciales</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Consumer Key: {diagnosticData.environment.has_consumer_key ? '✓' : '✗'}<br />
                      Consumer Secret: {diagnosticData.environment.has_consumer_secret ? '✓' : '✗'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Resultados de las Pruebas */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Resultados de las Pruebas</h2>
              <div className="mt-3 space-y-4">
                {Object.entries(diagnosticData.tests).map(([key, test]) => (
                  <TestResult key={key} test={test} />
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            {diagnosticData.recommendations && diagnosticData.recommendations.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Recomendaciones</h2>
                <div className="mt-3 space-y-4">
                  {diagnosticData.recommendations.map((rec, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      rec.priority === 'ALTA' ? 'bg-red-50' : 'bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-900">{rec.message}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rec.priority === 'ALTA' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      {rec.details && (
                        <div className="mt-2 text-sm text-gray-600">
                          {typeof rec.details === 'string' ? rec.details : (
                            <ul className="list-disc list-inside">
                              {Array.isArray(rec.details) ? rec.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              )) : (
                                <li>{JSON.stringify(rec.details)}</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ejecutar Nuevo Diagnóstico
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 