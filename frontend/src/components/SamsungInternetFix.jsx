import { useEffect } from 'react';
import Head from 'next/head';

const SamsungInternetFix = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Función para detectar Samsung Internet
    const isSamsungInternet = /SamsungBrowser/i.test(navigator.userAgent);
    
    if (isSamsungInternet) {
      // Solución agresiva específica para Samsung Internet
      const forceLightMode = () => {
        // Crear una capa superpuesta que contrarreste la capa oscura de Samsung
        const overlay = document.createElement('div');
        overlay.id = 'samsung-light-mode-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(255,255,255,0.08);
          pointer-events: none;
          z-index: 2147483647;
          mix-blend-mode: screen;
        `;
        document.body.appendChild(overlay);
        
        // Forzar modo claro en todo el documento
        const style = document.createElement('style');
        style.innerHTML = `
          html, body {
            background-color: #ffffff !important;
            filter: brightness(1.1) !important;
            -webkit-filter: brightness(1.1) !important;
          }
          html * {
            color-scheme: light !important;
            forced-color-adjust: none !important;
          }
          @media (prefers-color-scheme: dark) {
            html, body, * {
              background-color: initial !important;
              color: initial !important;
              border-color: initial !important;
              filter: contrast(1.1) brightness(1.1) !important;
              -webkit-filter: contrast(1.1) brightness(1.1) !important;
            }
            html::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: white;
              opacity: 0.05;
              z-index: 2147483646;
              pointer-events: none;
            }
          }
        `;
        document.head.appendChild(style);
      };
      
      // Aplicar inmediatamente
      forceLightMode();
      
      // Y también cuando cambie el esquema de colores
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      colorSchemeQuery.addEventListener('change', forceLightMode);
      
      return () => {
        colorSchemeQuery.removeEventListener('change', forceLightMode);
      };
    }
  }, []);
  
  return (
    <Head>
      <meta name="theme-color" content="#ffffff" />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <meta name="view-transition" content="same-origin" />
      <meta name="force-color-adjust" content="normal" />
      <style>{`
        @supports (-webkit-touch-callout: none) {
          html {
            background-color: #ffffff !important;
          }
          @media (prefers-color-scheme: dark) {
            html {
              filter: brightness(1.05) !important;
              -webkit-filter: brightness(1.05) !important;
            }
          }
        }
      `}</style>
    </Head>
  );
};

export default SamsungInternetFix; 