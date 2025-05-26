import React from 'react';
import Link from 'next/link';
import Image from "next/legacy/image";
import { motion } from 'framer-motion';

const FooterLanding = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white to-amarillo text-white py-12">
      <div className="container mx-auto px-4">
        {/* Separador decorativo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-700 rounded-full"></div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo y texto */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image 
                src="/logonuevo.png" 
                alt="Real Estate Goza Madrid" 
                width={120} 
                height={120}
                layout="intrinsic"
                className="h-auto w-auto mx-auto md:mx-0 mb-4"
              />
            </motion.div>
            <p className="text-sm text-black max-w-md leading-relaxed">
              Expertos en el mercado inmobiliario premium de Madrid. Asesoramiento personalizado para propiedades de lujo en las mejores zonas de la capital.
            </p>
          </div>
          
          {/* Enlaces y CTA */}
          <div className="text-center md:text-right">
            <a 
              href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-6 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Solicitar Valoración Gratuita
            </a>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
              <Link href="/aviso-legal" className="text-sm text-black hover:text-gray-400 transition-colors">
                Aviso Legal
              </Link>
              <Link href="/politica-privacidad" className="text-sm text-black hover:text-gray-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/politica-cookies" className="text-sm text-black hover:text-gray-400 transition-colors">
                Política de Cookies
              </Link>
            </div>
            <p className="text-xs text-black">
              © {currentYear} Real Estate Goza Madrid. Todos los derechos reservados.
            </p>
          </div>
        </div>
        
        {/* Dirección y contacto */}
        <div className="mt-8 pt-6 border-t border-yellow-700/30 text-center text-sm text-black">
          <p>Calle de Azulinas, 28036 Madrid | Email: marta@gozamadrid.com</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterLanding;
