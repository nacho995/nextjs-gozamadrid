// src/pages/index.js
import React from 'react';
import Head from 'next/head';
import HomeComponent from '../components/home';

export default function Home() {
  return (
    <>
      <Head>
        <title>Goza Madrid - Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeComponent />
    </>
  );
}
