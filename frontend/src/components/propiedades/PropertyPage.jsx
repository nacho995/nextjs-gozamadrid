"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import AnimatedOnScroll from "../AnimatedScroll";

// Estilos consistentes con el resto de la web
const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' };

// Componente de Paginación
const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const router = useRouter();
  
  // Función para obtener todos los números de página
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Primero actualizamos el estado local
      onPageChange(page);
      
      // Luego navegamos con un pequeño retraso para permitir que el estado se actualice
      setTimeout(() => {
        router.push({
          pathname: router.pathname,
          query: { ...router.query, page }
        }, undefined, { scroll: true });  // Esto asegura que la página se desplace hacia arriba
      }, 10);
    }
  };

  return (
    <div className="grid md:grid-cols-12 grid-cols-1 mt-6">
      <div className="md:col-span-12 text-center">
        <nav aria-label="Navegación de páginas">
          <ul className="inline-flex flex-wrap items-center gap-2 justify-center">
            {/* Botón Anterior */}
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 inline-flex justify-center items-center rounded-full 
                  ${currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo transition-colors'} 
                  shadow-sm`}
              >
                <i className="mdi mdi-chevron-left text-[20px]"></i>
              </button>
            </li>

            {/* Todos los números de página */}
            {getPageNumbers().map((pageNumber) => (
              <li key={pageNumber}>
                <button
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 inline-flex justify-center items-center rounded-full
                    ${pageNumber === currentPage
                      ? 'text-white bg-black hover:bg-gold'
                      : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo'} 
                    transition-colors shadow-sm`}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            {/* Botón Siguiente */}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 inline-flex justify-center items-center rounded-full 
                  ${currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-slate-400 bg-white hover:text-white hover:bg-amarillo transition-colors'} 
                  shadow-sm`}
              >
                <i className="mdi mdi-chevron-right text-[20px]"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

// Función para transformar URLs de imágenes
const getProxiedImageUrl = (url) => {
  if (!url) return "/fondoamarillo.jpg";
  if (url.startsWith('/')) return url; // Imágenes locales
  
  // Para imágenes externas, usar un servicio de proxy
  // Esta es una solución temporal hasta que actualices next.config.js
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=webp`;
};

export default function PropertyPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Modificar el número de propiedades por página
  const propertiesPerPage = 10;

  // Modifica este useEffect para manejar mejor los estados
  useEffect(() => {
    // Evitar procesamiento antes de que el router esté listo
    if (!router.isReady) return;
    
    const fetchPropertiesData = async () => {
      // Si ya estamos cargando, no hacer nada
      if (loading) return;
      
      // Obtener el número de página actual de la URL
      const pageToLoad = router.query.page ? parseInt(router.query.page) : 1;
      
      // Solo cargar si no estamos en la misma página o es la carga inicial
      if (pageToLoad !== currentPage || properties.length === 0) {
        setLoading(true);
        console.log(`Cargando página ${pageToLoad}...`);
        
        try {
          const response = await fetch(
            `https://realestategozamadrid.com/wp-json/wc/v3/products?consumer_key=ck_3efe242c61866209c650716bed69999cbf00a09c&consumer_secret=cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d&page=${pageToLoad}&per_page=${propertiesPerPage}`
          );
          
          if (!response.ok) {
            throw new Error(`Error al cargar propiedades: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`Propiedades recibidas: ${data.length}`);
          
          setProperties(data);
          setCurrentPage(pageToLoad); // Actualizar currentPage después de cargar los datos
          
          const totalPagesHeader = response.headers.get('X-WP-TotalPages');
          setTotalPages(parseInt(totalPagesHeader) || 1);
        } catch (error) {
          console.error("Error al cargar propiedades:", error);
          setError("No pudimos cargar las propiedades. Por favor, intenta de nuevo más tarde.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPropertiesData();
  }, [router.isReady, router.query.page]);

  // Filtrar propiedades asegurando que properties es un array
  const filteredProperties = Array.isArray(properties) 
    ? properties.filter((property) =>
        property.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Función simplificada para el manejo del cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage) return;
    
    setCurrentPage(pageNumber); // Actualizar inmediatamente el currentPage
    // No necesitas hacer fetchProperties aquí, el useEffect se encargará de eso
  };

  // Eliminar useCallback para getCurrentProperties
  const getCurrentProperties = () => {
    return filteredProperties;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mb-4"></div>
            <p className="text-lg text-white" style={textShadowStyle}>Cargando propiedades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center max-w-xl">
          <h2 className="text-2xl font-bold text-white mb-4" style={textShadowStyle}>
            Algo salió mal
          </h2>
          <p className="text-white/90 mb-6" style={textShadowLightStyle}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay propiedades para mostrar
  if (properties.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="relative h-[40vh] mb-16 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
          <Image
            src="/real-estate.jpg"
            alt="Propiedades Inmobiliarias"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="text-white ml-4 sm:ml-8 md:ml-12 max-w-2xl">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                style={textShadowStyle}
              >
                Nuestras Propiedades
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl" style={textShadowLightStyle}>
                No hay propiedades disponibles en este momento. Por favor, vuelve a consultar más tarde.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fondo */}
      <div 
        className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
        style={{
          backgroundImage: "url('/gozamadridwp2.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>

      <div className="relative min-h-screen py-8">
        <AnimatedOnScroll>
          <div className="relative container mx-auto px-3">
            {/* Encabezado y Breadcrumbs */}
            <div className="layout-specing">
              <div className="md:flex justify-center items-center">
                <h5 className="text-3xl  font-semibold">Explora nuestras propiedades</h5>
              </div>

              {/* Buscador por dirección */}
              <div className="mb-8 flex justify-center">
                <input
                  type="text"
                  placeholder="Buscar por dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Lista de propiedades en grid */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mt-6">
                  {getCurrentProperties().map((item, index) => {
                    // Adaptación para productos de WooCommerce
                    // Para las imágenes 
                    const imageUrl = item.images && item.images.length > 0
                      ? getProxiedImageUrl(item.images[0].src)
                      : "/fondoamarillo.jpg";
                    
                    // Para el título
                    const title = item.name || "Propiedad";
                    
                    // Para la ubicación
                    const location = item.short_description 
                      ? item.short_description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 30) + "..." 
                      : "Madrid, España";
                    
                    // Mejora en la extracción de datos de habitaciones y baños
                    let bedrooms = "Consultar";
                    let bathrooms = "Consultar";
                    
                    // Intentar obtener de los atributos (primera opción)
                    if (item.attributes && Array.isArray(item.attributes)) {
                      // Buscar por nombre exacto
                      const bedroomsAttr = item.attributes.find(attr => 
                        attr.name === "Habitaciones" || 
                        attr.name.toLowerCase() === "habitaciones" ||
                        attr.name === "Dormitorios" ||
                        attr.name.toLowerCase() === "dormitorios"
                      );
                      
                      const bathroomsAttr = item.attributes.find(attr => 
                        attr.name === "Baños" || 
                        attr.name.toLowerCase() === "baños" ||
                        attr.name === "Banos" ||
                        attr.name.toLowerCase() === "banos"
                      );
                      
                      if (bedroomsAttr && bedroomsAttr.options && bedroomsAttr.options.length > 0) {
                        bedrooms = bedroomsAttr.options[0];
                      }
                      
                      if (bathroomsAttr && bathroomsAttr.options && bathroomsAttr.options.length > 0) {
                        bathrooms = bathroomsAttr.options[0];
                      }
                    }
                    
                    // Intentar obtener de metadatos si los atributos no funcionaron
                    if (bedrooms === "Consultar" && item.meta_data) {
                      const bedroomsMeta = item.meta_data.find(meta => 
                        meta.key === "_bedrooms" || 
                        meta.key === "bedrooms" || 
                        meta.key.includes("habitacion") || 
                        meta.key.includes("dormitor")
                      );
                      
                      if (bedroomsMeta && bedroomsMeta.value) {
                        bedrooms = bedroomsMeta.value;
                      }
                    }
                    
                    if (bathrooms === "Consultar" && item.meta_data) {
                      const bathroomsMeta = item.meta_data.find(meta => 
                        meta.key === "_bathrooms" || 
                        meta.key === "bathrooms" || 
                        meta.key.includes("bano") || 
                        meta.key.includes("baño")
                      );
                      
                      if (bathroomsMeta && bathroomsMeta.value) {
                        bathrooms = bathroomsMeta.value;
                      }
                    }
                    
                    // Si todavía no tenemos los datos, intentar extraerlos de la descripción o título
                    if (bedrooms === "Consultar" && item.description) {
                      const bedroomsMatch = item.description.match(/(\d+)\s*habitacion(es)?/i) || 
                                           item.description.match(/(\d+)\s*dormitorio(s)?/i);
                      if (bedroomsMatch) {
                        bedrooms = bedroomsMatch[1];
                      }
                    }
                    
                    if (bathrooms === "Consultar" && item.description) {
                      const bathroomsMatch = item.description.match(/(\d+)\s*baño(s)?/i) || 
                                            item.description.match(/(\d+)\s*bano(s)?/i);
                      if (bathroomsMatch) {
                        bathrooms = bathroomsMatch[1];
                      }
                    }
                    
                    // Último recurso - si el título contiene la información
                    if (bedrooms === "Consultar" && title) {
                      const titleBedroomsMatch = title.match(/(\d+)\s*hab/i) || title.match(/(\d+)\s*dorm/i);
                      if (titleBedroomsMatch) {
                        bedrooms = titleBedroomsMatch[1];
                      }
                    }
                    
                    if (bathrooms === "Consultar" && title) {
                      const titleBathroomsMatch = title.match(/(\d+)\s*baño/i) || title.match(/(\d+)\s*bano/i);
                      if (titleBathroomsMatch) {
                        bathrooms = titleBathroomsMatch[1];
                      }
                    }
                    
                    const price = item.price 
                      ? `${parseInt(item.price).toLocaleString('es-ES')}€` 
                      : "Consultar";

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.03]"
                      >
                        <Link
                          href={`/property/${item.id}`}
                          className="group block rounded-xl dark:text-white dark:hover:text-black bg-white dark:bg-slate-900 shadow hover:bg-gold dark:hover:shadow-xl dark:shadow-gray-700 dark:hover:shadow-gray-700 overflow-hidden ease-in-out duration-500"
                        >
                          <div className="relative">
                            <div className="relative w-full aspect-video">
                              {imageUrl.startsWith('http') ? (
                                // Para imágenes externas, usar un elemento img regular
                                <img 
                                  src={imageUrl}
                                  alt={title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                // Para imágenes locales, usar Next Image
                                <Image
                                  src={imageUrl}
                                  width={0}
                                  height={0}
                                  sizes="100vw"
                                  style={{ width: "100%", height: "auto" }}
                                  alt={title}
                                />
                              )}
                            </div>

                            <div className="absolute top-4 end-4">
                              <Link
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Aquí la lógica para "like" si lo deseas
                                }}
                                className="btn btn-icon bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-full text-slate-100 dark:text-slate-700 focus:text-red-600 dark:focus:text-red-600 hover:text-red-600 dark:hover:text-red-600"
                              >
                                <i className="mdi mdi-heart text-[20px]"></i>
                              </Link>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="pb-6">
                              <h3 className="text-lg hover:text-amarillo font-medium ease-in-out duration-500">
                                {title}
                              </h3>
                            </div>

                            <ul className="py-6 border-y border-slate-100 dark:border-gray-800 flex items-center list-none">
                              <li className="flex items-center me-4">
                                <i className="mdi mdi-arrow-expand-all text-2xl me-2 text-amarillo"></i>
                                <span>{location}</span>
                              </li>
                              <li className="flex items-center me-4">
                                <i className="mdi mdi-bed text-2xl me-2 text-amarillo"></i>
                                <span>{bedrooms} habitaciones</span>
                              </li>
                              <li className="flex items-center">
                                <i className="mdi mdi-shower text-2xl me-2 text-amarillo"></i>
                                <span>{bathrooms} baños</span>
                              </li>
                            </ul>

                            <ul className="pt-6 flex justify-between items-center list-none">
                              <li>
                                <span>Price</span>
                                <p className="text-lg font-medium">{price}</p>
                              </li>

                              <li>
                                <span>Rating</span>
                                <ul className="text-lg font-medium list-none">
                                  <li className="inline">
                                    <i className="mdi mdi-star"></i>
                                  </li>
                                  <li className="inline">
                                    <i className="mdi mdi-star"></i>
                                  </li>
                                  <li className="inline">
                                    <i className="mdi mdi-star"></i>
                                  </li>
                                  <li className="inline">
                                    <i className="mdi mdi-star"></i>
                                  </li>
                                  <li className="inline">
                                    <i className="mdi mdi-star"></i>
                                  </li>
                                  <li className="inline">5.0(30)</li>
                                </ul>
                              </li>
                            </ul>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No hay propiedades disponibles.
                </p>
              )}

              {/* Componente de paginación */}
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </AnimatedOnScroll>
      </div>
    </>
  );
}
