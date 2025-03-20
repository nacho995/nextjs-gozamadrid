import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Página para manejar rutas no encontradas
export default function NotFound() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal después de un breve retraso
    const redirectTimer = setTimeout(() => {
      router.replace('/');
    }, 2000);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);

  // Mostrar una pantalla de carga mientras redirige
  return (
    <>
      <Head>
        <title>Redirigiendo... - Goza Madrid</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Redirigiendo...</h1>
          <p className="text-lg mb-8">
            Te estamos llevando a la página principal.
          </p>
          <a 
            href="/" 
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md inline-block transition-colors"
            style={{ backgroundColor: '#C7A336' }}
          >
            Ir a Inicio
          </a>
        </div>
      </div>
    </>
  );
}