import { useEffect } from 'react';
import { useRouter } from 'next/router';

function Error({ statusCode }) {
  const router = useRouter();

  useEffect(() => {
    // Redireccionamos a la página principal después de un breve retraso
    const redirectTimer = setTimeout(() => {
      window.location.href = '/';
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          {statusCode
            ? `Error ${statusCode} - Página no disponible`
            : 'Ocurrió un error'}
        </h1>
        <p className="text-lg mb-8">
          Lo sentimos, no pudimos cargar la página que estabas buscando.
          Te estamos redirigiendo a la página principal...
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
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 