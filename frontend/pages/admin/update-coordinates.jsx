import { useState } from 'react';
import Head from 'next/head';

const coordinates = [
  {
    _id: "680629124e93b7cb1a817193",
    title: "Don Pedro",
    address: "La Latina",
    coordinates: { lat: 40.4086, lng: -3.7097 }
  },
  {
    _id: "683bfea5ffaf145919a3463b", 
    title: "Antonia Merce 2",
    address: "Antonia Merce",
    coordinates: { lat: 40.4231, lng: -3.6836 }
  },
  {
    _id: "683c011affaf145919a3495c",
    title: "Padilla 80", 
    address: "Padilla 80",
    coordinates: { lat: 40.4284, lng: -3.6787 }
  },
  {
    _id: "683c02d2ffaf145919a349f6",
    title: "Diego de León 60",
    address: "Diego de León",
    coordinates: { lat: 40.4403, lng: -3.6774 }
  },
  {
    _id: "683c0799ffaf145919a35112",
    title: "General Pardiñas 69",
    address: "General Pardiñas 69", 
    coordinates: { lat: 40.4326, lng: -3.6798 }
  },
  {
    _id: "683c0c0dffaf145919a3551b",
    title: "Ortega y Gasset 47",
    address: "Ortega u Gasset",
    coordinates: { lat: 40.4368, lng: -3.6829 }
  },
  {
    _id: "683c1098ffaf145919a355d7", 
    title: "General Díaz Porlier 95",
    address: "General Diaz Polier",
    coordinates: { lat: 40.4392, lng: -3.6742 }
  },
  {
    _id: "683c11efffaf145919a35764",
    title: "Ayala 94",
    address: "Ayala 94",
    coordinates: { lat: 40.4315, lng: -3.6775 }
  },
  {
    _id: "683c136effaf145919a35847",
    title: "Montera 39", 
    address: "Montera 39",
    coordinates: { lat: 40.4186, lng: -3.7018 }
  },
  {
    _id: "683c166fffaf145919a35f74",
    title: "Tetuán 20",
    address: "Tetuan", 
    coordinates: { lat: 40.4647, lng: -3.6986 }
  },
  {
    _id: "683c17e6ffaf145919a36247",
    title: "Isabel la Católica 7",
    address: "Isabel la Católica 7",
    coordinates: { lat: 40.4136, lng: -3.7053 }
  },
  {
    _id: "683c1976ffaf145919a36449", 
    title: "Principe De Vergara 39",
    address: "Principe De Vergara 39",
    coordinates: { lat: 40.4251, lng: -3.6836 }
  },
  {
    _id: "683c1bb5ffaf145919a3666d",
    title: "Diego de Leon 52",
    address: "Diego de Leon 52",
    coordinates: { lat: 40.4398, lng: -3.6775 }
  },
  {
    _id: "683c1c7dffaf145919a3679b",
    title: "Padilla 80",
    address: "Padilla", 
    coordinates: { lat: 40.4284, lng: -3.6787 }
  },
  {
    _id: "683c1d4affaf145919a368c8",
    title: "Ventura de la Vega, 7",
    address: "Ventura de la vega",
    coordinates: { lat: 40.4153, lng: -3.6984 }
  },
  {
    _id: "683c1e18ffaf145919a36a09",
    title: "General Pardiñas 8", 
    address: "Genral Pardiñas 8",
    coordinates: { lat: 40.4268, lng: -3.6838 }
  },
  {
    _id: "683c1f95ffaf145919a36b48",
    title: "Hermosilla 121",
    address: "Hermosilla 121",
    coordinates: { lat: 40.4346, lng: -3.6756 }
  }
];

export default function UpdateCoordinatesPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const updateCoordinates = async () => {
    setIsUpdating(true);
    setResults([]);
    setSummary(null);
    
    console.log('🚀 Iniciando actualización de coordenadas para 17 propiedades...');
    
    let successCount = 0;
    let errorCount = 0;
    const newResults = [];

    for (const property of coordinates) {
      try {
        console.log(`📍 Actualizando: ${property.title} (${property.address})`);
        
        const response = await fetch('/api/properties/update-coordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: property._id,
            coordinates: property.coordinates,
            title: property.title,
            address: property.address
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${property.title}: Coordenadas actualizadas exitosamente`);
          console.log(`   Lat: ${property.coordinates.lat}, Lng: ${property.coordinates.lng}`);
          
          newResults.push({
            ...property,
            status: 'success',
            message: result.message,
            modified: result.modifiedCount > 0
          });
          successCount++;
        } else {
          const errorData = await response.json();
          throw new Error(`HTTP ${response.status}: ${errorData.error || 'Error desconocido'}`);
        }
      } catch (error) {
        console.error(`❌ Error actualizando ${property.title}:`, error.message);
        newResults.push({
          ...property,
          status: 'error',
          message: error.message
        });
        errorCount++;
      }
      
      setResults([...newResults]); // Actualizar resultados en tiempo real
      
      // Pausa pequeña entre requests para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const finalSummary = {
      total: coordinates.length,
      success: successCount,
      errors: errorCount,
      completed: true
    };

    setSummary(finalSummary);
    setIsUpdating(false);

    console.log('\n📊 Resumen de actualización:');
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📍 Total: ${coordinates.length}`);
    
    if (successCount === coordinates.length) {
      console.log('🎉 ¡Todas las coordenadas se actualizaron correctamente!');
    }
  };

  return (
    <>
      <Head>
        <title>Actualizar Coordenadas - Admin Goza Madrid</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Actualizar Coordenadas de Propiedades
              </h1>
              <p className="text-gray-600">
                Esta herramienta actualiza las coordenadas de las 17 propiedades en MongoDB con las ubicaciones correctas de Madrid.
              </p>
            </div>

            {/* Botón de inicio */}
            <div className="mb-8">
              <button
                onClick={updateCoordinates}
                disabled={isUpdating}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  isUpdating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    <span>Actualizando coordenadas...</span>
                  </div>
                ) : (
                  '🚀 Iniciar Actualización de Coordenadas'
                )}
              </button>
            </div>

            {/* Resumen */}
            {summary && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  📊 Resumen de Actualización
                </h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                    <div className="text-sm text-gray-600">Exitosas</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((summary.success / summary.total) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Éxito</div>
                  </div>
                </div>
                {summary.success === summary.total && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
                    <p className="text-green-800 font-medium text-center">
                      🎉 ¡Todas las coordenadas se actualizaron correctamente!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lista de resultados */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📍 Resultados de Actualización
                </h2>
                <div className="grid gap-4">
                  {results.map((result, index) => (
                    <div
                      key={result._id}
                      className={`p-4 rounded-lg border-2 ${
                        result.status === 'success'
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {result.status === 'success' ? '✅' : '❌'} {result.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{result.address}</p>
                          <p className="text-sm text-gray-800">{result.message}</p>
                          {result.status === 'success' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Coordenadas: {result.coordinates.lat}, {result.coordinates.lng}
                              {result.modified ? ' (Actualizado)' : ' (Ya estaba actualizado)'}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                          #{index + 1} / {coordinates.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de propiedades a actualizar */}
            {!isUpdating && results.length === 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📋 Propiedades a Actualizar ({coordinates.length})
                </h2>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {coordinates.map((property, index) => (
                    <div key={property._id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600">{property.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Lat: {property.coordinates.lat}
                          </p>
                          <p className="text-xs text-gray-500">
                            Lng: {property.coordinates.lng}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 