import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function Error({ statusCode }) {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal después de 3 segundos
    const redirectTimer = setTimeout(() => {
      router.replace('/');
    }, 3000);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #1a202c, #2d3748)',
      color: 'white',
      padding: '1rem'
    }}>
      <Head>
        <title>Error {statusCode || 'Desconocido'} - Goza Madrid</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          {statusCode === 404 
            ? 'Página no encontrada' 
            : `Error ${statusCode || 'Desconocido'}`}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '2rem'
        }}>
          {statusCode === 404 
            ? 'Lo sentimos, la página que estás buscando no existe o ha sido trasladada.' 
            : 'Lo sentimos, ha ocurrido un error inesperado.'}
        </p>
        <a 
          href="/"
          style={{
            backgroundColor: '#C7A336',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            display: 'inline-block',
            textDecoration: 'none',
            transition: 'backgroundColor 0.3s'
          }}
        >
          Volver a Inicio
        </a>
        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          opacity: '0.7'
        }}>
          Serás redirigido automáticamente en 3 segundos...
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 