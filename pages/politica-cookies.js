import React from 'react';
import Head from 'next/head';

export default function PoliticaCookies() {
  return (
    <>
      <Head>
        <title>Política de Cookies | Goza Madrid</title>
        <meta name="description" content="Política de cookies de Goza Madrid. Información sobre el uso de cookies en nuestra web." />
      </Head>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            En Goza Madrid utilizamos cookies para mejorar tu experiencia en nuestra web. 
            Esta política de cookies te explica qué son las cookies, cómo las utilizamos 
            y cómo puedes controlarlas.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">¿Qué son las cookies?</h2>
          <p className="mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
            cuando visitas nuestra web. Nos ayudan a recordar tus preferencias y a mejorar 
            tu experiencia de navegación.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Tipos de cookies que utilizamos</h2>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              <strong>Cookies necesarias:</strong> Son esenciales para el funcionamiento 
              de la web y no se pueden desactivar.
            </li>
            <li className="mb-2">
              <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo los 
              visitantes interactúan con nuestra web.
            </li>
            <li className="mb-2">
              <strong>Cookies de marketing:</strong> Se utilizan para mostrar anuncios 
              relevantes para ti.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">¿Cómo controlar las cookies?</h2>
          <p className="mb-4">
            Puedes controlar y/o eliminar las cookies según desees. Puedes eliminar 
            todas las cookies que ya están en tu ordenador y puedes configurar la 
            mayoría de los navegadores para evitar que se coloquen. Sin embargo, 
            si lo haces, puede que tengas que ajustar manualmente algunas preferencias 
            cada vez que visites un sitio.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
          <p className="mb-4">
            Si tienes alguna pregunta sobre nuestra política de cookies, no dudes 
            en contactarnos.
          </p>
        </div>
      </div>
    </>
  );
} 