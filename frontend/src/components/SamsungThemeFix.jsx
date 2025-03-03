"use client";
import { useEffect } from 'react';
import Head from 'next/head';

const SamsungThemeFix = () => {
  // Efecto para aplicar soluciones adicionales al DOM directamente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Función para forzar el modo claro
    const forceLightMode = () => {
      // 1. Forzar el atributo data-theme si existe
      if (document.documentElement.hasAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      // 2. Crear una capa blanca/semitransparente que elimine cualquier capa oscura
      const lightModeOverlay = document.createElement('div');
      lightModeOverlay.id = 'samsung-light-mode-overlay';
      lightModeOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255,255,255,0.03);
        pointer-events: none;
        z-index: 9999999;
        mix-blend-mode: lighten;
      `;
      document.body.appendChild(lightModeOverlay);
      
      // 3. Añadir CSS para forzar el tema claro
      const style = document.createElement('style');
      style.textContent = `
        html {
          background-color: #ffffff !important;
          filter: none !important;
          color-scheme: light !important;
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        @media (prefers-color-scheme: dark) {
          * {
            filter: none !important;
            -webkit-filter: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    };
    
    // Ejecutar después de un pequeño retraso para asegurar que se aplica después de cualquier otro script
    setTimeout(forceLightMode, 100);
    
    // También ejecutar cuando cambie el modo de color
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', forceLightMode);
    
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', forceLightMode);
      // No eliminar los elementos para mantener la configuración
    };
  }, []);
  
  return (
    <Head>
      {/* Meta tags básicos (pueden ser sobrescritos, por eso usamos JavaScript también) */}
      <meta name="color-scheme" content="light only" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="forced-colors" content="none" />
      <meta name="view-transition" content="same-origin" />
      <meta name="supported-color-schemes" content="light only" />
      
      {/* CSS para navegadores Samsung y Android */}
      <style>{`
        @supports (-webkit-touch-callout: none) {
          html {
            color-scheme: light !important;
            forced-color-adjust: none !important;
            background-color: #ffffff !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          @media (prefers-color-scheme: dark) {
            html, body {
              filter: none !important;
              -webkit-filter: none !important;
              background-color: #ffffff !important;
            }
            * {
              filter: none !important;
              -webkit-filter: none !important;
            }
          }
        }
      `}</style>
    </Head>
  );
};

export default SamsungThemeFix;