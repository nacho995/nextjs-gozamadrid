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
      <Html className={chakraPetch.className}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
