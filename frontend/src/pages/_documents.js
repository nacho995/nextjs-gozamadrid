// pages/_document.js

import Document, { Html, Head, Main, NextScript } from "next/document";
import { Chakra_Petch as ChakraPetch } from "@next/font/google";

const chakraPetch = ChakraPetch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

class MyDocument extends Document {
  render() {
    return (
      <Html className={chakraPetch.className} lang="es">
        <Head>
          {/* Meta viewport para hacer el sitio responsive */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Estos meta tags no afectan otros navegadores */}
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />

          {/* Script específico SOLO para Samsung Internet en modo oscuro */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // Detector mejorado y específico para Samsung Internet
              if (/SamsungBrowser\\/([0-9\\.]+)/.test(navigator.userAgent) && 
                  window.matchMedia('(prefers-color-scheme: dark)').matches) {
                
                // Solo crear el estilo si no existe ya
                if (!document.getElementById('samsung-fix-style')) {
                  var samsungStyle = document.createElement('style');
                  samsungStyle.id = 'samsung-fix-style';
                  samsungStyle.innerHTML = \`
                    /* Estilos exclusivos para Samsung Internet en modo oscuro */
                    @media (prefers-color-scheme: dark) {
                      html, body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                      }
                      * {
                        background-color: initial !important;
                        color: initial !important;
                      }
                    }
                  \`;
                  document.head.appendChild(samsungStyle);
                  
                  // Overlay solo en Samsung modo oscuro
                  document.addEventListener('DOMContentLoaded', function() {
                    var overlay = document.createElement('div');
                    overlay.id = 'samsung-fix-overlay';
                    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.12);z-index:2147483647;pointer-events:none;mix-blend-mode:screen;';
                    document.body.appendChild(overlay);
                  });
                  
                  console.log('Aplicada corrección específica para Samsung Internet en modo oscuro');
                }
              }
            `
          }} />

          {/* Puedes agregar otras metaetiquetas o enlaces a fuentes, etc. */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
