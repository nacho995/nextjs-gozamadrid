"use client";
import { usePathname } from 'next/navigation';
import Image from "next/legacy/image";
import Link from "next/link";
import Head from 'next/head';
import { useState, useRef, useEffect, useCallback } from "react";
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

// Componente para renderizar iconos con Suspense
const MenuIcon = ({ icon: Icon, ...props }) => {
  if (!Icon) return null;
  return <Icon {...props} />;
};

// Configuración SEO - Schema.org para la organización
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Goza Madrid",
  "url": "https://realestategozamadrid.com",
  "logo": "https://realestategozamadrid.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/GozaMadridAI",
    "https://www.instagram.com/Gozamadrid54"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle de Alcalá, 96",
    "addressLocality": "Madrid",
    "postalCode": "28009",
    "addressCountry": "ES"
  },
  "telephone": "+34919012103",
  "description": "Agencia inmobiliaria especializada en Madrid, ofreciendo servicios de compra, venta y alquiler de propiedades.",
  "areaServed": {
    "@type": "City",
    "name": "Madrid"
  },
  "openingHours": "Mo-Fr 09:00-20:00",
  "priceRange": "€€€"
};

// Configuración de navegación
const NAVIGATION_ITEMS = {
  main: [
    { name: "Inicio", href: "/", ariaLabel: "Ir a la página principal" },
    { name: "Vende tu propiedad", href: "/vender", ariaLabel: "Información sobre venta de propiedades" },
    { name: "eXp Realty", href: "/exp-realty", ariaLabel: "Información sobre eXp Realty" },
    { name: "Reformas", href: "/reformas", ariaLabel: "Servicios de reformas" },
    { name: "Blog", href: "/blog", ariaLabel: "Acceder al blog" },
    { name: "Contacto", href: "/contacto", ariaLabel: "Contactar con nosotros" }
  ],
  servicios: {
    residentes_espana: {
      name: "Residentes en España",
      href: "/servicios/residentes-espana",
      ariaLabel: "Servicios para residentes en España",
      subItems: [
        { name: "Alquiler", href: "/servicios/residentes-espana/alquiler", ariaLabel: "Servicios de alquiler" },
        { name: "Guía de compra", href: "/servicios/residentes-espana/guia-compra", ariaLabel: "Guía para comprar propiedades" }
      ]
    },
    residentes_extranjero: {
      name: "Residentes en el extranjero",
      href: "/servicios/residentes-extranjero",
      ariaLabel: "Servicios para residentes en el extranjero",
      subItems: [
        { name: "Impuesto no residentes", href: "/servicios/residentes-extranjero/impuesto-renta", ariaLabel: "Información sobre impuestos" },
        { name: "Guía de compra", href: "/servicios/residentes-extranjero/guia-compra", ariaLabel: "Guía para comprar desde el extranjero" }
      ]
    }
  }
};

