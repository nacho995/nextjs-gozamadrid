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
        <div className="relative w-32 h-16">
          <svg
            viewBox="0 0 120 60"
            className="w-full h-full"
          >
            <defs>
              {/* Gradiente dorado premium para el lazo infinito */}
              <linearGradient id="infinityGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                <stop offset="20%" style={{ stopColor: '#FFA500' }} />
                <stop offset="40%" style={{ stopColor: '#FFD700' }} />
                <stop offset="60%" style={{ stopColor: '#FFA500' }} />
                <stop offset="80%" style={{ stopColor: '#FFD700' }} />
                <stop offset="100%" style={{ stopColor: '#FFA500' }} />
              </linearGradient>
              
              {/* Filtro de resplandor dorado intenso */}
              <filter id="goldenGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Sombra dorada difusa */}
              <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feFlood floodColor="#FFD700" floodOpacity="0.6"/>
                <feComposite in="flood" in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Sombra de fondo suave */}
            <path
              d="M 15,30 
                 C 15,15 25,5 35,5
                 C 50,5 55,20 60,30
                 C 65,20 70,5 85,5
                 C 95,5 105,15 105,30
                 C 105,45 95,55 85,55
                 C 70,55 65,40 60,30
                 C 55,40 50,55 35,55
                 C 25,55 15,45 15,30 Z"
              fill="none"
              stroke="#FFD700"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#softGlow)"
              opacity="0.3"
            />
            
            {/* Infinito principal ondulado - lazo elegante */}
            <path
              d="M 15,30 
                 C 15,15 25,5 35,5
                 C 50,5 55,20 60,30
                 C 65,20 70,5 85,5
                 C 95,5 105,15 105,30
                 C 105,45 95,55 85,55
                 C 70,55 65,40 60,30
                 C 55,40 50,55 35,55
                 C 25,55 15,45 15,30 Z"
              fill="none"
              stroke="url(#infinityGlow)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldenGlow)"
              className="animate-infinity-flow"
              style={{
                filter: 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500)',
              }}
            />

            {/* Línea de brillo que viaja por el infinito */}
            <path
              d="M 15,30 
                 C 15,15 25,5 35,5
                 C 50,5 55,20 60,30
                 C 65,20 70,5 85,5
                 C 95,5 105,15 105,30
                 C 105,45 95,55 85,55
                 C 70,55 65,40 60,30
                 C 55,40 50,55 35,55
                 C 25,55 15,45 15,30 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-infinity-light"
              filter="url(#goldenGlow)"
              style={{
                filter: 'drop-shadow(0 0 5px #FFFFFF)',
              }}
            />
          </svg>
        </div>
        <p className="mt-6 text-lg text-white font-light" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {message}
        </p>
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

// Estilos globales para las animaciones del infinito ondulado
const styles = `
  @keyframes infinity-flow {
    0% {
      stroke-dashoffset: 400;
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 0.7;
    }
  }

  @keyframes infinity-light {
    0% {
      stroke-dashoffset: 400;
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: -400;
      opacity: 0;
    }
  }

  @keyframes infinity-pulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 8px #FFD700);
    }
    50% {
      transform: scale(1.05);
      filter: drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 25px #FFA500);
    }
  }

  .animate-infinity-flow {
    stroke-dasharray: 400;
    animation: infinity-flow 3s ease-in-out infinite;
  }

  .animate-infinity-light {
    stroke-dasharray: 60;
    animation: infinity-light 2s linear infinite;
  }
`;

// Agregar los estilos al documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default LoadingScreen; 