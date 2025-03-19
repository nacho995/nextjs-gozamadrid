"use client";
import React, { useState, useEffect } from "react";
import Head from 'next/head';

export default function TestPropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [configInfo, setConfigInfo] = useState({});

  useEffect(() => {
    // Capturar información de configuración
    if (typeof window !== 'undefined') {
      setConfigInfo({
        windowOrigin: window.location.origin,
        appConfig: window.appConfig || 'No definido',
        CONFIG: window.CONFIG || 'No definido'
      });
    }
    
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Iniciando carga de propiedades...");
        
        // Obtener URL
        const apiBaseUrl = (typeof window !== 'undefined' && window.appConfig && window.appConfig.frontendUrl) 
          ? window.appConfig.frontendUrl 
          : window.location.origin;
        
        const requestUrl = `${apiBaseUrl}/api/properties`;
        console.log("URL de solicitud:", requestUrl);
        
        // Realizar la petición
        const response = await fetch(requestUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error HTTP ${response.status}: ${response.statusText}`);
          console.error(`Detalle:`, errorText);
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Resultado recibido:", result);
        
        if (!result.properties || !Array.isArray(result.properties)) {
          throw new Error('No se recibieron datos válidos');
        }
        
        setProperties(result.properties);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Error al cargar propiedades");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Head>
        <title>Test de Propiedades</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Test de Carga de Propiedades</h1>
      
      <div className="bg-gray-100 p-4 mb-6 rounded">
        <h2 className="text-xl font-semibold mb-2">Información de Configuración:</h2>
        <pre className="bg-gray-200 p-3 rounded overflow-auto max-h-60 text-sm">
          {JSON.stringify(configInfo, null, 2)}
        </pre>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4">Cargando propiedades...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Propiedades Cargadas: {properties.length}</h2>
            <p className="text-gray-600">Se han cargado {properties.length} propiedades correctamente.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map(property => (
              <div key={property.id} className="border rounded overflow-hidden shadow-lg">
                {property.image && (
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="object-cover h-full w-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/default-property-image.jpg";
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-2 truncate">{property.title}</h3>
                  <p className="text-gray-700 mb-2 truncate">{property.location}</p>
                  <p className="text-xl font-bold text-blue-600">{property.price.toLocaleString()} €</p>
                  <div className="mt-2 flex text-sm text-gray-600">
                    <span className="mr-3">{property.bedrooms} hab.</span>
                    <span className="mr-3">{property.bathrooms} baños</span>
                    <span>{property.size} m²</span>
                  </div>
                  <p className="mt-2 text-gray-500 text-sm">Fuente: {property.type}</p>
                </div>
              </div>
            ))}
          </div>

          {properties.length > 6 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">Mostrando 6 de {properties.length} propiedades</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 