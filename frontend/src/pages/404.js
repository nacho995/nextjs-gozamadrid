import Link from 'next/link';
import React from 'react';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-lg mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido trasladada.
        </p>
        <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md inline-block transition-colors">
          Volver a Inicio
        </Link>
      </div>
    </div>
  );
} 