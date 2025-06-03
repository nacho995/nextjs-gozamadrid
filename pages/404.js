import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal después de un breve retraso
    const redirectTimer = setTimeout(() => {
      router.replace('/');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
        <p className="mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <a href="/" className="bg-gold hover:bg-gold/80 text-white font-bold py-2 px-4 rounded">
          Volver al inicio
        </a>
      </div>
    </div>
  );
} 