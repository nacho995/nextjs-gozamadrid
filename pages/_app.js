// pages/_app.js - VERSIÓN OPTIMIZADA CON LAYOUT GLOBAL
import '@/styles/globals.css';
import { useEffect } from 'react';
import { NavbarProvider } from '@/components/context/navBarContext';
import Header from '@/components/header';
import Footer from '@/components/footer';
import FloatingValoradorButton from '@/components/FloatingValoradorButton';

function MyApp({ Component, pageProps }) {
  // Efecto para evitar problemas de hidratación
  useEffect(() => {
    // Marcar que la aplicación está hidratada
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-hydrated', 'true');
    }
  }, []);

  return (
    <NavbarProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header global en todas las páginas */}
        <Header />
        
        {/* Contenido principal de cada página */}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        
        {/* Footer global en todas las páginas */}
        <Footer />
        
        {/* Botón flotante de valoración en todas las páginas */}
        <FloatingValoradorButton />
      </div>
    </NavbarProvider>
  );
}

export default MyApp;
