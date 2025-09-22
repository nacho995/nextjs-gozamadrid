import React from 'react';
// import Image from "next/legacy/image";
import { motion } from 'framer-motion';

function Header() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Propiedad de lujo en Madrid"
          layout="fill"
          objectFit="cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Venda su Propiedad de Lujo en Madrid con Expertos del Mercado Premium
          </h1>
          
          <p className="mb-8 text-xl font-light md:text-2xl">
            Valoración personalizada y estrategia de venta exclusiva para maximizar el valor de su inversión inmobiliaria
          </p>
          
          <motion.a
            href="https://es.statefox.com/mites/v/68a5a4c5e10bc5704c05f3f6"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-md bg-gradient-to-r from-yellow-400 to-yellow-700 px-8 py-4 text-lg font-semibold text-black shadow-lg transition duration-300 hover:from-yellow-500 hover:to-yellow-800 inline-block"
          >
            Solicite una Valoración Gratuita
          </motion.a>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 5L12 19M12 19L19 12M12 19L5 12" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Header;
