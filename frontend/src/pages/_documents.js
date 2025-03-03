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
          
          {/* Meta tag crucial según la documentación de Samsung */}
          <meta name="color-scheme" content="light" />
          <meta name="theme-color" content="#ffffff" />

          {/* Script optimizado basado en la documentación oficial de Samsung */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Detectar Samsung Internet en modo oscuro
                var isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
                var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (isSamsungBrowser && isDarkMode) {
                  // Aplicar solución recomendada por Samsung
                  var style = document.createElement('style');
                  style.textContent = \`
                    /* Resetear colores específicamente para Samsung Internet */
                    html, body {
                      background-color: #ffffff !important;
                      color-scheme: light !important;
                    }
                    
                    body {
                      color: #000000 !important;
                    }
                    
                    /* Forzar colores claros para textos y elementos */
                    body * {
                      background-color: initial;
                      color: initial;
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
