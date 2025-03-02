import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-black to-gray-900 z-[9999]">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mb-4"></div>
        <p className="text-amber-400 text-xl font-semibold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
          Cargando...
        </p>
        <div className="mt-3 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      </div>
    </div>
  );
};

export default LoadingScreen; 