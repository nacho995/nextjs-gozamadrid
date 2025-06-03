import Head from 'next/head';
import PropertyPage from "@/components/propiedades/PropertyPage";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Comprar() {
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  // Manejar errores en el componente PropertyPage
  useEffect(() => {
    const handleError = (event) => {
      console.error('Error en la página de compra:', event);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Si hay un error, mostrar un fallback
  if (hasError) {
    return (
      <>
        <Head>
          <title>Propiedades en Venta | Goza Madrid</title>
          <meta name="description" content="Explora nuestra selección de propiedades en venta en Madrid. Encuentra tu hogar ideal con Goza Madrid." />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://realestategozamadrid.com/vender/comprar" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="container mx-auto py-12 text-center bg-white shadow-xl rounded-lg p-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Lo sentimos</h2>
            <p className="text-lg mb-2">Ha ocurrido un problema al cargar las propiedades.</p>
            <p className="text-gray-600 mb-6">Estamos trabajando para solucionarlo.</p>
            
            <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded-lg mb-2 md:mb-0"
              >
                Reintentar
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 px-8 rounded-lg"
              >
                Volver a inicio
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Renderizado normal
  return (
    <>
      <Head>
        <title>Propiedades en Venta | Goza Madrid</title>
        <meta name="description" content="Explora nuestra selección de propiedades en venta en Madrid. Encuentra tu hogar ideal con Goza Madrid." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://realestategozamadrid.com/vender/comprar" />
      </Head>
      <PropertyPage />
    </>
  );
} 