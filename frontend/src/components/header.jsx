"use client";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone, FaHome, FaHandshake, FaChartLine } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold, AiOutlineDown, AiOutlineRight } from "react-icons/ai";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavbar } from './context/navBarContext'; // Asegúrate de que la ruta sea correcta

export default function ControlMenu() {
  // Se llaman todos los hooks incondicionalmente:
  const [mounted, setMounted] = useState(false);
  const { menuVisible, toggleMenu, dropdownVisible, toggleDropdown } = useNavbar();
  const pathname = usePathname();
  const isExpRealty = pathname === '/exp-realty';

  const extraLinksRef = useRef(null);
  const [extraWidth, setExtraWidth] = useState(0);
  const venderRef = useRef(null);
  const [venderRect, setVenderRect] = useState({
    top: 1,
    left: 0,
    width: 0,
    height: 0,
    bottom: 0,
  });

  // Cierra el menú móvil cuando cambia la ruta
  const [previousPath, setPreviousPath] = useState(pathname);
  
  useEffect(() => {
    // Verificar si la ruta cambió
    if (previousPath !== pathname) {
      // Solo cerrar si estamos en versión móvil y el menú está visible
      if (menuVisible && window.innerWidth < 1024) { // 1024px es el breakpoint 'lg' en Tailwind
        toggleMenu();
      }
      // Actualizar la ruta anterior
      setPreviousPath(pathname);
    }
  }, [pathname, menuVisible, toggleMenu, previousPath]);

  // Cuando el componente se monta, marcamos mounted como true
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuramos un ResizeObserver para el contenedor de enlaces extra
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

  // Forzamos la recalculación del ancho cuando cambia el estado del menú o cuando se monta el componente
  useEffect(() => {
    if (menuVisible && extraLinksRef.current) {
      setExtraWidth(extraLinksRef.current.scrollWidth);
    }
  }, [menuVisible, mounted]);

  // Actualizamos las dimensiones de "vender" cuando se muestre el dropdown
  useEffect(() => {
    if (venderRef.current && dropdownVisible.vender) {
      const rect = venderRef.current.getBoundingClientRect();
      setVenderRect(rect);
    }
  }, [dropdownVisible.vender]);

  // Si aún no se ha montado, no renderizamos nada
  if (!mounted) {
    return null;
  }

  // Verifica que todas estas rutas existan en tu proyecto
  const routes = {
    residentes_espana: "/servicios/residentes-espana",
    residentes_espana_alquiler: "/servicios/residentes-espana/alquiler",
    residentes_espana_guia: "/servicios/residentes-espana/guia-compra",
    residentes_extranjero: "/servicios/residentes-extranjero",
    residentes_extranjero_impuesto: "/servicios/residentes-extranjero/impuesto-renta",
    residentes_extranjero_guia: "/servicios/residentes-extranjero/guia-compra"
  };

  return (
    <div className="relative w-full z-[9999]">
      {/* Botón de menú para móviles */}
      {!menuVisible && (
        <div className="lg:hidden fixed right-4 top-4 z-[9999] text-white bg-gray-600 p-2 rounded">
          <button onClick={toggleMenu} className="text-white hover:text-gray-700 flex items-center space-x-2">
            {menuVisible ? <AiOutlineMenuFold size={30} /> : <AiOutlineMenuUnfold size={30} />}
          </button>
        </div>
      )}

      {/* Menú Principal */}
      <header
        className={`relative z-[9999] flex-col items-center px-24 p-4 ${
          isExpRealty
            ? 'bg-gradient-to-r from-blue-900/40 via-amarillo/40 to-blue-900/40'
            : 'bg-black bg-opacity-40'
          } w-max mx-auto rounded-full shadow-2xl hidden lg:flex`}
      >
        {/* Íconos sociales y botón de menú */}
        <div className="absolute left-1/4 top-1/2 flex space-x-4 mt-4 ml-4">
          <button onClick={toggleMenu} className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300 flex items-center space-x-2`}>
            <span className="hidden lg:block">{menuVisible ? "Ver menos" : "Ver más"}</span>
            {menuVisible ? <AiOutlineMenuFold size={30} /> : <AiOutlineMenuUnfold size={30} />}
          </button>
        </div>

        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <Link href="https://www.facebook.com/GozaMadridAI?locale=es_ES" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={25} className="hover:text-gray-300 text-blue-600" />
          </Link>
          <Link href="https://www.instagram.com/Gozamadrid54" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={25} className="hover:text-gray-300 text-pink-600" />
          </Link>
          <FaPhone size={25} className={`hover:text-gray-300 ${isExpRealty ? 'text-white' : 'text-white'}`} />
          <span className={`hover:text-gray-300 ${isExpRealty ? 'text-white' : 'text-white'} text-2xl`}>+34 919 012 103</span>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-amarillo/20 rounded-3xl"></div>
          <Image src="/logo.png" alt="Logo" width={150} height={30} className="relative z-10 m-0" />
        </div>

        <nav className={`${isExpRealty ? 'text-white' : 'text-white'} flex items-center space-x-14 mt-4 text-2xl font-bold`}>
          <Link href="/" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>Inicio</Link>

          {/* Contenedor para "Vende tu propiedad" */}
          <div
            ref={venderRef}
            className="relative whitespace-nowrap group"
            onMouseEnter={() => toggleDropdown('vender', true)}
          >
            <Link href="/vender" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300 flex items-center gap-2`}>
              Vende tu propiedad
              <AiOutlineDown className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`} />
            </Link>
            {dropdownVisible.vender && (
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
                  onMouseLeave={() => toggleDropdown('vender', false)}
                >
                  <Link
                    href="/vender/comprar"
                    className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    <FaHome className="mr-3 text-amarillo" />
                    Compra tu propiedad
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link href="/exp-realty" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>eXp Realty</Link>

          <div
            className="inline-block overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              width: menuVisible ? `${extraWidth}px` : "0px",
              marginLeft: menuVisible ? "3rem" : "0rem",
            }}
          >
            <div ref={extraLinksRef} className="inline-flex gap-11">
              <Link href="/reformas" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300 whitespace-nowrap`}>Reformas</Link>
              <Link href="/blog" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>Blog</Link>
            </div>
          </div>

          {/* Servicios con submenú */}
          <div className="relative group/servicios" onMouseEnter={() => toggleDropdown('servicios', true)}>
            <div className="flex items-center gap-2">
              <Link
                href="/servicios"
                className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}
                onClick={(e) => e.stopPropagation()}
              >
                Servicios
              </Link>
              <div className="cursor-pointer">
                <AiOutlineDown
                  className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
            {dropdownVisible.servicios && (
              <>
                <div className="absolute h-[20px] w-full" style={{ top: "100%", left: 0 }} />
                <div className="absolute bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold z-[9998]"
                  style={{
                    top: "calc(100% + 18px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    minWidth: "300px"
                  }}
                  onMouseLeave={() => toggleDropdown('servicios', false)}
                >
                  <div className="relative group/espana">
                    <Link
                      href={routes.residentes_espana}
                      className="w-[25vw] flex items-center justify-between px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                    >
                      <div className="flex items-center ">
                        <FaHandshake className="mr-3  text-amarillo" />
                        Residentes en España
                      </div>
                      <AiOutlineRight className="ml-2 group-hover/espana:rotate-90 transition-transform duration-200" />
                    </Link>

                    <div className="absolute left-full top-0 hidden group-hover/espana:block bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg min-w-[200px] z-[9997]">
                      <Link
                        href={routes.residentes_espana_alquiler}
                        className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                      >
                        <FaHome className="mr-3 text-amarillo" />
                        Alquiler
                      </Link>
                      <Link
                        href={routes.residentes_espana_guia}
                        className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaHandshake className="mr-3 text-amarillo" />
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
                        <FaChartLine className="mr-3  text-amarillo" />
                        Residentes en el extranjero
                      </div>
                      <AiOutlineRight className="ml-2 group-hover/extranjero:rotate-90 transition-transform duration-200" />
                    </Link>

                    <div className="absolute left-full top-0 hidden group-hover/extranjero:block bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg min-w-[200px] z-[9997]">
                      <Link
                        href={routes.residentes_extranjero_impuesto}
                        className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                      >
                        <FaChartLine className="mr-3 text-amarillo" />
                        Impuesto no residentes
                      </Link>
                      <Link
                        href={routes.residentes_extranjero_guia}
                        className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaHandshake className="mr-3 text-amarillo" />
                        Guía de compra
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href="/contacto" className={`${isExpRealty ? 'text-white' : 'text-white'} hover:text-gray-300`}>Contacto</Link>
        </nav>
      </header>

      {/* Menú Lateral para dispositivos móviles - siempre presente pero con visibilidad controlada */}
      <div 
        className={`fixed top-0 left-0 w-full h-full bg-black z-[9999] lg:hidden transition-all duration-300 ease-in-out ${
          menuVisible ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          // Si el clic fue en el fondo oscuro (overlay) y no en el menú
          if (e.target === e.currentTarget) {
            toggleMenu();
          }
        }}
      >
        <div 
          className={`bg-gradient-to-tr from-black/30 via-amarillo/40 to-transparent backdrop-blur-md w-64 max-h-screen shadow-lg flex flex-col p-4 fixed top-0 right-0 h-full transition-all duration-300 ease-in-out transform ${
            menuVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex justify-between items-center">
            <Image src="/logo.png" alt="Logo" width={100} height={20} />
            <button onClick={toggleMenu} className="text-white hover:text-gray-700">
              <AiOutlineMenuFold size={30} />
            </button>
          </div>
          <nav className="mt-8 flex flex-col space-y-4 text-xl font-bold">
            <Link href="/" className="text-white hover:text-gray-700">Inicio</Link>
            <div className="relative whitespace-nowrap flex items-center">
              <Link href="/vender" className="text-white hover:text-gray-700">
                Vende tu propiedad
              </Link>
              <button
                onClick={() => toggleDropdown('vender', !dropdownVisible.vender)}
                className="ml-2 text-white hover:text-gray-700"
              >
                <AiOutlineDown
                  className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`}
                  size={20}
                />
              </button>
            </div>
            {dropdownVisible.vender && (
              <div className="transition-all duration-300 ease-in-out max-h-40 opacity-100 overflow-hidden">
                <Link
                  href="/vender/comprar"
                  className="flex items-center px-4 py-3 text-white bg-black bg-opacity-50 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  <FaHome className="mr-2 text-amarillo" />
                  Compra tu propiedad
                </Link>
              </div>
            )}

            <Link href="/exp-realty" className="text-white hover:text-gray-700">eXp Realty</Link>
            <Link href="/reformas" className="text-white hover:text-gray-700">Reformas</Link>
            <div className="relative whitespace-nowrap flex flex-col">
              <div className="flex items-center justify-between">
                <Link href="/servicios" className="text-white hover:text-gray-700">
                  Servicios
                </Link>
                <button
                  onClick={() => toggleDropdown('servicios', !dropdownVisible.servicios)}
                  className="ml-2 text-white hover:text-gray-700"
                >
                  <AiOutlineDown
                    className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
              </div>
              {dropdownVisible.servicios && (
                <div className="ml-4 mt-2 flex flex-col bg-black bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden z-[9998]">
                  <div className="border-b border-white/10">
                    <Link
                      href={routes.residentes_espana}
                      className="text-sm flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaHandshake className="mr-2 text-amarillo" />
                      Residentes en España
                    </Link>
                    <Link
                      href={routes.residentes_espana_alquiler}
                      className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaHome className="mr-2 text-amarillo" />
                      Alquiler
                    </Link>
                    <Link
                      href={routes.residentes_espana_guia}
                      className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaHandshake className="mr-2 text-amarillo" />
                      Guía de compra
                    </Link>
                  </div>
                  <div className="border-b border-white/10">
                    <Link
                      href={routes.residentes_extranjero}
                        className="text-sm flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaChartLine className="mr-2 text-amarillo" />
                        Residentes extranjero
                      </Link>
                  </div>
                  <div>
                    <Link
                      href={routes.residentes_extranjero_impuesto}
                      className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaChartLine className="mr-2 text-amarillo" />
                      Impuestos
                    </Link>
                    <Link
                      href={routes.residentes_extranjero_guia}
                      className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaHandshake className="mr-2 text-amarillo" />
                      Guía de compra
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/blog" className="text-white hover:text-gray-700">Blog</Link>
            <Link href="/contacto" className="text-white hover:text-gray-700">Contacto</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
