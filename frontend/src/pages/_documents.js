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
          
          {/* Simplificación de meta tags - similar a BestFlat */}
          <meta name="color-scheme" content="light dark" />
          <meta name="theme-color" content="#ffffff" />

          {/* Script más sutil, similar al enfoque de BestFlat */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Solo ejecutar una vez al cargar la página
                var isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
                var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (isSamsungBrowser && isDarkMode) {
                  // Establecer atributos de tema en HTML
                  document.documentElement.setAttribute('data-samsung-fix', 'true');
                  
                  // Insertar CSS específico pero más sutil
                  var style = document.createElement('style');
                  style.textContent = \`
                    /* Solución específica para Samsung Internet */
                    html[data-samsung-fix="true"] {
                      background-color: #fff;
                      color-scheme: light;
                    }
                    
                    @media (prefers-color-scheme: dark) {
                      html[data-samsung-fix="true"] body {
                        background-color: #fff;
                        color: #000;
                        filter: brightness(1.05);
                      }
                      
                      /* Preservar elementos oscuros importantes */
                      html[data-samsung-fix="true"] [data-preserve-dark="true"] {
                        filter: none !important;
                      }
                    }
                  \`;
                  document.head.appendChild(style);
                }
              })();
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
