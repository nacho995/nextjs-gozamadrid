// pages/_document.js

import Document, { Html, Head, Main, NextScript } from "next/document";
import { Chakra_Petch as ChakraPetch } from "@next/font/google";

const chakraPetch = ChakraPetch({
  subsets: ["regular"],
  weight: ["400", "500", "600", "700"],
});

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className={chakraPetch.className}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
