import React from 'react';
import PropTypes from 'prop-types';

const LoadingScreen = ({ 
  fullScreen = true, 
  message = "Cargando...", 
  ariaLabel = "Pantalla de carga" 
}) => {
  return (
    <div 
      className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-black to-gray-900 z-[9999]"
      role="alert"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div 
        className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-2xl flex flex-col items-center"
        role="status"
      >
        <div className="relative h-16 w-32 mb-4">
          {/* Círculo izquierdo */}
          <div 
            className="absolute left-0 top-0 w-16 h-16 border-4 border-amarillo rounded-full"
            style={{
              animation: 'infinityLeft 2s linear infinite',
            }}
          ></div>
          {/* Círculo derecho */}
          <div 
            className="absolute right-0 top-0 w-16 h-16 border-4 border-gray-400 rounded-full"
            style={{
              animation: 'infinityRight 2s linear infinite',
            }}
          ></div>
        </div>
        <p 
          className="text-amber-400 text-xl font-semibold" 
          style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
        >
          {message}
        </p>
        <div 
          className="mt-3 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          aria-hidden="true"
        ></div>
        {/* Texto oculto para lectores de pantalla */}
        <span className="sr-only">
          La página está cargando. Por favor, espere un momento.
        </span>
      </div>
    </div>
  );
};

// PropTypes para documentación y validación
LoadingScreen.propTypes = {
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default LoadingScreen; 