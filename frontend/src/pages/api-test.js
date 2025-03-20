import React from 'react';
import ApiExample from '../components/ApiExample';
import Head from 'next/head';

export default function ApiTestPage() {
  return (
    <>
      <Head>
        <title>Test de API con HTTPS - GozaMadrid</title>
        <meta 
          name="description" 
          content="Página de prueba para mostrar la integración del frontend con la API a través de HTTPS usando Cloudflare" 
        />
      </Head>
      <main>
        <ApiExample />
      </main>
    </>
  );
} 