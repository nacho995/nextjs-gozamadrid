import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaDiamond, FaCrown, FaGem } from 'react-icons/fa';

const FloatingValoradorButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  // Efecto de pulsación sutil cada 5 segundos para llamar la atención
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Aura de resplandor ambiental */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isPulsing ? [0, 0.6, 0] : 0, 
          scale: isPulsing ? [0.8, 1.4, 0.8] : 0.8 
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: isPulsing ? 2 : 0
        }}
        className="fixed bottom-8 right-8 z-40 pointer-events-none"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-radial from-yellow-400/30 via-amber-500/20 to-transparent blur-xl"></div>
      </motion.div>

      {/* Botón principal ultra-premium */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay: 2.5,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="fixed bottom-8 right-8 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{ 
            y: isPulsing ? [0, -8, 0] : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
          className="relative group"
        >
          {/* Marco exterior dorado con brillo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Botón base con gradientes complejos */}
          <motion.a
            href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-4 px-8 py-5 rounded-full overflow-hidden shadow-2xl transform transition-all duration-500 group"
            style={{
              background: `linear-gradient(135deg, 
                #FFD700 0%, 
                #FFA500 15%,
                #FFD700 30%, 
                #B8860B 45%,
                #DAA520 60%,
                #FFD700 75%,
                #FFA500 90%,
                #FFD700 100%)`,
              boxShadow: `
                0 25px 50px -12px rgba(255, 215, 0, 0.5),
                0 0 30px rgba(255, 215, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
            }}
            whileHover={{
              boxShadow: `
                0 35px 70px -12px rgba(255, 215, 0, 0.6),
                0 0 50px rgba(255, 215, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
            whileTap={{ scale: 0.98 }}
            aria-label="Obtener valoración gratuita de propiedad de lujo"
            title="Valoración profesional gratuita • Propiedades exclusivas"
          >
            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              animate={{
                x: isHovered ? "200%" : "-200%"
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            />

            {/* Patrón de textura sutil */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Contenido del botón */}
            <div className="relative z-10 flex items-center gap-4">
              {/* Icono premium con animación */}
              <motion.div
                animate={{ 
                  rotate: isHovered ? 360 : 0,
                  scale: isHovered ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black/20 rounded-full blur-sm"></div>
                <div className="relative bg-black/10 p-2 rounded-full backdrop-blur-sm">
                  <FaGem className="text-2xl text-white drop-shadow-lg" />
                </div>
              </motion.div>

              {/* Texto premium responsive */}
              <div className="flex flex-col items-start">
                <motion.span 
                  className="font-serif text-white font-bold text-lg tracking-wide leading-tight drop-shadow-lg hidden lg:block"
                  animate={{ 
                    textShadow: isHovered 
                      ? "0 0 20px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.5)"
                      : "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  Valoración
                </motion.span>
                <motion.span 
                  className="font-serif text-white/90 font-semibold text-sm tracking-widest uppercase hidden lg:block"
                  animate={{ 
                    textShadow: isHovered 
                      ? "0 0 15px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.5)"
                      : "0 1px 2px rgba(0,0,0,0.3)"
                  }}
                >
                  Premium
                </motion.span>
                
                {/* Versión móvil */}
                <motion.span 
                  className="font-serif text-white font-bold text-base tracking-wide drop-shadow-lg lg:hidden"
                  animate={{ 
                    textShadow: isHovered 
                      ? "0 0 15px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.5)"
                      : "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  Valorar
                </motion.span>
              </div>

              {/* Indicador de "Gratuito" */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isHovered ? 1 : 0, 
                  opacity: isHovered ? 1 : 0 
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute -top-3 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg hidden lg:block"
              >
                GRATIS
              </motion.div>
            </div>

            {/* Partículas flotantes decorativas */}
            <AnimatePresence>
              {isHovered && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{ 
                        opacity: 0, 
                        scale: 0,
                        x: 40,
                        y: 20
                      }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, 1, 0],
                        x: [40, 40 + (Math.random() - 0.5) * 80],
                        y: [20, 20 + (Math.random() - 0.5) * 60]
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.a>

          {/* Tooltip premium al hacer hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-2xl border border-yellow-400/30 hidden lg:block"
                style={{ minWidth: '280px' }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FaCrown className="text-yellow-400 text-sm" />
                    <span className="font-serif font-semibold text-sm">Valoración Profesional</span>
                    <FaCrown className="text-yellow-400 text-sm" />
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Análisis completo del mercado inmobiliario de lujo
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-yellow-400">
                    <span>✓ Inmediato</span>
                    <span>✓ Sin compromiso</span>
                    <span>✓ Confidencial</span>
                  </div>
                </div>
                
                {/* Flecha del tooltip */}
                <div className="absolute top-full right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/90"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};

export default FloatingValoradorButton; 