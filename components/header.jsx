"use client";
import { usePathname } from 'next/navigation';
import Image from "next/legacy/image";
import Link from "next/link";
import Head from 'next/head';
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavbar } from './context/navBarContext';
import { 
  FaFacebook, 
  FaInstagram, 
  FaPhone, 

  FaTimes, 
  FaChevronDown, 
  FaChevronRight,
  FaHome,
  
  FaHandshake,
  FaChartLine,
  FaEllipsisH,
 
  FaCalculator
} from "react-icons/fa";

// Componente para renderizar iconos - Con nombre explícito para Fast Refresh
function MenuIcon({ icon: Icon, ...props }) {
  if (!Icon) return null;
  return <Icon {...props} />;
}

// SEO Schema.org optimizado - Movido fuera del componente para evitar re-renders
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Goza Madrid - Agencia Inmobiliaria",
  "alternateName": "GozaMadrid",
  "url": "https://realestategozamadrid.com",
  "logo": "https://realestategozamadrid.com/api/images/logonuevo.png",
  "image": "https://realestategozamadrid.com/api/images/logonuevo.png",
  "sameAs": [
    "https://www.facebook.com/GozaMadridAI",
    "https://www.instagram.com/Gozamadrid54"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle de Alcalá, 96",
    "addressLocality": "Madrid",
    "addressRegion": "Comunidad de Madrid",
    "postalCode": "28009",
    "addressCountry": "ES"
  },
  "telephone": ["+34608136529", "+34919012103"],
  "email": "info@realestategozamadrid.com",
  "description": "Agencia inmobiliaria especializada en Madrid, ofreciendo servicios profesionales de compra, venta y alquiler de propiedades residenciales y comerciales.",
  "areaServed": [
    {
      "@type": "City",
      "name": "Madrid",
      "addressCountry": "ES"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Comunidad de Madrid",
      "addressCountry": "ES"
    }
  ],
  "openingHours": ["Mo-Fr 09:00-20:00", "Sa 10:00-18:00"],
  "priceRange": "€€€",
  "serviceType": ["Real Estate Sales", "Real Estate Rental", "Property Management", "Real Estate Consultation"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Propiedades Disponibles",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Venta de Propiedades",
          "description": "Servicios profesionales de venta de propiedades en Madrid"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Alquiler de Propiedades",
          "description": "Gestión y alquiler de propiedades residenciales y comerciales"
        }
      }
    ]
  }
};

// Rutas estáticas para evitar re-renders
const ROUTES = {
  residentes_espana: "/servicios/residentes-espana",
  residentes_espana_alquiler: "/servicios/residentes-espana/alquiler",
  residentes_espana_guia: "/servicios/residentes-espana/guia-compra",
  residentes_extranjero: "/servicios/residentes-extranjero",
  residentes_extranjero_impuesto: "/servicios/residentes-extranjero/impuesto-renta",
  residentes_extranjero_guia: "/servicios/residentes-extranjero/guia-compra"
};

