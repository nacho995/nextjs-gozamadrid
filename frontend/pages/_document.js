// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Goza Madrid" />
        <meta name="copyright" content="© 2024 Goza Madrid. Todos los derechos reservados." />
        
        {/* Verificación para Google Search Console */}
        <meta name="google-site-verification" content="tu-codigo-de-verificacion" />
        
        {/* Preload de recursos críticos */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" 
          as="style" 
        />
        
        {/* Font stylesheet - Movido desde _app.js */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* DNS prefetch para dominios externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
