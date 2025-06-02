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
  const [isPopupMinimized, setIsPopupMinimized] = useState(true);
  
  // Manejar scroll para mostrar/ocultar elementos
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
      
      if (window.scrollY > 1500 && !sessionStorage.getItem('popupShown') && isPopupMinimized) {
        setShowPopup(true);
        setIsPopupMinimized(false);
        sessionStorage.setItem('popupShown', 'true');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPopupMinimized]);
  
  const minimizePopup = () => {
    setIsPopupMinimized(true);
    setShowPopup(false);
  };
  
  const maximizePopup = () => {
    setIsPopupMinimized(false);
    setShowPopup(true);
  };
  
  const valorationLink = "https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34";
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Schema.org estructurado para SEO de lujo inmobiliario
  const luxuryRealEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Goza Madrid - Propiedades de Lujo",
    "description": "Inmobiliaria especializada en propiedades de lujo en Madrid. Expertos en compra, venta y alquiler de pisos, casas y apartamentos exclusivos en las mejores zonas de Madrid.",
    "url": "https://www.realestategozamadrid.com/propiedades-lujo",
    "image": "https://www.realestategozamadrid.com/images/lujo-madrid-hero.jpg",
    "telephone": "+34-900-000-000",
    "email": "info@realestategozamadrid.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Serrano 123",
      "addressLocality": "Madrid", 
      "addressRegion": "Madrid",
      "postalCode": "28006",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.4168",
      "longitude": "-3.7038"
    },
    "areaServed": [
      "Madrid",
      "Salamanca",
      "Chamberí", 
      "Retiro",
      "Centro",
      "Chamartín",
      "Pozuelo de Alarcón",
      "Las Rozas",
      "Majadahonda"
    ],
    "knowsAbout": [
      "Propiedades de lujo Madrid",
      "Pisos exclusivos Madrid",
      "Casas de lujo Madrid",
      "Apartamentos premium Madrid",
      "Inversión inmobiliaria Madrid",
      "Real estate luxury Madrid"
    ],
    "serviceType": [
      "Venta de propiedades de lujo",
      "Compra de inmuebles exclusivos", 
      "Alquiler de pisos de lujo",
      "Valoración de propiedades premium",
      "Asesoramiento inmobiliario de lujo",
      "Inversión inmobiliaria Madrid"
    ],
    "priceRange": "€€€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": ["Cash", "Check", "CreditCard", "Financing"]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.realestategozamadrid.com"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Propiedades de Lujo Madrid",
        "item": "https://www.realestategozamadrid.com/propiedades-lujo"
      }
    ]
  };

  return (
    <>
      <Head>
        {/* Metadatos SEO optimizados para palabras clave de lujo */}
        <title>Propiedades de Lujo Madrid | Pisos Exclusivos | Inmobiliaria Premium Goza Madrid</title>
        <meta name="description" content="🏆 #1 Inmobiliaria de Lujo Madrid ✨ Propiedades exclusivas, pisos de lujo, casas premium en Salamanca, Chamberí, Retiro. Valoración gratuita. +15 años experiencia lujo inmobiliario Madrid." />
        
        {/* Palabras clave estratégicas */}
        <meta name="keywords" content="lujo madrid, inmobiliaria lujo madrid, pisos lujo madrid, propiedades lujo madrid, casas lujo madrid, apartamentos lujo madrid, real estate luxury madrid, inmuebles exclusivos madrid, pisos salamanca lujo, casas chamberí lujo, inversión inmobiliaria madrid, valoración propiedades lujo madrid" />
        
        {/* Metadatos Open Graph optimizados */}
        <meta property="og:title" content="Propiedades de Lujo Madrid | #1 Inmobiliaria Premium | Goza Madrid" />
        <meta property="og:description" content="Descubra las propiedades de lujo más exclusivas de Madrid. Pisos, casas y apartamentos premium en las mejores zonas. Valoración gratuita por expertos." />
        <meta property="og:url" content="https://www.realestategozamadrid.com/propiedades-lujo" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.realestategozamadrid.com/images/lujo-madrid-hero.jpg" />
        <meta property="og:image:alt" content="Propiedades de Lujo Madrid - Inmobiliaria Premium Goza Madrid" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Goza Madrid - Propiedades de Lujo" />
        <meta property="og:locale" content="es_ES" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Propiedades de Lujo Madrid | #1 Inmobiliaria Premium" />
        <meta name="twitter:description" content="Las propiedades de lujo más exclusivas de Madrid. Pisos, casas y apartamentos premium. Valoración gratuita." />
        <meta name="twitter:image" content="https://www.realestategozamadrid.com/images/lujo-madrid-hero.jpg" />
        <meta name="twitter:site" content="@gozamadrid" />
        
        {/* Metadatos adicionales para SEO */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.realestategozamadrid.com/propiedades-lujo" />
        
        {/* Hreflang para SEO internacional */}
        <link rel="alternate" hrefLang="es" href="https://www.realestategozamadrid.com/propiedades-lujo" />
        <link rel="alternate" hrefLang="en" href="https://www.realestategozamadrid.com/en/luxury-properties" />
        <link rel="alternate" hrefLang="x-default" href="https://www.realestategozamadrid.com/propiedades-lujo" />
        
        {/* Geo tags para búsquedas locales */}
        <meta name="geo.region" content="ES-MD" />
        <meta name="geo.placename" content="Madrid" />
        <meta name="geo.position" content="40.4168;-3.7038" />
        <meta name="ICBM" content="40.4168, -3.7038" />
        
        {/* Publisher y Author */}
        <meta name="author" content="Goza Madrid - Expertos en Propiedades de Lujo" />
        <meta name="publisher" content="Goza Madrid Real Estate" />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([luxuryRealEstateSchema, breadcrumbSchema])
          }}
        />
        
        {/* Preconnect para optimización de velocidad */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </Head>
      
      <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative" itemScope itemType="https://schema.org/RealEstateAgent">
        {/* Metadatos estructurados adicionales */}
        <meta itemProp="name" content="Goza Madrid - Propiedades de Lujo" />
        <meta itemProp="description" content="Inmobiliaria especializada en propiedades de lujo en Madrid. Expertos en compra, venta y alquiler de pisos, casas y apartamentos exclusivos." />
        <meta itemProp="url" content="https://www.realestategozamadrid.com/propiedades-lujo" />
        <meta itemProp="telephone" content="+34-900-000-000" />
        <meta itemProp="email" content="info@realestategozamadrid.com" />
        
        {/* Contenido SEO invisible pero valioso */}
        <div className="sr-only">
          <h1>Propiedades de Lujo Madrid - Inmobiliaria Premium Especializada</h1>
          <p>Goza Madrid es la inmobiliaria líder en propiedades de lujo en Madrid. Ofrecemos los pisos de lujo, casas exclusivas y apartamentos premium más selectos en las mejores zonas de Madrid como Salamanca, Chamberí, Retiro y Centro. Nuestros expertos en real estate de lujo brindan servicios de valoración gratuita, compra, venta y alquiler de inmuebles exclusivos. Con más de 15 años de experiencia en el mercado inmobiliario de lujo madrileño, garantizamos el máximo valor para su inversión inmobiliaria.</p>
        </div>
        
        <HeaderLanding />
        
        {/* Sección Hero optimizada para SEO */}
        <section className="relative" itemScope itemType="https://schema.org/Service">
          <meta itemProp="name" content="Propiedades de Lujo Madrid" />
          <meta itemProp="description" content="Servicios especializados en propiedades de lujo en Madrid" />
          <meta itemProp="serviceType" content="Real Estate Luxury Services" />
          <meta itemProp="areaServed" content="Madrid, España" />
          
          {/* Encabezados optimizados para palabras clave */}
          <div className="hidden">
            <h1 className="text-5xl font-bold">Propiedades de Lujo Madrid | Inmobiliaria Premium #1</h1>
            <h2 className="text-3xl">Pisos de Lujo Madrid - Casas Exclusivas - Apartamentos Premium</h2>
            <h3 className="text-2xl">Real Estate Luxury Madrid | Inversión Inmobiliaria de Lujo</h3>
          </div>
        </section>
        
        {/* Sección de Valor Único */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          itemScope
          itemType="https://schema.org/Service"
        >
          <meta itemProp="name" content="Servicios de Lujo Inmobiliario Madrid" />
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
        
        {/* CTA Banner con contenido SEO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 py-8 px-4 text-center shadow-2xl relative overflow-hidden"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <meta itemProp="name" content="Valoración Gratuita Propiedades de Lujo Madrid" />
          <meta itemProp="description" content="Valoración profesional gratuita de su propiedad de lujo en Madrid" />
          <meta itemProp="price" content="0" />
          <meta itemProp="priceCurrency" content="EUR" />
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white"></div>
          </div>
          
          <div className="container mx-auto relative z-10">
            <h3 className="text-black text-2xl md:text-3xl font-bold mb-5" itemProp="name">
              ¿Quiere saber cuánto vale su propiedad de lujo en Madrid?
            </h3>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">
              Nuestros expertos en inmobiliaria de lujo Madrid realizarán una valoración detallada basada en el mercado actual de propiedades premium y las características únicas de su inmueble exclusivo
            </p>
            <a 
              href={valorationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105"
              itemProp="url"
            >
              Solicite su Valoración Gratuita de Lujo Ahora
            </a>
          </div>
        </motion.div>
        
        {/* Testimonios */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          itemScope
          itemType="https://schema.org/Organization"
        >
          <meta itemProp="name" content="Testimonios Clientes Lujo Madrid" />
          <Testimonios />
          
          <div className="text-center pb-12 pt-4">
            <div className="max-w-xl mx-auto bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl px-6 py-8 shadow-lg border border-yellow-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 mb-5 text-lg">
                Nuestros clientes confían en nuestras valoraciones profesionales de propiedades de lujo y servicio personalizado en Madrid
              </p>
              <a 
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-md transform hover:scale-105"
              >
                Solicitar Valoración Propiedades de Lujo
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
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <meta itemProp="name" content="Galería Propiedades de Lujo Madrid" />
          <meta itemProp="description" content="Selección exclusiva de propiedades de lujo disponibles en Madrid" />
          <GaleriaPropiedades />
        </motion.section>
        
        {/* Formulario de Contacto */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-gray-50"
          itemScope
          itemType="https://schema.org/ContactPage"
        >
          <meta itemProp="name" content="Contacto Inmobiliaria Lujo Madrid" />
          <FormularioContacto />
        </motion.section>
        
        {/* Sobre Nosotros */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          itemScope
          itemType="https://schema.org/AboutPage"
        >
          <meta itemProp="name" content="Sobre Goza Madrid - Expertos en Lujo Inmobiliario" />
          <SobreNosotros />
        </motion.section>
        
        {/* CTA Banner final optimizado para SEO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-4 text-center relative overflow-hidden"
          itemScope
          itemType="https://schema.org/CallToAction"
        >
          <meta itemProp="name" content="Contactar Expertos Propiedades Lujo Madrid" />
          
          {/* Contenido SEO enriquecido */}
          <div className="container mx-auto relative z-10 max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Su Próxima Propiedad de Lujo en Madrid le Espera
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubra la excelencia en el mercado inmobiliario de lujo madrileño. Desde pisos exclusivos en Salamanca hasta casas de lujo en Chamberí, nuestros expertos le guiarán hacia la inversión inmobiliaria perfecta.
            </p>
            
            {/* Lista de beneficios SEO */}
            <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-yellow-500/20">
                <h3 className="text-yellow-400 font-bold text-lg mb-3">Propiedades Exclusivas</h3>
                <p className="text-gray-300">Acceso a las propiedades de lujo más selectas de Madrid, no disponibles en portales convencionales.</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-yellow-500/20">
                <h3 className="text-yellow-400 font-bold text-lg mb-3">Expertos en Lujo</h3>
                <p className="text-gray-300">+15 años especializados en el mercado inmobiliario de lujo madrileño y inversiones premium.</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-yellow-500/20">
                <h3 className="text-yellow-400 font-bold text-lg mb-3">Servicio Personalizado</h3>
                <p className="text-gray-300">Atención VIP y asesoramiento personalizado para cada cliente e inversión inmobiliaria.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-xl transform hover:scale-105 inline-block"
                itemProp="url"
              >
                Valoración Gratuita de Lujo
              </a>
              <Link href="/contacto">
                <button className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-full font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-xl transform hover:scale-105">
                  Contactar Expertos en Lujo
                </button>
              </Link>
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-yellow-500"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-yellow-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-yellow-400"></div>
          </div>
        </motion.div>

        <FooterLanding />

        {/* Elementos flotantes y popups */}
        <AnimatePresence>
          {showFloatingButton && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <a
                href={valorationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-110 font-bold text-sm flex items-center gap-2 border-2 border-yellow-400"
                title="Valoración Gratuita Propiedades de Lujo"
              >
                <span>💎</span>
                Valoración de Lujo
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup de captura de leads */}
        <PopupLead 
          show={showPopup} 
          onMinimize={minimizePopup}
          isMinimized={isPopupMinimized}
          onMaximize={maximizePopup}
        />
        
        {/* Indicador minimizado del popup */}
        {isPopupMinimized && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed bottom-24 right-6 z-30"
          >
            <button
              onClick={maximizePopup}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-full shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 font-semibold text-sm flex items-center gap-2"
              title="Obtener Valoración Gratuita"
            >
              <span>✨</span>
              <span className="hidden sm:inline">Valoración</span>
            </button>
          </motion.div>
        )}
      </article>
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
