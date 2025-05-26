import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import ValorUnico from '../components/lujo/ValorUnico';
import ProcesoVenta from '../components/lujo/ProcesoVenta';
import Testimonios from '../components/lujo/Testimonios';
import GaleriaPropiedades from '../components/lujo/GaleriaPropiedades';
import FormularioContacto from '../components/lujo/FormularioContacto';
import SobreNosotros from '../components/lujo/SobreNosotros';
import HeaderLanding from '../components/lujo/HeaderLanding';
import FooterLanding from '../components/lujo/FooterLanding';
import SEOMetadata from '../components/SEOMetadata';
import Link from 'next/link';
import PopupLead from '../components/lujo/PopupLead';

const PropiedadesLujo = () => {
  // Estados para controlar elementos de UI
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPopupMinimized, setIsPopupMinimized] = useState(true); // Iniciar minimizado
  
  // Manejar scroll para mostrar/ocultar elementos
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botón flotante después de 300px de scroll
      if (window.scrollY > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
      
      // Mostrar popup maximizado después de 1500px de scroll si está minimizado
      if (window.scrollY > 1500 && !sessionStorage.getItem('popupShown') && isPopupMinimized) {
        setShowPopup(true);
        setIsPopupMinimized(false);
        // Guardar en sessionStorage para controlar aparición inicial
        sessionStorage.setItem('popupShown', 'true');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPopupMinimized]);
  
  // Función para minimizar el popup
  const minimizePopup = () => {
    setIsPopupMinimized(true);
    setShowPopup(false);
  };
  
  // Función para mostrar el popup desde el estado minimizado
  const maximizePopup = () => {
    setIsPopupMinimized(false);
    setShowPopup(true);
  };
  
  // Enlace a la valoración
  const valorationLink = "https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34";
  
  // Animación para el fadeIn de las secciones
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
      <SEOMetadata 
        title="Venda su Propiedad de Lujo en Madrid | Marta Goza - Expertos en Real Estate Premium"
        description="Maximice el valor de su propiedad de lujo en Madrid con Marta Goza. Valoración gratuita y estrategia de venta personalizada por expertos en el mercado inmobiliario de lujo."
        keywords="venta pisos lujo Madrid, inmobiliaria lujo Madrid, vender casa exclusiva Madrid, Marta Goza, propiedades exclusivas"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        ogImageAlt="Propiedades de lujo en Madrid - Marta Goza Real Estate"
        author="Marta Goza"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
        {/* Solo mostrar el HeaderLanding, eliminando los headers principales */}
        <HeaderLanding />
        
        {/* Sección de Valor Único */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <ValorUnico />
        </motion.section>
        
        {/* Proceso de Venta */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <ProcesoVenta />
        </motion.section>
        
        {/* CTA Banner después del proceso de venta */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 py-8 px-4 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white"></div>
          </div>
          
          <div className="container mx-auto relative z-10">
            <h3 className="text-black text-2xl md:text-3xl font-bold mb-5">¿Quiere saber cuánto vale su propiedad de lujo en Madrid?</h3>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">Nuestros expertos realizarán una valoración detallada basada en el mercado actual y las características únicas de su propiedad</p>
            <a 
              href={valorationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Solicite su Valoración Gratuita Ahora
            </a>
          </div>
        </motion.div>
        
        {/* Testimonios */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Testimonios />
          
          {/* CTA después de testimonios con diseño mejorado */}
          <div className="text-center pb-12 pt-4">
            <div className="max-w-xl mx-auto bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl px-6 py-8 shadow-lg border border-yellow-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 mb-5 text-lg">Nuestros clientes confían en nuestras valoraciones profesionales y servicio personalizado</p>
              <a 
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-md transform hover:scale-105"
              >
                Solicitar Valoración Gratuita
              </a>
            </div>
          </div>
        </motion.section>
        
        {/* Galería de Propiedades */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <GaleriaPropiedades />
        </motion.section>
        
        {/* Formulario de Contacto */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-gray-50"
        >
          <FormularioContacto />
        </motion.section>
        
        {/* Sobre Nosotros */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <SobreNosotros />
        </motion.section>
        
        {/* CTA Banner final antes del footer con diseño premium */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 px-4 text-center relative overflow-hidden"
        >
          {/* Fondo de lujo */}
          <div className="absolute inset-0 bg-black z-0"></div>
          
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-5 z-0">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <div className="grid grid-cols-10 h-full w-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border-r border-yellow-600/10 h-full"></div>
              ))}
            </div>
          </div>
          
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="inline-block mb-6 px-4 py-1 border border-yellow-600/30 rounded-full">
              <span className="text-yellow-500 font-medium uppercase tracking-wider text-sm">Servicio Premium</span>
            </div>
            
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Maximice el valor de su inversión inmobiliaria en Madrid</h2>
            
            <p className="text-gray-300 mb-8 text-lg max-w-3xl mx-auto">
              Obtenga una valoración profesional y gratuita de su propiedad y descubra cómo nuestros expertos pueden ayudarle a vender al mejor precio del mercado actual.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105 text-lg"
              >
                Solicitar Valoración Gratuita
              </a>
              
              <a 
                href="tel:+34919012103" 
                className="inline-block bg-transparent text-yellow-500 border border-yellow-600/30 px-8 py-4 rounded-full font-semibold hover:bg-yellow-600/10 transition-all duration-300 text-lg"
              >
                Llamar: +34 919 012 103
              </a>
            </div>
          </div>
        </motion.div>
        
        {/* Solo mostrar el FooterLanding, eliminando los footers principales */}
        <FooterLanding />
        
        {/* Botón flotante que aparece al hacer scroll */}
        <AnimatePresence>
          {showFloatingButton && (
            <motion.a
              href={valorationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-5 py-3 rounded-full shadow-xl flex items-center space-x-2 border-2 border-yellow-400/30"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">Valoración Gratuita</span>
            </motion.a>
          )}
        </AnimatePresence>
        
        {/* Popup de Captación de Leads - Siempre visible */}
        <AnimatePresence>
          {(showPopup && !isPopupMinimized) && (
            <PopupLead
              key="popup-lead-maximized" 
              onClose={() => setShowPopup(false)} 
              onMinimize={minimizePopup}
              onMaximize={maximizePopup}
              valorationLink={valorationLink}
              isMinimized={false}
            />
          )}
          {isPopupMinimized && (
            <PopupLead
              key="popup-lead-minimized" 
              onClose={() => setShowPopup(false)} 
              onMinimize={minimizePopup}
              onMaximize={maximizePopup}
              valorationLink={valorationLink}
              isMinimized={true}
            />
          )}
        </AnimatePresence>
        
        {/* Botón Flotante de WhatsApp */}
        <motion.a
          href="https://wa.me/34608136529?text=Hola%2C%20estoy%20interesado%20en%20una%20valoración%20de%20mi%20propiedad"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 left-8 z-40 bg-green-500 text-white p-3 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </motion.a>
      </div>
    </>
  );
};

// Función que define un layout personalizado para esta página
// Esto evita que se muestre el header y footer global
PropiedadesLujo.getLayout = function getLayout(page) {
  return (
    <>
      {page}
    </>
  );
};

export default PropiedadesLujo;
