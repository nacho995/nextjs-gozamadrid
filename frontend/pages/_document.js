import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Script loader para interceptar errores lo antes posible */}
        <script
          id="script-loader"
          src="/script-loader.js"
          strategy="beforeInteractive"
        />
        {/* Otros scripts y meta tags */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 