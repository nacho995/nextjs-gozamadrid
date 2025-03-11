import React from 'react';
import PropTypes from 'prop-types';

const LoadingScreen = ({ 
  fullScreen = true, 
  message = "Cargando...", 
  ariaLabel = "Pantalla de carga" 
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-lg text-gray-600">Cargando contenido...</p>
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