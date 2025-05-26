import React from 'react';
import Link from 'next/link';
import Image from "next/legacy/image";
import { motion } from 'framer-motion';

const HeaderLanding = () => {
  return (
    <header className="w-full">
      {/* Barra superior con logo y teléfono */}
      <div className="bg-gradient-to-r from-black via-black to-amarillo backdrop-blur-md py-3 px-4 shadow-xl border-b border-yellow-600/30">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <div className="flex items-center" style={{ maxHeight: '8rem' }}> 
              <Image 
                src="/logonuevo.png" 
                alt="Real Estate Goza Madrid" 
                width={150} 
                height={200}
                layout="intrinsic"
                priority
              />
            </div>
          </Link>
          
          {/* Teléfono */}
          <a 
            href="tel:+34608136529" 
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm">+34 608 136 529</span>
          </a>
        </div>
      </div>

      {/* Hero Banner */}
      <div 
        className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80)',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay con gradiente de lujo para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        
        {/* Elementos decorativos de lujo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-20 h-20 md:w-40 md:h-40 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 md:w-40 md:h-40 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl"></div>
        </div>
        
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-700/20 backdrop-blur-sm border border-yellow-500/40 rounded-full"
          >
            <span className="text-yellow-400 font-medium uppercase tracking-wider text-sm md:text-base">Expertos en Real Estate Premium</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="block">Venda su Propiedad de Lujo</span>
            <span className="block">en <span className="text-yellow-500">Madrid</span> al Mejor Precio</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Valoración personalizada y estrategia de venta exclusiva para maximizar el valor de su inversión inmobiliaria
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <motion.a
              href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 px-8 py-4 text-lg font-bold text-black shadow-xl transition duration-300 hover:from-yellow-600 hover:to-yellow-800 inline-block border-2 border-yellow-400/30"
            >
              Solicite una Valoración Gratuita
            </motion.a>
            
            <motion.a
              href="tel:+34608136529"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white border border-yellow-600/30 shadow-lg hover:bg-black transition duration-300 inline-block"
            >
              Llamar Ahora
            </motion.a>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default HeaderLanding;