export default function ControlMenu() {
  const [mounted, setMounted] = useState(false);
  const { menuVisible, toggleMenu, dropdownVisible, toggleDropdown } = useNavbar();
  const pathname = usePathname();
  const isExpRealty = pathname === '/exp-realty';

  const extraLinksRef = useRef(null);
  const [extraWidth, setExtraWidth] = useState(0);
  const venderRef = useRef(null);
  const [previousPath, setPreviousPath] = useState(pathname);

  // Memoización de funciones de callback
  const handleMenuToggle = useCallback(() => {
    toggleMenu();
  }, [toggleMenu]);

  const handleDropdownToggle = useCallback((type, value) => {
    toggleDropdown(type, value);
  }, [toggleDropdown]);

  // Optimización de efectos
  useEffect(() => {
    if (previousPath !== pathname) {
      if (menuVisible && window.innerWidth < 1024) {
        handleMenuToggle();
      }
      setPreviousPath(pathname);
    }
  }, [pathname, menuVisible, handleMenuToggle, previousPath]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (extraLinksRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setExtraWidth(entry.target.scrollWidth);
        }
      });
      resizeObserver.observe(extraLinksRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (menuVisible && extraLinksRef.current) {
      setExtraWidth(extraLinksRef.current.scrollWidth);
    }
  }, [menuVisible, mounted]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Los iconos de React Icons no tienen método preload()
            // Simplemente cargamos los componentes cuando son visibles
            // No es necesario hacer nada especial aquí
          }
        });
      },
      { threshold: 0.1 }
    );

    if (venderRef.current) {
      observer.observe(venderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  const routes = {
    residentes_espana: "/servicios/residentes-espana",
    residentes_espana_alquiler: "/servicios/residentes-espana/alquiler",
    residentes_espana_guia: "/servicios/residentes-espana/guia-compra",
    residentes_extranjero: "/servicios/residentes-extranjero",
    residentes_extranjero_impuesto: "/servicios/residentes-extranjero/impuesto-renta",
    residentes_extranjero_guia: "/servicios/residentes-extranjero/guia-compra"
  };

  return (
    <>
      <Head>
        <link 
          rel="preload" 
          href="/logo.png" 
          as="image" 
          type="image/png"
        />
        <script type="application/ld+json">
          {(() => {
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
          })()}
        </script>
      </Head>

      <header className="relative w-full z-[9999]">
        {/* Botón de menú para móviles */}
        {!menuVisible && (
          <div className="lg:hidden fixed right-4 top-4 z-[9999] text-white">
            <button 
              onClick={handleMenuToggle} 
              className="text-white hover:text-amarillo flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-amarillo/30 transition-all duration-300"
              aria-expanded={menuVisible}
              aria-controls="mobile-menu"
              aria-label={menuVisible ? "Cerrar menú" : "Abrir menú"}
            >
              {menuVisible ? <FaTimes size={24} /> : <FaEllipsisH size={24} />}
            </button>
          </div>
        )}

        {/* Menú Principal Desktop */}
        <nav 
          className={`mb-10 relative z-[9999] flex-col items-center px-24 p-4 w-max mx-auto rounded-full shadow-2xl hidden lg:flex ${
            isExpRealty ? 'header-gradient-exp' : 'header-gradient-default'
          }`}
          role="navigation"
          aria-label="Menú principal"
        >
          {/* Botón Ver más/menos */}
          <div className="absolute left-1/4 top-1/2 flex space-x-4 mt-4 ml-4">
            <button 
              onClick={handleMenuToggle} 
              className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-amarillo transition-all duration-300 flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-amarillo/30 group`}
              aria-label={menuVisible ? "Ver menos opciones" : "Ver más opciones"}
            >
              <span className="hidden lg:block font-medium">{menuVisible ? "Ver menos" : "Ver más"}</span>
              <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
                <div className={`absolute transition-all duration-500 transform ${menuVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <FaAngleUp size={24} className="text-amarillo group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className={`absolute transition-all duration-500 transform ${menuVisible ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  <FaEllipsisH size={24} className="text-amarillo group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </button>
          </div>

          {/* Redes sociales y teléfono */}
          <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
            <Link href="https://www.facebook.com/GozaMadridAI" target="_blank" rel="noopener noreferrer" aria-label="Visitar nuestro Facebook">
              <FaFacebook size={25} className="hover:text-gray-300 text-blue-600" />
            </Link>
            <Link href="https://www.instagram.com/Gozamadrid54" target="_blank" rel="noopener noreferrer" aria-label="Visitar nuestro Instagram">
              <FaInstagram size={25} className="hover:text-gray-300 text-pink-600" />
            </Link>
            <a href="tel:+34919012103" className="flex items-center space-x-2" aria-label="Llamar a nuestro teléfono">
              <FaPhone size={25} className={`hover:text-gray-300 ${isExpRealty ? 'text-white' : 'text-white'}`} />
              <span className={`hover:text-gray-300 ${isExpRealty ? 'text-white' : 'text-white'} text-2xl`}>
                +34 919 012 103
              </span>
            </a>
          </div>

          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-amarillo/20 rounded-3xl"></div>
            <Link href="/" aria-label="Ir a la página principal">
              <Image 
                src="/api/images/logonuevo.png" 
                alt="Logo de Goza Madrid" 
                width={120} 
                height={120} 
                layout="intrinsic"
                className="relative z-10 m-0"
                priority
              />
            </Link>
          </div>

          {/* Enlaces de navegación */}
          <div className={`${isExpRealty ? 'text-white' : 'text-white'} flex items-center space-x-14 mt-4 text-2xl font-bold`}>
            <Link href="/" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>
              Inicio
            </Link>

            {/* Vende tu propiedad con dropdown */}
            <div
              ref={venderRef}
              className="relative whitespace-nowrap group"
              onMouseEnter={() => handleDropdownToggle('vender', true)}
            >
              <Link href="/vender" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300 flex items-center gap-2`}>
                Vende tu propiedad
                <FaChevronDown
                  className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`}
                />
              </Link>
              {dropdownVisible.vender && (
                <>
                  <div className="absolute h-[20px] w-full" style={{ top: "100%", left: 0 }} />
                  <div
                    className="absolute bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold z-[9998]"
                    style={{
                      top: "calc(100% + 18px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: "300px"
                    }}
                    onMouseLeave={() => handleDropdownToggle('vender', false)}
                  >
                    <Link
                      href="/vender/comprar"
                      className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <MenuIcon icon={FaHome} className="mr-3 text-amarillo" />
                      Compra tu propiedad
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link href="/exp-realty" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>
              eXp Realty
            </Link>

            {/* Enlaces extra */}
            <div
              className="inline-block overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                width: menuVisible ? `${extraWidth}px` : "0px",
                marginLeft: menuVisible ? "3rem" : "0rem",
              }}
            >
              <div ref={extraLinksRef} className="inline-flex gap-11">
                <Link href="/reformas" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300 whitespace-nowrap`}>
                  Reformas
                </Link>
                <Link 
                  href="/blog" 
                  className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}
                  onClick={(e) => {
                    // Asegurarse de que el enlace funcione correctamente
                    e.stopPropagation();
                    // Si el menú está visible en móvil, cerrarlo
                    if (menuVisible && window.innerWidth < 1024) {
                      handleMenuToggle();
                    }
                  }}
                >
                  Blog
                </Link>
              </div>
            </div>

            {/* Servicios con submenú */}
            <div 
              className="relative group/servicios" 
              onMouseEnter={() => handleDropdownToggle('servicios', true)}
            >
              <div className="flex items-center gap-2">
                <Link
                  href="/servicios"
                  className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Servicios
                </Link>
                <FaChevronDown
                  className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                />
              </div>
              {dropdownVisible.servicios && (
                <>
                  {/* Área invisible para mantener el menú abierto */}
                  <div
                    className="absolute h-[20px] w-full"
                    style={{
                      top: "100%",
                      left: 0
                    }}
                  />
                  <div 
                    className="absolute bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold z-[9998]"
                    style={{
                      top: "calc(100% + 18px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: "300px"
                    }}
                    onMouseLeave={() => handleDropdownToggle('servicios', false)}
                  >
                    <div className="relative group/espana">
                      <Link
                        href={routes.residentes_espana}
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
                          href={routes.residentes_espana_alquiler}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                        >
                          <MenuIcon icon={FaHome} className="mr-3 text-amarillo" />
                          Alquiler
                        </Link>
                        <Link
                          href={routes.residentes_espana_guia}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          <MenuIcon icon={FaHandshake} className="mr-3 text-amarillo" />
                          Guía de compra
                        </Link>
                      </div>
                    </div>

                    <div className="relative group/extranjero">
                      <Link
                        href={routes.residentes_extranjero}
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
                          href={routes.residentes_extranjero_impuesto}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                        >
                          <MenuIcon icon={FaChartLine} className="mr-3 text-amarillo" />
                          Impuesto no residentes
                        </Link>
                        <Link
                          href={routes.residentes_extranjero_guia}
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

            <Link href="/contacto" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>
              Contacto
            </Link>
          </div>
        </nav>

        {/* Menú móvil */}
        <div 
          id="mobile-menu"
          className={`fixed inset-0 bg-black z-[9999] lg:hidden transition-all duration-300 ease-in-out ${
            menuVisible ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación móvil"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleMenuToggle();
            }
          }}
        >
          <div 
            className={`bg-gradient-to-tr from-black/30 via-amarillo/40 to-transparent backdrop-blur-md w-64 max-h-screen shadow-lg flex flex-col p-4 fixed top-0 right-0 h-full transition-all duration-300 ease-in-out transform ${
              menuVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="mb-8 text-center">
                <Link href="/" className="inline-block" aria-label="Ir a la página principal">
                  <Image src="/api/images/logonuevo.png" alt="Logo de Goza Madrid" width={80} height={80} layout="intrinsic" />
                </Link>
              </div>
              <button 
                onClick={handleMenuToggle} 
                className="text-white hover:text-amarillo bg-black/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300"
                aria-label="Cerrar menú"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <nav className="mt-8 flex flex-col space-y-4 text-xl font-bold">
              <Link href="/" className="text-white hover:text-gray-700">Inicio</Link>
              
              {/* Vende tu propiedad móvil */}
              <div className="relative whitespace-nowrap flex items-center">
                <Link href="/vender" className="text-white hover:text-gray-700">
                  Vende tu propiedad
                </Link>
                <button
                  onClick={() => handleDropdownToggle('vender', !dropdownVisible.vender)}
                  className="ml-2 text-white hover:text-gray-700"
                  aria-expanded={dropdownVisible.vender}
                >
                  <FaChevronDown
                    className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
              </div>
              
              {dropdownVisible.vender && (
                <div className="ml-4">
                  <Link
                    href="/vender/comprar"
                    className="flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg"
                  >
                    <MenuIcon icon={FaHome} className="mr-2 text-amarillo" />
                    Compra tu propiedad
                  </Link>
                </div>
              )}

              <Link href="/exp-realty" className="text-white hover:text-gray-700">eXp Realty</Link>
              <Link href="/reformas" className="text-white hover:text-gray-700">Reformas</Link>
              <Link 
                href="/blog" 
                className="text-white hover:text-gray-700"
                onClick={(e) => {
                  // Asegurarse de que el enlace funcione correctamente
                  e.stopPropagation();
                  // Cerrar el menú móvil después de hacer clic
                  handleMenuToggle();
                }}
              >
                Blog
              </Link>
              
              {/* Servicios móvil */}
              <div className="relative whitespace-nowrap flex flex-col">
                <div className="flex items-center justify-between">
                  <Link href="/servicios" className="text-white hover:text-gray-700">
                    Servicios
                  </Link>
                  <button
                    onClick={() => handleDropdownToggle('servicios', !dropdownVisible.servicios)}
                    className="ml-2 text-white hover:text-gray-700"
                    aria-expanded={dropdownVisible.servicios}
                  >
                    <FaChevronDown
                      className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                      size={20}
                    />
                  </button>
                </div>
                
                {dropdownVisible.servicios && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2">
                    <Link
                      href={routes.residentes_espana}
                      className="text-white hover:text-gray-700 flex items-center"
                    >
                      <MenuIcon icon={FaHandshake} className="mr-2 text-amarillo" />
                      Residentes en España
                    </Link>
                    <Link
                      href={routes.residentes_extranjero}
                      className="text-white hover:text-gray-700 flex items-center"
                    >
                      <MenuIcon icon={FaChartLine} className="mr-2 text-amarillo" />
                      Residentes en el extranjero
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/contacto" className="text-white hover:text-gray-700">Contacto</Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
