// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  // Asegurarse de que estamos en entorno Vercel
  const isVercel = process.env.VERCEL_URL || false;

  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Script de depuración para Vercel */}
        <script src="/custom-debug.js" strategy="beforeInteractive" />
        {/* Añadir etiqueta base para asegurar las rutas relativas */}
        <base href="/" />
        {/* Añadir un script para redirigir 404 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Verificar si estamos en la página de error 404
            if (window.location.pathname === '/404' || window.location.pathname === '/404.html') {
              window.location.href = '/';
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
