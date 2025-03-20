// src/pages/index.js
import React, { Suspense } from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Goza Madrid - Página de Inicio</title>
        <meta name="description" content="Bienvenido a Goza Madrid - Tu portal inmobiliario en Madrid" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Goza Madrid</h1>
        <p className="text-xl mb-8">Tu portal inmobiliario de confianza en Madrid</p>
        <a 
          href="/listar-propiedades" 
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md inline-block transition-colors"
          style={{ backgroundColor: '#C7A336' }}
        >
          Ver Propiedades
        </a>
      </main>
    </>
  );
}
