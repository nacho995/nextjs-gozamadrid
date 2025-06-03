import React from 'react';

export default function TailwindTest() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 my-8">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-amarillo rounded-full flex items-center justify-center">
          <span className="text-white font-bold">T</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind Funciona!</div>
        <p className="text-gray-500">Este es un componente de prueba de Tailwind CSS</p>
      </div>
    </div>
  );
} 