import React from 'react';
import { motion } from 'framer-motion';

function PopupLead({ onClose, onMinimize, onMaximize, valorationLink, isMinimized = false }) {
  // Si está minimizado, mostrar versión compacta
  if (isMinimized) {
    return (
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-20 right-8 z-[9999]"
      >
        <button
          onClick={onMaximize}
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full shadow-2xl border border-yellow-400/30 p-4 hover:scale-105 transition-all duration-300"
          aria-label="Abrir valoración gratuita"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-black font-bold text-sm hidden sm:block">Valoración</span>
          </div>
        </button>
      </motion.div>
    );
  }

  // Versión maximizada (original)
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
    >
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-2xl shadow-2xl border border-yellow-400/30 overflow-hidden">
        {/* Header del popup */}
        <div className="bg-black/10 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-black font-semibold text-sm">Valoración Gratuita</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={onMinimize}
              className="text-black hover:text-gray-700 transition-colors p-1"
              aria-label="Minimizar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="text-black hover:text-gray-700 transition-colors p-1"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contenido del popup */}
        <div className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <h3 className="text-black text-lg font-bold mb-2">
              ¿Quiere saber el valor de su propiedad?
            </h3>
            
            <p className="text-black/80 text-sm mb-4 leading-relaxed">
              Obtenga una valoración profesional y gratuita de su propiedad en Madrid. 
              Nuestros expertos le ayudarán a maximizar su inversión.
            </p>
            
            <div className="space-y-3">
              <a 
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black text-white py-3 px-4 rounded-full font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Solicitar Valoración Gratuita
              </a>
              
              <a 
                href="tel:+34677364015"
                className="block w-full bg-transparent text-black border border-black/30 py-2 px-4 rounded-full font-medium hover:bg-black/10 transition-all duration-300 text-sm"
              >
                📞 Llamar: +34 608 136 529
              </a>
            </div>
          </div>
        </div>
        
        {/* Indicador de confianza */}
        <div className="bg-black/10 px-6 py-2 text-center">
          <p className="text-black/70 text-xs">
            ✓ Sin compromiso • ✓ Respuesta en 24h • ✓ Expertos en Madrid
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default PopupLead; 