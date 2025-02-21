"use client";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone, FaHome, FaHandshake, FaChartLine } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold, AiOutlineDown, AiOutlineRight } from "react-icons/ai";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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

  return (
    <div className="relative w-full">
      {/* Botón de menú para móviles */}
      {!menuVisible && (
        <div className="lg:hidden fixed left-4 top-4 z-50 text-amarillo bg-gray-600 p-2 rounded">
          <button onClick={toggleMenu} className="text-amarillo hover:text-gray-700 flex items-center space-x-2">
            {menuVisible ? <AiOutlineMenuFold size={30} /> : <AiOutlineMenuUnfold size={30} />}
          </button>
        </div>
      )}

      {/* Menú Principal */}
      <header
        className={`relative z-10 flex-col items-center px-24 p-4 ${isExpRealty
          ? 'bg-gradient-to-r from-blue-900/40 via-amarillo/40 to-blue-900/40'
          : 'bg-white bg-opacity-40'
          } w-max mx-auto rounded-full shadow-2xl hidden lg:flex`}
      >
        {/* Íconos sociales y botón de menú */}
        <div className="absolute left-1/4 top-1/2 flex space-x-4 mt-4 ml-4">
          <button onClick={toggleMenu} className="text-black hover:text-gray-700 flex items-center space-x-2">
            <span className="hidden lg:block">{menuVisible ? "Ver menos" : "Ver más"}</span>
            {menuVisible ? <AiOutlineMenuFold size={30} /> : <AiOutlineMenuUnfold size={30} />}
          </button>
        </div>

        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={25} className="hover:text-gray-700 text-blue-600" />
          </Link>
          <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={25} className="hover:text-gray-700 text-pink-600" />
          </Link>
          <Link href="tel:+34919012103">
            <FaPhone size={25} className="hover:text-gray-700" />
          </Link>
          <span className="hover:text-gray-700 text-black text-2xl">+34 919 012 103</span>
        </div>

        <Image src="/logo.png" alt="Logo" width={150} height={30} className="m-0" />

        <nav className="text-black flex items-center space-x-14 mt-4 text-2xl font-bold">
          <Link href="/" className="text-black hover:text-gray-700">Inicio</Link>

          {/* Contenedor para "Vende tu propiedad" */}
          <div
            ref={venderRef}
            className="relative whitespace-nowrap"
            onMouseEnter={() => toggleDropdown('vender', true)}
          >
            <Link href="/vender" className="text-black hover:text-gray-700 flex items-center gap-2">
              Vende tu propiedad
              <AiOutlineDown className={`transition-transform duration-300 ${dropdownVisible.vender ? 'rotate-180' : ''}`} />
            </Link>
            {dropdownVisible.vender && (
              <div
                className="absolute bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold"
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
            )}
          </div>

          <Link href="/exp-realty" className="text-black hover:text-gray-700">eXp Realty</Link>

          <div
            className="inline-block overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              width: menuVisible ? `${extraWidth}px` : "0px",
              marginLeft: menuVisible ? "3rem" : "0rem",
            }}
          >
            <div ref={extraLinksRef} className="inline-flex gap-11">
              <Link href="/reformas" className="text-black hover:text-gray-700 whitespace-nowrap">Reformas</Link>
              <Link href="/inversores" className="text-black hover:text-gray-700 whitespace-nowrap">Inversores</Link>
              <Link href="/blog" className="text-black hover:text-gray-700">Blog</Link>
            </div>
          </div>

          {/* Servicios con submenú */}
          <div
            className="relative whitespace-nowrap"
            onMouseEnter={() => toggleDropdown('servicios', true)}
          >
            <Link href="/servicios" className="text-black hover:text-gray-700 flex items-center gap-2">
              Servicios
              <AiOutlineDown className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`} />
            </Link>
            {dropdownVisible.servicios && (
              <div
                className="absolute bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold"
                style={{
                  top: "calc(100% + 18px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  minWidth: "300px"
                }}
                onMouseLeave={() => toggleDropdown('servicios', false)}
              >
                <div className="relative group">
                  <Link 
                    href="/servicios/residentes-espana" 
                    className="flex items-center justify-between px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                  >
                    <div className="flex items-center">
                      <FaHandshake className="mr-3 text-amarillo" />
                      Residentes en España
                    </div>
                    <AiOutlineRight className="ml-2 group-hover:rotate-90 transition-transform duration-200" />
                  </Link>
                  
                  {/* Submenú de Residentes en España */}
                  <div className="absolute left-full top-0 hidden group-hover:block bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg min-w-[200px]">
                    <Link 
                      href="/servicios/residentes-espana/alquiler" 
                      className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                    >
                      <FaHome className="mr-3 text-amarillo" />
                      Alquiler
                    </Link>
                    <Link 
                      href="/servicios/residentes-espana/guia-compra" 
                      className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaHandshake className="mr-3 text-amarillo" />
                      Guía de compra
                    </Link>
                  </div>
                </div>

                <Link 
                  href="/servicios/residentes-extranjero" 
                  className="flex items-center px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <FaChartLine className="mr-3 text-amarillo" />
                  Residentes en el extranjero
                </Link>
              </div>
            )}
          </div>

          <Link href="/contacto" className="text-black hover:text-gray-700">Contacto</Link>
        </nav>
      </header>

      {/* Menú Lateral para dispositivos móviles */}
      {menuVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 lg:hidden">
          <div className="bg-white bg-opacity-50 w-64 max-h-screen shadow-lg flex flex-col p-4">
            <div className="flex justify-between items-center">
              <Image src="/logo.png" alt="Logo" width={100} height={20} />
              <button onClick={toggleMenu} className="text-black hover:text-gray-700">
                <AiOutlineMenuFold size={30} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col space-y-4 text-xl font-bold">
              <Link href="/" className="text-black hover:text-gray-700">Inicio</Link>
              <div className="relative whitespace-nowrap flex items-center">
                <Link href="/vender" className="text-black hover:text-gray-700">
                  Vende tu propiedad
                </Link>
                <button
                  onClick={() => toggleDropdown('vender', !dropdownVisible.vender)}
                  className="ml-2 text-black hover:text-gray-700"
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

              <Link href="/exp-realty" className="text-black hover:text-gray-700">eXp Realty</Link>
              <Link href="/reformas" className="text-black hover:text-gray-700">Reformas</Link>
              <Link href="/inversores" className="text-black hover:text-gray-700">Inversores</Link>
              <div className="relative whitespace-nowrap flex flex-col">
                <div className="flex items-center justify-between">
                  <Link href="/servicios" className="text-black hover:text-gray-700">
                    Servicios
                  </Link>
                  <button
                    onClick={() => toggleDropdown('servicios', !dropdownVisible.servicios)}
                    className="ml-2 text-black hover:text-gray-700"
                  >
                    <AiOutlineDown
                      className={`transition-transform duration-300 ${dropdownVisible.servicios ? 'rotate-180' : ''}`}
                      size={20}
                    />
                  </button>
                </div>
                {dropdownVisible.servicios && (
                  <div className="ml-4 mt-2 flex flex-col bg-black bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden">
                    <div className="border-b border-white/10">
                      <Link
                        href="/servicios/residentes-espana"
                        className="text-sm flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaHandshake className="mr-2 text-amarillo" />
                        Residentes en España
                      </Link>
                      <Link
                        href="/servicios/residentes-espana/alquiler"
                        className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaHome className="mr-2 text-amarillo" />
                        Alquiler
                      </Link>
                      <Link
                        href="/servicios/residentes-espana/guia-compra"
                        className="text-sm flex items-center px-8 py-2 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <FaHandshake className="mr-2 text-amarillo" />
                        Guía de compra
                      </Link>
                    </div>
                    <Link
                      href="/servicios/residentes-extranjero"
                      className="text-xs flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <FaChartLine className="mr-2 text-amarillo" />
                      Residentes en el extranjero
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/blog" className="text-black hover:text-gray-700">Blog</Link>
              <Link href="/contacto" className="text-black hover:text-gray-700">Contacto</Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
