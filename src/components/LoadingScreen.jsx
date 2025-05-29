import React from 'react';
import PropTypes from 'prop-types';

const LoadingScreen = ({ 
  fullScreen = true, 
  message = "Cargando...", 
  ariaLabel = "Pantalla de carga" 
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
          >
            <defs>
              {/* Gradiente principal para el trazo */}
              <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#2A2A2A' }} />
                <stop offset="25%" style={{ stopColor: '#B4833E' }} />
                <stop offset="50%" style={{ stopColor: '#FFD700' }} />
                <stop offset="75%" style={{ stopColor: '#B4833E' }} />
                <stop offset="100%" style={{ stopColor: '#2A2A2A' }} />
              </linearGradient>
              
              {/* Gradiente para el efecto de sombra */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Trayectoria del infinito ajustada */}
            <path
              d="M 30,50 
                 C 30,35 38,25 50,25
                 C 65,25 70,40 80,45
                 C 87,48 90,45 90,50
                 C 90,55 87,52 80,55
                 C 70,60 65,75 50,75
                 C 38,75 30,65 30,50
                 Z"
              fill="none"
              stroke="url(#infinityGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="animate-dash"
              style={{
                filter: 'drop-shadow(0 0 4px #FFD700)'
              }}
            />

            {/* Añadir un segundo path para el efecto de brillo */}
            <path
              d="M 30,50 
                 C 30,35 38,25 50,25
                 C 65,25 70,40 80,45
                 C 87,48 90,45 90,50
                 C 90,55 87,52 80,55
                 C 70,60 65,75 50,75
                 C 38,75 30,65 30,50
                 Z"
              fill="none"
              stroke="url(#infinityGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="animate-dash-reverse"
              style={{
                opacity: 0.5,
                filter: 'drop-shadow(0 0 8px #FFD700)'
              }}
            />
          </svg>
        </div>
        <p className="mt-4 text-lg text-white">{message}</p>
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

// Estilos globales necesarios para la animación
const styles = `
  @keyframes dash {
    0% {
      stroke-dashoffset: 300;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes dash-reverse {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -300;
    }
  }

  .animate-dash {
    stroke-dasharray: 300;
    animation: dash 2s linear infinite;
  }

  .animate-dash-reverse {
    stroke-dasharray: 300;
    animation: dash-reverse 2s linear infinite;
  }
`;

// Agregar los estilos al documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default LoadingScreen; 