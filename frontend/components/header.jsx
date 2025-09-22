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
  FaBars, 
  FaTimes, 
  FaChevronDown, 
  FaChevronRight,
  FaHome,
  FaBuilding,
  FaHandshake,
  FaChartLine,
  FaEllipsisH,
  FaAngleDown,
  FaAngleUp
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
  "logo": "https://realestategozamadrid.com/logonuevo.png",
  "image": "https://realestategozamadrid.com/logonuevo.png",
              "sameAs": [
                "https://www.facebook.com/MBLP66/",
                    "https://www.instagram.com/gozamadrid54/"
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

  if (!mounted) return null;

  return (
    <>
      <Head>
        {/* Preloads optimizados */}
        <link 
          rel="preload" 
          href="/logonuevo.png" 
          as="image" 
          type="image/png"
          crossOrigin="anonymous"
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
          <script type="application/ld+json">
            {JSON.stringify({
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
                                      "name": pathname?.split('/').pop()?.replace(/-/g, ' ') || "Página actual",
                  "item": `https://realestategozamadrid.com${pathname || ''}`
                }
              ]
            })}
          </script>
        )}
      </Head>

      <header 
        className={`w-full z-[9999] ${isHomePage ? 'absolute top-0 left-0' : 'relative'}`}
        role="banner"
        aria-label="Navegación principal de Goza Madrid"
      >
        {/* Gradiente de integración sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent pointer-events-none" aria-hidden="true"></div>
        
        {/* Botón de menú para móviles - Mejorado para accesibilidad */}
        {!menuVisible && (
          <div className="xl:hidden fixed right-4 top-4 z-[9999] text-white">
            <button 
              onClick={toggleMenu} 
              className="group relative text-white hover:text-amarillo focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 rounded-2xl shadow-xl hover:shadow-amarillo/30 transition-all duration-300 border border-white/20 hover:border-amarillo/40 hover:scale-105"
              aria-expanded={menuVisible}
              aria-controls="mobile-menu"
              aria-label={menuVisible ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              type="button"
            >
              {/* Icono del menú hamburger animado */}
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <div className={`w-6 h-0.5 bg-white group-hover:bg-amarillo transition-all duration-300 rounded-full ${menuVisible ? 'rotate-45 translate-y-2' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white group-hover:bg-amarillo transition-all duration-300 rounded-full my-1 ${menuVisible ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-white group-hover:bg-amarillo transition-all duration-300 rounded-full ${menuVisible ? '-rotate-45 -translate-y-2' : ''}`}></div>
              </div>
              
              {/* Etiqueta animada "MENÚ" */}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-white/20">
                MENÚ
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-t border-white/20"></div>
              </span>
              
              {/* Efecto de pulsación */}
              <div className="absolute inset-0 rounded-2xl bg-amarillo/20 scale-0 group-active:scale-100 transition-transform duration-150"></div>
            </button>
          </div>
        )}

        {/* Menú Principal Desktop - Mejorado para SEO y Accesibilidad */}
        <nav 
          className={`${isHomePage ? 'mt-6 mb-0' : 'mb-6'} relative z-[9999] flex-col items-center lg:px-8 xl:px-24 lg:py-3 p-4 w-max mx-auto rounded-full shadow-2xl hidden lg:flex backdrop-blur-xl border border-white/10 lg:scale-90 xl:scale-100 ${
            isHomePage ? 'bg-black/15' : 'bg-black/20'
          }`}
          role="navigation"
          aria-label="Menú principal de navegación"
        >
          {/* BOTÓN DESTACADO - COMPRAR PROPIEDADES */}
          <div className="absolute lg:left-4 xl:left-6 top-1/2 transform -translate-y-1/2">
            <Link
              href="/vender/comprar"
              className="bg-gradient-to-r from-amarillo to-yellow-400 hover:from-yellow-400 hover:to-amarillo text-black font-bold lg:px-4 lg:py-2 xl:px-6 xl:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amarillo/50 lg:text-sm xl:text-lg border-2 border-yellow-300/50"
              title="Comprar propiedades - Servicio destacado"
              aria-label="Acceso rápido para comprar propiedades"
            >
              🏠 Comprar Propiedades
            </Link>
          </div>

          {/* Redes sociales y teléfono - Mejoradas para SEO */}
          <div className="absolute top-5 right-10 flex lg:space-x-3 xl:space-x-4 mt-4 mr-4" role="complementary" aria-label="Información de contacto y redes sociales">
            <Link 
              href="https://www.facebook.com/MBLP66/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visitar nuestra página de Facebook (se abre en nueva ventana)"
              title="Facebook - Goza Madrid Inmobiliaria"
              className="hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
            >
              <FaFacebook size={22} className="hover:text-gray-300 text-blue-600" aria-hidden="true" />
            </Link>
            <Link 
              href="https://www.instagram.com/gozamadrid54/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visitar nuestro perfil de Instagram (se abre en nueva ventana)"
              title="Instagram - Goza Madrid Inmobiliaria"
              className="hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 rounded"
            >
              <FaInstagram size={22} className="hover:text-gray-300 text-pink-600" aria-hidden="true" />
            </Link>
            <a 
              href="tel:+34608136529" 
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2" 
              aria-label="Llamar al teléfono +34 608 136 529"
              title="Llamar ahora - Goza Madrid"
            >
              <FaPhone size={25} className="hover:text-gray-300 text-white" aria-hidden="true" />
              <span className="hover:text-gray-300 text-white lg:text-base xl:text-2xl">
                +34 608 136 529
              </span>
            </a>
          </div>

          {/* Logo - Optimizado para SEO */}
          <div className="relative lg:scale-[0.85] xl:scale-100">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-amarillo/20 rounded-3xl" aria-hidden="true"></div>
            <Link 
              href="/" 
              aria-label="Ir a la página principal de Goza Madrid Inmobiliaria"
              title="Goza Madrid - Inicio"
              className="focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded-3xl"
            >
              <Image 
                src="/logonuevo.png"
                alt="Goza Madrid - Agencia Inmobiliaria en Madrid, especialistas en compra, venta y alquiler de propiedades" 
                width={110} 
                height={110} 
                layout="intrinsic"
                className="relative z-10 m-0"
                priority
                loading="eager"
              />
            </Link>
          </div>

          {/* Enlaces de navegación principales - Todos visibles */}
          <div className="text-white flex items-center lg:space-x-6 xl:space-x-12 mt-4 lg:text-base xl:text-2xl font-bold" role="menubar">
            <Link 
              href="/" 
              className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
              role="menuitem"
              title="Página principal - Goza Madrid"
            >
              Inicio
            </Link>

            {/* Vende tu propiedad con dropdown mejorado */}
            <div
              ref={venderRef}
              className="relative whitespace-nowrap group"
              onMouseEnter={() => toggleDropdown('vender', true)}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={dropdownVisible.vender}
            >
              <Link 
                href="/vender" 
                className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 flex items-center gap-2"
                title="Servicios de venta de propiedades"
              >
                Vende tu propiedad
                <FaChevronDown
                  className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </Link>
              {dropdownVisible.vender && (
                <>
                  <div className="absolute h-[20px] w-full" style={{ top: "100%", left: 0 }} />
                  <div
                    className="absolute bg-black/30 backdrop-blur-xl rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold z-[9998] border border-white/10"
                    style={{
                      top: "calc(100% + 18px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: "300px"
                    }}
                    onMouseLeave={() => toggleDropdown('vender', false)}
                    role="menu"
                    aria-label="Submenu de venta de propiedades"
                  >
                    <Link
                      href="/vender/comprar"
                      className="flex items-center px-6 py-3 text-white hover:bg-white/10 focus:bg-white/20 focus:outline-none transition-colors duration-200"
                      role="menuitem"
                      title="Información sobre compra de propiedades"
                    >
                      <MenuIcon icon={FaHome} className="mr-3 text-amarillo" aria-hidden="true" />
                      Compra tu propiedad
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* eXp Realty - COMENTADO TEMPORALMENTE
            <Link 
              href="/exp-realty" 
              className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
              role="menuitem"
              title="eXp Realty - Red inmobiliaria global"
            >
              eXp Realty
            </Link>
            */}

            {/* Reformas - Ahora siempre visible */}
            <Link 
              href="/reformas" 
              className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200 whitespace-nowrap"
              role="menuitem"
              title="Servicios de reformas inmobiliarias"
            >
              Reformas
            </Link>

            {/* Blog - Ahora siempre visible */}
            <Link 
              href="/blog" 
              className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
              role="menuitem"
              title="Blog inmobiliario - Consejos y noticias"
            >
              Blog
            </Link>

            {/* Servicios con submenú mejorado */}
            <div 
              className="relative group/servicios" 
              onMouseEnter={() => toggleDropdown('servicios', true)}
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={dropdownVisible.servicios}
            >
              <div className="flex items-center gap-2">
                <Link
                  href="/servicios"
                  className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                  title="Servicios inmobiliarios especializados"
                >
                  Servicios
                </Link>
                <FaChevronDown
                  className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </div>
              {dropdownVisible.servicios && (
                <>
                  <div className="absolute h-[20px] w-full" style={{ top: "100%", left: 0 }} />
                  <div 
                    className="absolute bg-black/30 backdrop-blur-xl rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold z-[9998] border border-white/10"
                    style={{
                      top: "calc(100% + 18px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: "300px"
                    }}
                    onMouseLeave={() => toggleDropdown('servicios', false)}
                    role="menu"
                    aria-label="Servicios inmobiliarios"
                  >
                    <div className="relative group/espana">
                      <Link
                        href={ROUTES.residentes_espana}
                        className="w-[25vw] flex items-center justify-between px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                      >
                        <div className="flex items-center">
                          <MenuIcon icon={FaHandshake} className="mr-3 text-amarillo" />
                          Residentes en España
                        </div>
                        <MenuIcon icon={FaChevronRight} className="ml-2 group-hover/espana:rotate-90 transition-transform duration-200" />
                      </Link>

                      {/* Área invisible para el submenú */}
                      <div 
                        className="absolute top-0 -right-5 w-5 h-full"
                      />

                      <div className="absolute left-full top-0 hidden group-hover/espana:block bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg min-w-[200px] z-[9997]">
                        {/* Área invisible para el submenú */}
                        <div 
                          className="absolute -left-5 top-0 w-5 h-full"
                        />
                        <Link
                          href={ROUTES.residentes_espana_alquiler}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                        >
                          <MenuIcon icon={FaHome} className="mr-3 text-amarillo" />
                          Alquiler
                        </Link>
                        <Link
                          href={ROUTES.residentes_espana_guia}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          <MenuIcon icon={FaHandshake} className="mr-3 text-amarillo" />
                          Guía de compra
                        </Link>
                      </div>
                    </div>

                    <div className="relative group/extranjero">
                      <Link
                        href={ROUTES.residentes_extranjero}
                        className="w-[25vw] flex items-center justify-between px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <MenuIcon icon={FaChartLine} className="mr-3 text-amarillo" />
                          Residentes en el extranjero
                        </div>
                        <MenuIcon icon={FaChevronRight} className="ml-2 group-hover/extranjero:rotate-90 transition-transform duration-200" />
                      </Link>

                      {/* Área invisible para el submenú */}
                      <div 
                        className="absolute top-0 -right-5 w-5 h-full"
                      />

                      <div className="absolute left-full top-0 hidden group-hover/extranjero:block bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg min-w-[200px] z-[9997]">
                        {/* Área invisible para el submenú */}
                        <div 
                          className="absolute -left-5 top-0 w-5 h-full"
                        />
                        <Link
                          href={ROUTES.residentes_extranjero_impuesto}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                        >
                          <MenuIcon icon={FaChartLine} className="mr-3 text-amarillo" />
                          Impuesto no residentes
                        </Link>
                        <Link
                          href={ROUTES.residentes_extranjero_guia}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          <MenuIcon icon={FaHandshake} className="mr-3 text-amarillo" />
                          Guía de compra
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link 
              href="/contacto" 
              className="text-white hover:text-gray-300 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200" 
              role="menuitem" 
              title="Contacto - Goza Madrid Inmobiliaria"
            >
              Contacto
            </Link>
          </div>
        </nav>

        {/* Menú móvil optimizado para accesibilidad y performance */}
        <div 
          id="mobile-menu"
          className={`fixed inset-0 bg-black z-[9999] xl:hidden transition-all duration-300 ease-in-out ${
            menuVisible ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
          }`}
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
            className={`bg-gradient-to-tr from-black/30 via-amarillo/40 to-transparent backdrop-blur-md w-64 shadow-lg flex flex-col fixed top-0 right-0 h-full transition-all duration-300 ease-in-out transform ${
              menuVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            role="navigation"
            aria-label="Menú de navegación móvil"
          >
            {/* Header fijo del menú */}
            <div className="flex justify-between items-center p-4 flex-shrink-0">
              <div className="text-center">
                <Link 
                  href="/" 
                  className="inline-block focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded" 
                  aria-label="Ir a la página principal de Goza Madrid"
                  title="Goza Madrid - Inicio"
                  onClick={() => toggleMenu()}
                >
                  <Image 
                    src="/logonuevo.png" 
                    alt="Goza Madrid - Logo" 
                    width={80} 
                    height={80} 
                    layout="intrinsic" 
                    loading="lazy"
                  />
                </Link>
              </div>
              <button 
                onClick={toggleMenu} 
                className="text-white hover:text-amarillo focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 bg-black/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300"
                aria-label="Cerrar menú de navegación"
                type="button"
              >
                <FaTimes size={24} aria-hidden="true" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4" role="menu">
              <div className="flex flex-col space-y-4 text-xl font-bold">
              <Link 
                href="/" 
                className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                role="menuitem"
                title="Página principal"
                onClick={() => toggleMenu()}
              >
                Inicio
              </Link>

              {/* BOTÓN ULTRA PREMIUM - PROPIEDADES DE LUJO MADRID */}
              <div className="relative group mb-6 mx-2">
                {/* Halo dorado animado */}
                <div 
                  className="absolute -inset-2 rounded-3xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      #FFD700, #FFA500, #FF8C00, #DAA520, 
                      #B8860B, #DAA520, #FF8C00, #FFA500, #FFD700)`,
                    filter: 'blur(8px)'
                  }}
                ></div>
                
                {/* Botón principal */}
                <Link 
                  href="/vender/comprar" 
                  className="relative block w-full overflow-hidden rounded-3xl transform transition-all duration-500 hover:scale-[1.02] active:scale-95 group-hover:shadow-2xl"
                  role="menuitem"
                  title="Propiedades de Lujo Exclusivas en Madrid - Goza Madrid"
                  onClick={() => toggleMenu()}
                  style={{
                    background: `linear-gradient(135deg, 
                      #1a1a1a 0%, 
                      #2d2d2d 25%,
                      #1a1a1a 50%, 
                      #2d2d2d 75%,
                      #1a1a1a 100%)`,
                    border: '3px solid',
                    borderImage: `linear-gradient(45deg, 
                      #FFD700 0%, 
                      #FFA500 25%, 
                      #FF8C00 50%, 
                      #FFA500 75%, 
                      #FFD700 100%) 1`,
                    boxShadow: `
                      0 25px 50px rgba(0, 0, 0, 0.5),
                      0 15px 35px rgba(255, 215, 0, 0.3),
                      inset 0 3px 15px rgba(255, 215, 0, 0.1),
                      inset 0 -2px 10px rgba(0, 0, 0, 0.3)`
                  }}
                >
                  {/* Contenido del botón */}
                  <div className="px-6 py-5 relative z-10">
                    {/* Icono premium con corona */}
                    <div className="flex items-center justify-center mb-2">
                      <div className="relative">
                        <span 
                          className="text-3xl filter drop-shadow-lg"
                          style={{
                            background: `linear-gradient(45deg, #FFD700, #FFA500)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          🏛️
                        </span>
                        <span 
                          className="absolute -top-1 -right-1 text-sm animate-bounce"
                          style={{ color: '#FFD700' }}
                        >
                          👑
                        </span>
                      </div>
                    </div>
                    
                    {/* Texto principal */}
                    <div className="text-center">
                      <div 
                        className="font-black text-lg mb-1 tracking-wider"
                        style={{
                          background: `linear-gradient(45deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))'
                        }}
                      >
                        PROPIEDADES DE LUJO
                      </div>
                      <div 
                        className="font-bold text-xs tracking-widest opacity-90"
                        style={{
                          color: '#E6E6E6',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                        }}
                      >
                        EXCLUSIVAS EN MADRID
                      </div>
                    </div>
                    
                    {/* Indicador de premium */}
                    <div className="flex justify-center mt-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i}
                            className="text-xs animate-pulse"
                            style={{ 
                              color: '#FFD700',
                              animationDelay: `${i * 0.1}s`
                            }}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Efecto de brillo deslizante */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-all duration-1000"
                    style={{
                      background: `linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 215, 0, 0.6) 45%, 
                        rgba(255, 255, 255, 0.8) 50%, 
                        rgba(255, 215, 0, 0.6) 55%, 
                        transparent 100%)`,
                      transform: 'translateX(-100%)',
                      animation: 'shimmerLux 3s infinite'
                    }}
                  ></div>
                  
                  {/* Partículas decorativas */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
                </Link>
              </div>
              
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
                    onClick={() => toggleDropdown('vender', !dropdownVisible.vender)}
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
                      href="/vender/comprar"
                      className="flex items-center px-4 py-3 text-white hover:bg-white/10 focus:bg-white/20 focus:outline-none transition-colors duration-200 rounded-lg"
                      role="menuitem"
                      title="Información sobre compra de propiedades"
                      onClick={() => toggleMenu()}
                    >
                      <MenuIcon icon={FaHome} className="mr-2 text-amarillo" aria-hidden="true" />
                      Compra tu propiedad
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
              
              <Link 
                href="/blog" 
                className="text-white hover:text-gray-700 focus:text-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/50 rounded px-2 py-1 transition-all duration-200"
                role="menuitem"
                title="Blog inmobiliario"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu();
                }}
              >
                Blog
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
                    onClick={() => toggleDropdown('servicios', !dropdownVisible.servicios)}
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
                      href="https://www.facebook.com/MBLP66/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Visitar Facebook (nueva ventana)"
                      title="Facebook"
                      className="hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded transition-transform duration-200"
                    >
                      <FaFacebook size={24} className="text-blue-600" aria-hidden="true" />
                    </Link>
                    <Link 
                      href="https://www.instagram.com/gozamadrid54/" 
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
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

export default ControlMenu;