// Componente principal con nombre explícito
function ControlMenu() {
  const [mounted, setMounted] = useState(false);
  const { menuVisible, toggleMenu, dropdownVisible, toggleDropdown } = useNavbar();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const venderRef = useRef(null);
  const [previousPath, setPreviousPath] = useState(pathname);
  const [focusedElement, setFocusedElement] = useState(null);
  
  // Referencias para manejar timeouts de hover
  const hoverTimeouts = useRef({
    vender: null,
    servicios: null
  });

  // Memoización del schema para evitar recalculos
  const memoizedSchema = useMemo(() => {
    try {
      return JSON.stringify(ORGANIZATION_SCHEMA);
    } catch (e) {
      console.error("Error serializando ORGANIZATION_SCHEMA:", e);
      return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Goza Madrid",
        "url": "https://realestategozamadrid.com"
      });
    }
  }, []);

  // Efecto para manejo de rutas
  useEffect(() => {
    if (previousPath !== pathname) {
      setPreviousPath(pathname);
      // Si el menú está visible en móvil cuando cambia la ruta, cerrarlo
      if (menuVisible && typeof window !== 'undefined' && window.innerWidth < 1024) {
        toggleMenu();
      }
    }
  }, [pathname, previousPath, menuVisible, toggleMenu]);

  // Efecto para marcar como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Intersection Observer para animaciones
  useEffect(() => {
    if (!venderRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    observer.observe(venderRef.current);
    return () => observer.disconnect();
  }, []);

  // Manejo de teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuVisible) {
        toggleMenu();
      }
      if (e.key === 'Tab') {
        // Gestión del foco para accesibilidad
        setFocusedElement(document.activeElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuVisible, toggleMenu]);

  // Función mejorada para manejar hover de entrada
  const handleMouseEnter = useCallback((key) => {
    // Limpiar cualquier timeout pendiente
    if (hoverTimeouts.current[key]) {
      clearTimeout(hoverTimeouts.current[key]);
      hoverTimeouts.current[key] = null;
    }
    // Mostrar dropdown inmediatamente
    toggleDropdown(key, true);
  }, [toggleDropdown]);

  // Función mejorada para manejar hover de salida
  const handleMouseLeave = useCallback((key) => {
    // Añadir un pequeño retraso antes de cerrar
    hoverTimeouts.current[key] = setTimeout(() => {
      toggleDropdown(key, false);
      hoverTimeouts.current[key] = null;
    }, 150); // 150ms de retraso
  }, [toggleDropdown]);

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(hoverTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        {/* Preloads optimizados */}
        <link 
          rel="preload" 
          href="/api/images/logonuevo.png" 
          as="image" 
          type="image/png"
          fetchpriority="high"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        
        {/* Meta tags SEO optimizados */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Schema.org optimizado */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: memoizedSchema
          }}
        />
        
        {/* Breadcrumb Schema cuando sea apropiado */}
        {pathname !== '/' && (
          <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Inicio",
                    "item": "https://realestategozamadrid.com"
                  },
                  {
                    "@type": "ListItem", 
                    "position": 2,
                    "name": pathname.split('/').pop()?.replace(/-/g, ' ') || "Página actual",
                    "item": `https://realestategozamadrid.com${pathname}`
                  }
                ]
              })
            }}
          />
        )}
      </Head>

      <header 
        className={`w-full z-[9999] ${isHomePage ? 'absolute top-0 left-0' : 'relative'}`}
        role="banner"
        aria-label="Navegación principal de Goza Madrid"
      >
        {/* Gradiente de integración más sutil para mostrar el video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent pointer-events-none" aria-hidden="true"></div>
        
        {/* Botón de menú para móviles - Mejorado para accesibilidad */}
        {!menuVisible && (
          <div className="lg:hidden fixed right-4 top-4 z-[9999] text-white">
            <button 
              onClick={toggleMenu} 
              className="text-white hover:text-amarillo focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 flex items-center justify-center bg-black/30 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-amarillo/30 transition-all duration-300 border border-white/10"
              aria-expanded={menuVisible}
              aria-controls="mobile-menu"
              aria-label={menuVisible ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              type="button"
            >
              {menuVisible ? <FaTimes size={24} aria-hidden="true" /> : <FaEllipsisH size={24} aria-hidden="true" />}
            </button>
          </div>
        )}

        {/* Menú Principal Desktop - Diseño Ultra Premium con Backdrop Blur */}
        <nav 
          className={`${isHomePage ? 'mt-8 mb-0' : 'mb-8'} relative flex-col items-center px-16 py-8 w-max mx-auto rounded-2xl shadow-2xl hidden lg:flex backdrop-blur-2xl border-2 ${
            isHomePage 
              ? 'shadow-xl' 
              : 'shadow-2xl'
          } relative overflow-visible`}
          role="navigation"
          aria-label="Menú principal de navegación"
          style={{
            zIndex: 50,
            background: `linear-gradient(135deg, 
              rgba(0, 0, 0, 0.4) 0%, 
              rgba(30, 30, 30, 0.5) 25%,
              rgba(45, 45, 45, 0.4) 50%, 
              rgba(30, 30, 30, 0.5) 75%,
              rgba(0, 0, 0, 0.4) 100%)`,
            borderColor: 'rgba(255, 215, 0, 0.8)',
            borderWidth: '3px',
            borderStyle: 'solid',
            boxShadow: `
              0 0 40px rgba(255, 215, 0, 0.4),
              0 0 80px rgba(255, 215, 0, 0.2),
              inset 0 0 60px rgba(255, 215, 0, 0.1),
              0 10px 40px rgba(0, 0, 0, 0.3)`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
        >
          {/* Efecto de brillo interno premium más sutil */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at center top, 
                rgba(255, 215, 0, 0.1) 0%, 
                rgba(255, 223, 0, 0.05) 30%, 
                rgba(255, 215, 0, 0.02) 50%,
                transparent 70%)`
            }}
            aria-hidden="true"
          ></div>

          {/* Líneas decorativas doradas */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 opacity-60"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 215, 0, 0.8) 25%, 
                rgba(255, 223, 0, 1) 50%, 
                rgba(255, 215, 0, 0.8) 75%, 
                transparent 100%)`
            }}
            aria-hidden="true"
          ></div>

          {/* Redes sociales y teléfono - Ultra Premium */}
          <div className="absolute top-8 right-16 flex space-x-8 mt-2 mr-2" role="complementary" aria-label="Información de contacto y redes sociales">
            <Link 
              href="https://www.facebook.com/GozaMadridAI" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visitar nuestra página de Facebook (se abre en nueva ventana)"
              title="Facebook - Goza Madrid Inmobiliaria"
              className="hover:scale-125 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-full p-2 hover:shadow-2xl"
              style={{
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FaFacebook size={32} className="text-blue-400 hover:text-blue-300 drop-shadow-xl" aria-hidden="true" />
            </Link>
            <Link 
              href="https://www.instagram.com/Gozamadrid54" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visitar nuestro perfil de Instagram (se abre en nueva ventana)"
              title="Instagram - Goza Madrid Inmobiliaria"
              className="hover:scale-125 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-full p-2 hover:shadow-2xl"
              style={{
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
              }}
            >
              <FaInstagram size={32} className="text-pink-400 hover:text-pink-300 drop-shadow-xl" aria-hidden="true" />
            </Link>
            <a 
              href="tel:+34608136529" 
              className="flex items-center space-x-4 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-full px-6 py-3 border-2" 
              aria-label="Llamar al teléfono +34 608 136 529"
              title="Llamar ahora - Goza Madrid"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.8) 0%, 
                  rgba(30, 30, 30, 0.9) 100%)`,
                borderColor: 'rgba(255, 215, 0, 0.8)',
                boxShadow: `
                  0 0 30px rgba(255, 215, 0, 0.4),
                  inset 0 0 20px rgba(255, 215, 0, 0.1)`
              }}
            >
              <FaPhone size={28} className="text-yellow-400 hover:text-yellow-300 drop-shadow-xl" aria-hidden="true" />
              <span 
                className="text-yellow-100 hover:text-white text-2xl font-bold tracking-wide"
                style={{
                  textShadow: '0 0 15px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)'
                }}
              >
                +34 608 136 529
              </span>
            </a>
          </div>

          {/* Logo - Marco dorado ultra premium */}
          <div className="relative mb-6">
            <div 
              className="absolute inset-0 rounded-full border-4 shadow-2xl"
              style={{
                borderColor: 'rgba(255, 215, 0, 0.9)',
                background: `radial-gradient(circle, 
                  rgba(255, 215, 0, 0.15) 0%, 
                  rgba(255, 223, 0, 0.1) 30%, 
                  rgba(255, 215, 0, 0.05) 60%, 
                  transparent 100%)`,
                boxShadow: `
                  0 0 50px rgba(255, 215, 0, 0.5),
                  inset 0 0 30px rgba(255, 215, 0, 0.2),
                  0 0 100px rgba(255, 215, 0, 0.2)`
              }}
              aria-hidden="true"
            ></div>
            <Link 
              href="/" 
              aria-label="Ir a la página principal de Goza Madrid Inmobiliaria"
              title="Goza Madrid - Inicio"
              className="focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-full relative z-10 block"
            >
              <Image 
                src="/api/images/logonuevo.png" 
                alt="Goza Madrid - Agencia Inmobiliaria en Madrid, especialistas en compra, venta y alquiler de propiedades" 
                width={160} 
                height={160} 
                layout="intrinsic"
                className="relative z-10 m-0 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                priority
                loading="eager"
              />
            </Link>
          </div>

          {/* Enlaces de navegación principales - Texto ultra legible */}
          <div 
            className="flex items-center space-x-12 text-2xl font-bold tracking-wide" 
            role="menubar"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            <Link 
              href="/" 
              className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative"
              role="menuitem"
              title="Página principal - Goza Madrid"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                background: `linear-gradient(135deg, 
                  rgba(255, 215, 0, 0.1) 0%, 
                  rgba(255, 223, 0, 0.05) 100%)`,
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}
            >
              Inicio
            </Link>

            <Link 
              href="/vender/comprar" 
              className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative"
              role="menuitem"
              title="Catálogo de propiedades en Madrid"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                background: `linear-gradient(135deg, 
                  rgba(255, 215, 0, 0.1) 0%, 
                  rgba(255, 223, 0, 0.05) 100%)`,
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}
            >
              Propiedades
            </Link>

            {/* Servicios de Venta - Ultra Premium */}
            <div
              ref={venderRef}
              className="relative whitespace-nowrap group"
              onMouseEnter={() => handleMouseEnter('vender')}
              onMouseLeave={() => handleMouseLeave('vender')}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={dropdownVisible.vender}
              style={{ position: 'relative' }}
            >
              <Link 
                href="/vender" 
                className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative flex items-center gap-3"
                title="Servicios de venta de propiedades"
                style={{
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                  background: `linear-gradient(135deg, 
                    rgba(255, 215, 0, 0.1) 0%, 
                    rgba(255, 223, 0, 0.05) 100%)`,
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                }}
              >
                Vende tu propiedad
                <FaChevronDown
                  className={`transition-all duration-300 text-yellow-400 drop-shadow-lg ${dropdownVisible.vender ? 'rotate-180 text-yellow-300' : ''}`}
                  aria-hidden="true"
                />
              </Link>
              {dropdownVisible.vender && (
                <>
                  {/* Portal para el dropdown que aparece fuera del contenedor */}
                  <div 
                    className="fixed inset-0 pointer-events-none"
                    style={{ zIndex: 999999 }}
                  >
                    <div
                      className="absolute backdrop-blur-3xl rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold border-2 pointer-events-auto"
                      style={{
                        top: `calc(${venderRef.current?.getBoundingClientRect().bottom || 0}px + 20px)`,
                        left: `calc(${venderRef.current?.getBoundingClientRect().left || 0}px + ${venderRef.current?.getBoundingClientRect().width || 0}px / 2)`,
                        transform: "translateX(-50%)",
                        minWidth: "450px",
                        zIndex: 999999,
                        background: `linear-gradient(135deg, 
                          rgba(0, 0, 0, 0.98) 0%, 
                          rgba(30, 30, 30, 0.99) 50%,
                          rgba(0, 0, 0, 0.98) 100%)`,
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        boxShadow: `
                          0 25px 60px rgba(0, 0, 0, 0.8),
                          0 0 50px rgba(255, 215, 0, 0.4),
                          inset 0 0 30px rgba(255, 215, 0, 0.1)`
                      }}
                      role="menu"
                      aria-label="Servicios de venta inmobiliaria"
                    >
                      <Link
                        href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                        className="flex items-center px-8 py-5 text-yellow-200 hover:text-white hover:scale-105 focus:outline-none transition-all duration-300 rounded-xl mx-2 my-2"
                        role="menuitem"
                        title="Valoración gratuita de tu propiedad"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textShadow: '0 0 15px rgba(255, 215, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8)',
                          background: `linear-gradient(135deg, 
                            rgba(255, 215, 0, 0.1) 0%, 
                            rgba(255, 223, 0, 0.05) 100%)`,
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                        }}
                      >
                        <MenuIcon icon={FaCalculator} className="mr-4 text-yellow-400 text-3xl drop-shadow-xl" aria-hidden="true" />
                        Valoración gratuita
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link 
              href="/reformas" 
              className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative whitespace-nowrap"
              role="menuitem"
              title="Servicios de reformas inmobiliarias"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                background: `linear-gradient(135deg, 
                  rgba(255, 215, 0, 0.1) 0%, 
                  rgba(255, 223, 0, 0.05) 100%)`,
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}
            >
              Reformas
            </Link>

            {/* Servicios con submenú ultra premium */}
            <div 
              className="relative group/servicios"
              onMouseEnter={() => handleMouseEnter('servicios')}
              onMouseLeave={() => handleMouseLeave('servicios')}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={dropdownVisible.servicios}
              style={{ position: 'relative' }}
            >
              <div className="flex items-center gap-3">
                <Link
                  href="/servicios"
                  className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative"
                  onClick={(e) => e.stopPropagation()}
                  title="Servicios inmobiliarios especializados"
                  style={{
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                    background: `linear-gradient(135deg, 
                      rgba(255, 215, 0, 0.1) 0%, 
                      rgba(255, 223, 0, 0.05) 100%)`,
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                  }}
                >
                  Servicios
                </Link>
                <FaChevronDown
                  className={`transition-all duration-300 text-yellow-400 drop-shadow-lg ${dropdownVisible.servicios ? 'rotate-180 text-yellow-300' : ''}`}
                  aria-hidden="true"
                />
              </div>
              {dropdownVisible.servicios && (
                <>
                  {/* Portal para el dropdown que aparece fuera del contenedor */}
                  <div 
                    className="fixed inset-0 pointer-events-none"
                    style={{ zIndex: 999999 }}
                  >
                    <div 
                      className="absolute backdrop-blur-3xl rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold border-2 pointer-events-auto"
                      style={{
                        top: `calc(${venderRef.current?.getBoundingClientRect().bottom || 0}px + 20px)`,
                        left: "50%",
                        transform: "translateX(-50%)",
                        minWidth: "500px",
                        zIndex: 999999,
                        background: `linear-gradient(135deg, 
                          rgba(0, 0, 0, 0.98) 0%, 
                          rgba(30, 30, 30, 0.99) 50%,
                          rgba(0, 0, 0, 0.98) 100%)`,
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        boxShadow: `
                          0 25px 60px rgba(0, 0, 0, 0.8),
                          0 0 50px rgba(255, 215, 0, 0.4),
                          inset 0 0 30px rgba(255, 215, 0, 0.1)`
                      }}
                      onMouseLeave={() => handleMouseLeave('servicios')}
                      role="menu"
                      aria-label="Servicios inmobiliarios"
                    >
                      <div className="relative group/espana">
                        <Link
                          href={ROUTES.residentes_espana}
                          className="w-full flex items-center justify-between px-8 py-5 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 border-b border-yellow-400/30 rounded-t-xl mx-2 mt-2"
                          style={{
                            textShadow: '0 0 15px rgba(255, 215, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8)',
                            background: `linear-gradient(135deg, 
                              rgba(255, 215, 0, 0.1) 0%, 
                              rgba(255, 223, 0, 0.05) 100%)`,
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                          }}
                        >
                          <div className="flex items-center">
                            <MenuIcon icon={FaHandshake} className="mr-4 text-yellow-400 text-3xl drop-shadow-xl" />
                            Residentes en España
                          </div>
                          <MenuIcon icon={FaChevronRight} className="ml-3 group-hover/espana:rotate-90 transition-transform duration-200 text-yellow-400 drop-shadow-lg" />
                        </Link>

                        {/* Submenú de España con portal */}
                        <div className="absolute left-full top-0 hidden group-hover/espana:block pointer-events-none" style={{ zIndex: 999999 }}>
                          <div className="pointer-events-auto backdrop-blur-3xl rounded-2xl shadow-2xl min-w-[350px] border-2 ml-2"
                            style={{
                              zIndex: 999999,
                              background: `linear-gradient(135deg, 
                                rgba(0, 0, 0, 0.98) 0%, 
                                rgba(30, 30, 30, 0.99) 100%)`,
                              borderColor: 'rgba(255, 215, 0, 0.8)',
                              boxShadow: `
                                0 25px 60px rgba(0, 0, 0, 0.8),
                                0 0 50px rgba(255, 215, 0, 0.4)`
                            }}
                          >
                            <Link
                              href={ROUTES.residentes_espana_alquiler}
                              className="flex items-center px-6 py-4 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 border-b border-yellow-400/30 rounded-t-xl mx-1 mt-1"
                              style={{
                                textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)',
                                background: `linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.08) 0%, 
                                  rgba(255, 223, 0, 0.04) 100%)`,
                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'
                              }}
                            >
                              <MenuIcon icon={FaHome} className="mr-3 text-yellow-400 text-2xl drop-shadow-lg" />
                              Alquiler
                            </Link>
                            <Link
                              href={ROUTES.residentes_espana_guia}
                              className="flex items-center px-6 py-4 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 rounded-b-xl mx-1 mb-1"
                              style={{
                                textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)',
                                background: `linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.08) 0%, 
                                  rgba(255, 223, 0, 0.04) 100%)`,
                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'
                              }}
                            >
                              <MenuIcon icon={FaHandshake} className="mr-3 text-yellow-400 text-2xl drop-shadow-lg" />
                              Guía de compra
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="relative group/extranjero">
                        <Link
                          href={ROUTES.residentes_extranjero}
                          className="w-full flex items-center justify-between px-8 py-5 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 rounded-b-xl mx-2 mb-2"
                          style={{
                            textShadow: '0 0 15px rgba(255, 215, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8)',
                            background: `linear-gradient(135deg, 
                              rgba(255, 215, 0, 0.1) 0%, 
                              rgba(255, 223, 0, 0.05) 100%)`,
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                          }}
                        >
                          <div className="flex items-center">
                            <MenuIcon icon={FaChartLine} className="mr-4 text-yellow-400 text-3xl drop-shadow-xl" />
                            Residentes en el extranjero
                          </div>
                          <MenuIcon icon={FaChevronRight} className="ml-3 group-hover/extranjero:rotate-90 transition-transform duration-200 text-yellow-400 drop-shadow-lg" />
                        </Link>

                        {/* Submenú de Extranjero con portal */}
                        <div className="absolute left-full top-0 hidden group-hover/extranjero:block pointer-events-none" style={{ zIndex: 999999 }}>
                          <div className="pointer-events-auto backdrop-blur-3xl rounded-2xl shadow-2xl min-w-[350px] border-2 ml-2"
                            style={{
                              zIndex: 999999,
                              background: `linear-gradient(135deg, 
                                rgba(0, 0, 0, 0.98) 0%, 
                                rgba(30, 30, 30, 0.99) 100%)`,
                              borderColor: 'rgba(255, 215, 0, 0.8)',
                              boxShadow: `
                                0 25px 60px rgba(0, 0, 0, 0.8),
                                0 0 50px rgba(255, 215, 0, 0.4)`
                            }}
                          >
                            <Link
                              href={ROUTES.residentes_extranjero_impuesto}
                              className="flex items-center px-6 py-4 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 border-b border-yellow-400/30 rounded-t-xl mx-1 mt-1"
                              style={{
                                textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)',
                                background: `linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.08) 0%, 
                                  rgba(255, 223, 0, 0.04) 100%)`,
                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'
                              }}
                            >
                              <MenuIcon icon={FaChartLine} className="mr-3 text-yellow-400 text-2xl drop-shadow-lg" />
                              Impuesto no residentes
                            </Link>
                            <Link
                              href={ROUTES.residentes_extranjero_guia}
                              className="flex items-center px-6 py-4 text-yellow-200 hover:text-white hover:scale-105 transition-all duration-300 rounded-b-xl mx-1 mb-1"
                              style={{
                                textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)',
                                background: `linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.08) 0%, 
                                  rgba(255, 223, 0, 0.04) 100%)`,
                                border: '1px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'
                              }}
                            >
                              <MenuIcon icon={FaHandshake} className="mr-3 text-yellow-400 text-2xl drop-shadow-lg" />
                              Guía de compra
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link 
              href="/contacto" 
              className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative" 
              role="menuitem" 
              title="Contacto - Goza Madrid Inmobiliaria"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                background: `linear-gradient(135deg, 
                  rgba(255, 215, 0, 0.1) 0%, 
                  rgba(255, 223, 0, 0.05) 100%)`,
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}
            >
              Contacto
            </Link>

            <Link 
              href="/blog" 
              className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-110 relative"
              role="menuitem"
              title="Blog inmobiliario - Consejos y noticias"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)',
                background: `linear-gradient(135deg, 
                  rgba(255, 215, 0, 0.1) 0%, 
                  rgba(255, 223, 0, 0.05) 100%)`,
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}
            >
              Blog
            </Link>
          </div>
        </nav>

        {/* Menú móvil ultra premium */}
        <div 
          id="mobile-menu"
          className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-300 ease-in-out ${
            menuVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{
            background: menuVisible ? 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(30, 30, 30, 0.9) 100%)' : 'transparent'
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación móvil"
          aria-hidden={!menuVisible}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleMenu();
            }
          }}
        >
          <div 
            className={`w-96 max-h-screen shadow-2xl flex flex-col p-8 fixed top-0 right-0 h-full transition-all duration-300 ease-in-out transform ${
              menuVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } backdrop-blur-3xl border-l-4`}
            style={{
              background: `linear-gradient(160deg, 
                rgba(0, 0, 0, 0.95) 0%, 
                rgba(30, 30, 30, 0.98) 50%,
                rgba(0, 0, 0, 0.95) 100%)`,
              borderColor: 'rgba(255, 215, 0, 0.8)',
              boxShadow: `
                -30px 0 60px rgba(0, 0, 0, 0.5),
                0 0 50px rgba(255, 215, 0, 0.3),
                inset 2px 0 20px rgba(255, 215, 0, 0.1)`
            }}
            role="navigation"
            aria-label="Menú de navegación móvil"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="text-center">
                <Link 
                  href="/" 
                  className="inline-block focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-full" 
                  aria-label="Ir a la página principal de Goza Madrid"
                  title="Goza Madrid - Inicio"
                  onClick={() => toggleMenu()}
                >
                  <div 
                    className="p-3 rounded-full border-3"
                    style={{
                      background: `radial-gradient(circle, 
                        rgba(255, 215, 0, 0.15) 0%, 
                        rgba(255, 223, 0, 0.1) 50%, 
                        transparent 100%)`,
                      borderColor: 'rgba(255, 215, 0, 0.8)',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
                    }}
                  >
                    <Image 
                      src="/api/images/logonuevo.png" 
                      alt="Goza Madrid - Logo" 
                      width={100} 
                      height={100} 
                      layout="intrinsic" 
                      loading="lazy"
                      className="drop-shadow-2xl"
                    />
                  </div>
                </Link>
              </div>
              <button 
                onClick={toggleMenu} 
                className="text-yellow-200 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 backdrop-blur-sm p-4 rounded-full transition-all duration-300 border-2"
                aria-label="Cerrar menú de navegación"
                type="button"
                style={{
                  background: `radial-gradient(circle, 
                    rgba(255, 215, 0, 0.1) 0%, 
                    rgba(255, 223, 0, 0.05) 100%)`,
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                  boxShadow: '0 0 25px rgba(255, 215, 0, 0.3)'
                }}
              >
                <FaTimes size={28} aria-hidden="true" className="drop-shadow-xl" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6 text-xl font-bold" role="menu">
              <Link 
                href="/" 
                className="text-yellow-200 hover:text-white focus:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg px-6 py-4 transition-all duration-300 hover:scale-105"
                role="menuitem"
                title="Página principal"
                onClick={() => toggleMenu()}
                style={{
                  textShadow: '0 0 15px rgba(255, 215, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.8)',
                  background: `linear-gradient(135deg, 
                    rgba(255, 215, 0, 0.1) 0%, 
                    rgba(255, 223, 0, 0.05) 100%)`,
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                }}
              >
                Inicio
              </Link>

              {/* COMPRAR PROPIEDADES DESTACADO EN MÓVIL - Ultra Premium */}
              <Link 
                href="/vender/comprar" 
                className="text-black font-bold px-8 py-5 rounded-2xl shadow-2xl transition-all duration-300 text-center hover:scale-105 border-3"
                role="menuitem"
                title="Comprar propiedades - Servicio destacado"
                onClick={() => toggleMenu()}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 215, 0, 1) 0%, 
                    rgba(255, 223, 0, 0.95) 25%,
                    rgba(255, 235, 59, 0.9) 50%, 
                    rgba(255, 223, 0, 0.95) 75%,
                    rgba(255, 215, 0, 1) 100%)`,
                  borderColor: 'rgba(180, 83, 9, 0.8)',
                  boxShadow: `
                    0 15px 40px rgba(255, 215, 0, 0.4),
                    inset 0 2px 10px rgba(255, 235, 59, 0.3),
                    0 0 30px rgba(255, 215, 0, 0.2)`,
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              >
                🏠 Comprar Propiedades
              </Link>
              
              {/* Vende tu propiedad móvil optimizado */}
              <div className="relative whitespace-nowrap flex flex-col" role="menuitem">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/vender" 
                    className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 flex-1"
                    title="Servicios de venta de propiedades"
                    onClick={() => toggleMenu()}
                  >
                    Vende tu propiedad
                  </Link>
                  <button
                    onClick={() => handleMouseEnter('vender')}
                    className="ml-2 text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded p-1 transition-all duration-200"
                    aria-expanded={dropdownVisible.vender}
                    aria-label={dropdownVisible.vender ? "Ocultar opciones de venta" : "Mostrar opciones de venta"}
                    type="button"
                  >
                    <FaChevronDown
                      className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`}
                      size={20}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                
                {dropdownVisible.vender && (
                  <div className="ml-4 mt-2" role="menu" aria-label="Opciones de venta">
                    <Link
                      href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                      className="flex items-center px-4 py-3 text-white hover:bg-white/10 focus:bg-white/20 focus:outline-none transition-colors duration-200 rounded-lg"
                      role="menuitem"
                      title="Valoración gratuita de tu propiedad"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => toggleMenu()}
                    >
                      <MenuIcon icon={FaCalculator} className="mr-2 text-amarillo" aria-hidden="true" />
                      Valoración gratuita
                    </Link>
                  </div>
                )}
              </div>

             

              {/* eXp Realty - COMENTADO TEMPORALMENTE
              <Link 
                href="/exp-realty" 
                className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                role="menuitem"
                title="eXp Realty - Red inmobiliaria global"
                onClick={() => handleMenuToggle()}
              >
                eXp Realty
              </Link>
              */}
              
              <Link 
                href="/reformas" 
                className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                role="menuitem"
                title="Servicios de reformas"
                onClick={() => toggleMenu()}
              >
                Reformas
              </Link>
              
              {/* Servicios móvil optimizado */}
              <div className="relative whitespace-nowrap flex flex-col" role="menuitem">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/servicios" 
                    className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 flex-1"
                    title="Servicios inmobiliarios"
                    onClick={() => toggleMenu()}
                  >
                    Servicios
                  </Link>
                  <button
                    onClick={() => handleMouseEnter('servicios')}
                    className="ml-2 text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded p-1 transition-all duration-200"
                    aria-expanded={dropdownVisible.servicios}
                    aria-label={dropdownVisible.servicios ? "Ocultar servicios" : "Mostrar servicios"}
                    type="button"
                  >
                    <FaChevronDown
                      className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                      size={20}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                
                {dropdownVisible.servicios && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2" role="menu" aria-label="Servicios disponibles">
                    <Link
                      href={ROUTES.residentes_espana}
                      className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 flex items-center"
                      role="menuitem"
                      title="Servicios para residentes en España"
                      onClick={() => toggleMenu()}
                    >
                      <MenuIcon icon={FaHandshake} className="mr-2 text-amarillo" aria-hidden="true" />
                      Residentes en España
                    </Link>
                    <Link
                      href={ROUTES.residentes_extranjero}
                      className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 flex items-center"
                      role="menuitem"
                      title="Servicios para residentes en el extranjero"
                      onClick={() => toggleMenu()}
                    >
                      <MenuIcon icon={FaChartLine} className="mr-2 text-amarillo" aria-hidden="true" />
                      Residentes en el extranjero
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                href="/contacto" 
                className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                role="menuitem"
                title="Contacto"
                onClick={() => toggleMenu()}
              >
                Contacto
              </Link>

              {/* Información de contacto en móvil */}
              <div className="mt-8 pt-4 border-t border-white/20" role="complementary" aria-label="Información de contacto">
                <div className="flex flex-col space-y-3">
                  <a 
                    href="tel:+34608136529" 
                    className="flex items-center space-x-3 text-white hover:text-amarillo focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200" 
                    aria-label="Llamar al teléfono"
                    title="Llamar ahora"
                  >
                    <FaPhone size={20} className="text-amarillo" aria-hidden="true" />
                    <span className="text-lg">+34 608 136 529</span>
                  </a>
                  
                  <div className="flex space-x-4 mt-2">
                    <Link 
                      href="https://www.facebook.com/GozaMadridAI" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Visitar Facebook (nueva ventana)"
                      title="Facebook"
                      className="hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded transition-transform duration-200"
                    >
                      <FaFacebook size={24} className="text-blue-600" aria-hidden="true" />
                    </Link>
                    <Link 
                      href="https://www.instagram.com/Gozamadrid54" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Visitar Instagram (nueva ventana)"
                      title="Instagram"
                      className="hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500/50 rounded transition-transform duration-200"
                    >
                      <FaInstagram size={24} className="text-pink-600" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

export default ControlMenu;

