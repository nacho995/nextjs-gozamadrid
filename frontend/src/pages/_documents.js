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
          <meta name="color-scheme" content="light" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="forced-colors" content="none" />
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
