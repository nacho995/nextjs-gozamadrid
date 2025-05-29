import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Custom500() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5);
  
  // Determinar si estamos en una página de propiedad
  const isPropertyPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/property/') || 
     window.location.pathname.includes('/propiedad/'));

  useEffect(() => {
    // Cuenta regresiva
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Redirigir a la página principal después de 5 segundos
    const redirectTimer = setTimeout(() => {
      router.replace('/');
    }, 5000);
    
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [router]);

  // Manejar la redirección manual
  const handleRedirectToHome = () => {
    router.replace('/');
  };

  // Manejar reintento
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Manejar redirección a listado de propiedades
  const handleRedirectToProperties = () => {
    router.push('/propiedades');
  };

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
        <title>Error del Servidor - Goza Madrid</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{
        maxWidth: '32rem',
        width: '100%',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#C7A336'
        }}>
          Error del Servidor
        </h1>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '0.5rem'
        }}>
          Lo sentimos, ha ocurrido un error en nuestro servidor.
        </p>
        <p style={{
          fontSize: '0.925rem',
          opacity: '0.8',
          marginBottom: '2rem'
        }}>
          {isPropertyPage 
            ? 'No se ha podido cargar la información de esta propiedad. Estamos trabajando para solucionar este problema lo antes posible.' 
            : 'Estamos trabajando para solucionar este problema lo antes posible.'}
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {isPropertyPage && (
            <button 
              onClick={handleRetry}
              style={{
                backgroundColor: '#C7A336',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Reintentar
            </button>
          )}
          
          {isPropertyPage && (
            <button 
              onClick={handleRedirectToProperties}
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
            >
              Ver todas las propiedades
            </button>
          )}
          
          <button 
            onClick={handleRedirectToHome}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            Volver a Inicio
          </button>
        </div>
        
        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          opacity: '0.7'
        }}>
          Serás redirigido automáticamente en {timeLeft} segundos...
        </p>
      </div>
    </div>
  );
} 