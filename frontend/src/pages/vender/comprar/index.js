import Head from 'next/head';

import PropertyPage from "@/components/propiedades/PropertyPage";

export default function Comprar() {
  return (
    <>
      <Head>
        <title>Propiedades en Venta | Goza Madrid</title>
        <meta name="description" content="Explora nuestra selección de propiedades en venta en Madrid. Encuentra tu hogar ideal con Goza Madrid." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PropertyPage />
    </>
  );
}




