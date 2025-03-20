import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Este componente captura todas las rutas no definidas específicamente
export default function CatchAll() {
  const router = useRouter();
  
  useEffect(() => {
    // Solo redirigir cuando:
    // 1. Estamos en el navegador
    // 2. Cuando la ruta no es la raíz
    // 3. Cuando la URL no tiene ya un parámetro de redirección (para evitar bucles)
    if (typeof window !== 'undefined' && 
        router.asPath !== '/' && 
        !router.asPath.includes('?redirected=true')) {
      console.log('[Capturada ruta no existente]:', router.asPath);
      
      // Usamos router.replace en lugar de window.location para mejor manejo de estado
      router.replace('/?redirected=true');
    }
  }, [router.asPath, router]);

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

// Desactivamos la generación estática para asegurarnos que siempre redirija
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps(context) {
  // Si estamos en la raíz /, mostramos la página principal
  if (!context.params?.slug || context.params.slug.length === 0) {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    };
  }

  // Para cualquier otra ruta, permitimos que el componente maneje la redirección en el cliente
  return {
    props: {},
  };
}