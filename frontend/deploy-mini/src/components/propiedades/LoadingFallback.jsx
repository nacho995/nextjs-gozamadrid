import React from 'react';
import Head from 'next/head';

/**
 * Componente de carga que se muestra cuando estamos esperando que las propiedades se carguen
 * o cuando ha ocurrido un error que podemos reintentar
 */
export default function LoadingFallback({ 
  error = null, 
  onRetry = () => window.location.reload(),
  debugInfo = null 
}) {
  const isError = error !== null;
  
  return (
    <>
      <Head>
        <title>{isError ? 'Error al cargar propiedades' : 'Cargando propiedades'} | Goza Madrid</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center max-w-lg">
          <div className="flex flex-col items-center">
            {isError ? (
              // Mostrar mensaje de error
              <>
                <div className="text-red-500 text-6xl mb-4">
                  <i className="mdi mdi-alert-circle"></i>
                </div>
                <h3 className="text-xl text-white font-semibold mb-2">Algo salió mal</h3>
                <p className="text-gray-300 mb-6">{error}</p>
              </>
            ) : (
              // Mostrar animación de carga
              <>
                <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="60"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="1.5s"
                      from="60"
                      to="-60"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                <p className="text-lg text-white font-medium mb-2 text-shadow-sm">Cargando propiedades...</p>
                <p className="text-sm text-gray-300">Esto puede tardar unos segundos</p>
              </>
            )}
            
            {isError && (
              <button 
                onClick={onRetry}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
            )}
            
            {/* Información de depuración si está disponible */}
            {debugInfo && (
              <div className="mt-6 p-4 bg-black/30 text-left w-full rounded-lg">
                <p className="text-xs text-amber-300 font-mono mb-2">Información de depuración:</p>
                <pre className="text-xs text-white/80 font-mono overflow-auto max-h-40">
                  {typeof debugInfo === 'object' ? JSON.stringify(debugInfo, null, 2) : debugInfo}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 