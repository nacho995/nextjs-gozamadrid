"use client";
import React, { useState, useRef, useEffect } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { MdMeetingRoom } from "react-icons/md";
import { FaRestroom, FaBuilding, FaEuroSign, FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaRuler, FaBed, FaBath } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AnimatedOnScroll from "../AnimatedScroll";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, setHours, setMinutes } from "date-fns";
import es from "date-fns/locale/es";
import { toast } from "react-hot-toast";
import { sendPropertyEmail } from "@/pages/api";
import Head from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';

// Extraer datos de características de la propiedad
const extractPropertyData = (property) => {
  if (!property) {
    console.error("No se puede extraer datos de una propiedad que es null");
    return {
      livingArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      floor: 0
    };
  }

  try {
    // Para propiedades de WordPress (WooCommerce)
    if (property.source === 'woocommerce' || (!property.source && property.meta_data)) {
      console.log("Extrayendo datos de propiedad WooCommerce");
      
      let livingArea = 0;
      let bedrooms = 0;
      let bathrooms = 0;
      let floor = 0;
      
      // Buscar en meta_data los valores específicos
      if (property.meta_data && Array.isArray(property.meta_data)) {
        property.meta_data.forEach(meta => {
          if (meta.key === 'living_area' && meta.value) {
            livingArea = parseInt(meta.value, 10) || 0;
          }
          if (meta.key === 'bedrooms' && meta.value) {
            bedrooms = parseInt(meta.value, 10) || 0;
          }
          if (meta.key === 'baños' && meta.value && meta.value !== "-1") {
            bathrooms = parseInt(meta.value, 10) || 0;
          }
          if (meta.key === 'Planta' && meta.value) {
            floor = parseInt(meta.value, 10) || 0;
          }
        });
      }
      
      return {
        livingArea,
        bedrooms,
        bathrooms,
        floor
      };
    } 
    // Para propiedades de MongoDB
    else if (property.source === 'mongodb') {
      console.log("Extrayendo datos de propiedad MongoDB");
      return {
        livingArea: property.m2 || property.area || property.livingArea || property.size || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        floor: property.piso || property.floor || 0
      };
    } 
    // Fallback general
    else {
      console.log("Usando fallback para extracción de datos");
      return {
        livingArea: property.living_area || property.size || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || property.baños || 0,
        floor: property.floor || property.Planta || 0
      };
    }
  } catch (error) {
    console.error("Error al extraer datos de la propiedad:", error);
    return {
      livingArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      floor: 0
    };
  }
};

// Función para obtener la URL de la imagen a través del proxy
const getProxiedImageUrl = (originalUrl) => {
  if (!originalUrl) {
    return '/img/default-property-image.jpg';
  }
  
  // Si la URL ya es local o ya es un proxy, devolverla tal cual
  if (originalUrl.startsWith('/') || originalUrl.includes('/api/proxy-image')) {
    return originalUrl;
  }
  
  // Convertir a URL de proxy
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
};

export default function DefaultPropertyContent({ property }) {
  console.log("Renderizando PropertyContent con propiedad:", property ? `ID: ${property.id || property._id}` : 'null');
  
  const [current, setCurrent] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const calendarRef = useRef(null);
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const offerPanelRef = useRef(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyImages, setPropertyImages] = useState([]);
  const [cleanedContent, setCleanedContent] = useState("");
  const [propertyUrl, setPropertyUrl] = useState("");
  const [propertyData, setPropertyData] = useState({
    livingArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0
  });

  // Set the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPropertyUrl(window.location.href);
    }
  }, []);

  // Extraer y procesar los datos de la propiedad
  useEffect(() => {
    if (property) {
      // Extraer y configurar los datos de la propiedad
      const data = extractPropertyData(property);
      setPropertyData(data);
      console.log("Datos extraídos de la propiedad:", data);
    }
  }, [property]);

  // Procesar las imágenes de la propiedad
  useEffect(() => {
    if (!property) {
      console.error("No se recibieron datos de propiedad");
      return;
    }
    
    try {
      console.log("Procesando imágenes de propiedad:", property.title || property.name);
      
      let images = [];
      const defaultImage = {
        src: '/img/default-property-image.jpg',
        alt: 'Imagen por defecto',
        isDefault: true
      };
      
      // Procesar imágenes de WordPress
      if (property.source === 'woocommerce' || (!property.source && property.images)) {
        if (property.images && Array.isArray(property.images)) {
          // Convertir cada imagen a formato proxy
          images = property.images.map(img => {
            const imageUrl = img.src || (typeof img === 'string' ? img : '');
            // Usar imagen proxy para evitar errores CORS y HTTP2
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            
            return {
              src: proxyUrl,
              alt: img.alt || `${property.name || 'Propiedad'} - Imagen`,
              originalSrc: imageUrl
            };
          });
        }
      } 
      // Procesar imágenes de MongoDB
      else if (property.source === 'mongodb' && property.images) {
        if (Array.isArray(property.images)) {
          images = property.images.map(img => {
            const imageUrl = typeof img === 'string' ? img : (img.src || img.url || '');
            return {
              src: imageUrl,
              alt: `${property.title || 'Propiedad'} - Imagen`,
              originalSrc: imageUrl
            };
          });
        }
      }
      
      // Si no hay imágenes, usar imagen por defecto
      if (!images || images.length === 0) {
        console.log("No se encontraron imágenes. Usando imagen por defecto");
        images = [defaultImage];
      }
      
      console.log("Imágenes procesadas:", images.length);
      setPropertyImages(images);
      
    } catch (error) {
      console.error("Error al procesar imágenes de la propiedad:", error);
      setPropertyImages([{
        src: '/img/default-property-image.jpg',
        alt: 'Imagen por defecto',
        isDefault: true
      }]);
    }
  }, [property]);

  // Función para limpiar el contenido de WordPress
  useEffect(() => {
    if (!property) return;
    
    const cleanWordPressContent = (content) => {
      if (!content) return "";
      
      let cleanContent = content;
      
      // Eliminar shortcodes de WPBakery
      cleanContent = cleanContent.replace(/\[\/?vc_[^\]]*\]/g, "");
      cleanContent = cleanContent.replace(/\[\/?(fusion|vc)_[^\]]*\]/g, "");
      
      // Eliminar cualquier shortcode entre corchetes [] que pueda quedar
      cleanContent = cleanContent.replace(/\[[^\]]*\]/g, "");
      
      // Eliminar los botones "Mostrar más/Mostrar menos" que aparecen como texto
      cleanContent = cleanContent.replace(/Mostrar más|Mostrar menos/gi, "");
      cleanContent = cleanContent.replace(/Mostrar másMostrar menos/gi, "");
      
      // Eliminar también los botones con elementos HTML
      cleanContent = cleanContent.replace(/<button[^>]*>(Mostrar más|Mostrar menos)<\/button>/gi, "");
      cleanContent = cleanContent.replace(/<a[^>]*class="[^"]*mostrarmas[^"]*"[^>]*>.*?<\/a>/gi, "");
      cleanContent = cleanContent.replace(/<a[^>]*class="[^"]*mostrarmenos[^"]*"[^>]*>.*?<\/a>/gi, "");
      
      // Eliminar toda la sección de Ubicación completa (desde el h2 hasta el siguiente h2 o hasta el final)
      cleanContent = cleanContent.replace(/<h2[^>]*>Ubicación<\/h2>[\s\S]*?(?=<h2|$)/gi, "");
      
      // Eliminar específicamente la sección que usa el nombre en español
      cleanContent = cleanContent.replace(/<h2[^>]*>\s*Ubicación\s*<\/h2>[\s\S]*?(?=<h2|<div class="elementor|$)/gi, "");
      
      // Eliminar iframes de Google Maps más específicamente
      cleanContent = cleanContent.replace(/<iframe[^>]*google\.com\/maps[^>]*>[\s\S]*?<\/iframe>/gi, "");
      
      // Eliminar divs con clase "ubicacion"
      cleanContent = cleanContent.replace(/<div[^>]*class="[^"]*ubicacion[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
      
      // Eliminar secciones completas que contengan mapas o ubicación
      cleanContent = cleanContent.replace(/<section[^>]*class="[^"]*mapa[^"]*"[^>]*>[\s\S]*?<\/section>/gi, "");
      
      // Limpiar divs vacíos y espacios en blanco excesivos
      cleanContent = cleanContent.replace(/<div[^>]*>\s*<\/div>/g, "");
      cleanContent = cleanContent.replace(/\s{2,}/g, " ");
      
      // Add more semantic HTML structure
      cleanContent = cleanContent.replace(/<p/g, '<p class="mb-4"');
      cleanContent = cleanContent.replace(/<ul/g, '<ul class="ml-6 mb-6 list-disc"');
      cleanContent = cleanContent.replace(/<h2/g, '<h2 class="text-2xl font-bold mb-4 mt-8"');
      
      return cleanContent;
    };
    
    // Procesar el contenido según el tipo de propiedad
    let processedContent = "";
    
    if (property.source === 'woocommerce' || property.id) {
      processedContent = cleanWordPressContent(property.description || property.content || "");
    } else {
      // Para MongoDB no necesitamos limpiar tanto, pero podemos aplicar algunas mejoras básicas
      processedContent = property.description || "";
    }
    
    // Actualizar el estado con el contenido procesado
    setCleanedContent(processedContent);
  }, [property]);

  // Actualizar el manejo de errores de imágenes
  const handleImageError = (e) => {
    console.error("Error al cargar imagen:", e.target.src);
    e.target.src = '/img/default-property-image.jpg';
    e.target.alt = 'Imagen por defecto (error al cargar)';
  };

  // Función para avanzar a la siguiente imagen
  const nextImage = () => {
    setCurrent((current + 1) % propertyImages.length);
  };

  // Función para retroceder a la imagen anterior
  const prevImage = () => {
    setCurrent((current - 1 + propertyImages.length) % propertyImages.length);
  };

  // Función para generar rangos de ofertas
  const generateOfferRanges = (price) => {
    // Si el precio es una cadena formateada (ej: "350.000 €"), extraer el valor numérico
    let numericPrice;
    
    if (typeof price === 'string') {
      // Eliminar símbolos de moneda, puntos y espacios
      const cleanPrice = price.replace(/[€$.\s]/g, '').replace(',', '.');
      numericPrice = parseFloat(cleanPrice);
    } else {
      numericPrice = price;
    }
    
    if (isNaN(numericPrice) || numericPrice <= 0) return [];
    
    const ranges = [];
    
    // Ofertas por debajo del precio
    ranges.push({
      label: "5% menos",
      value: Math.round(numericPrice * 0.95),
      percentage: -5
    });
    
    ranges.push({
      label: "10% menos",
      value: Math.round(numericPrice * 0.9),
      percentage: -10
    });
    
    // Precio exacto
    ranges.push({
      label: "Precio publicado",
      value: numericPrice,
      percentage: 0
    });
    
    return ranges;
  };

  if (!property) {
    console.log("Renderizando estado de propiedad no disponible");
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg">Información de la propiedad no disponible</p>
      </div>
    );
  }

  console.log("Renderizando propiedad completa:", property.title || property.name);
  console.log("Imágenes disponibles:", propertyImages.length);
  
  // Extraer datos básicos de la propiedad
  const title = property.title || property.name || 'Propiedad sin título';
  const description = cleanedContent || property.description || '';
  
  // Formatear el precio correctamente
  let priceValue = property.price;
  let formattedPrice = 'Consultar precio';
  
  if (priceValue) {
    // Si es un string, intentar convertirlo a número para formatear
    if (typeof priceValue === 'string') {
      // Eliminar cualquier carácter que no sea número o punto
      const cleanPrice = priceValue.replace(/[^\d.-]/g, '');
      
      // Convertir a número
      const numericPrice = parseFloat(cleanPrice);
      
      if (!isNaN(numericPrice)) {
        // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
        // Esto es para corregir casos donde el precio se guarda como "350" en lugar de "350000"
        const adjustedPrice = numericPrice < 10000 ? numericPrice * 1000 : numericPrice;
        
        // Formatear con separador de miles
        formattedPrice = new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(adjustedPrice);
      } else {
        // Si no se puede convertir a número, usar el string original
        formattedPrice = priceValue;
      }
    } else if (typeof priceValue === 'number') {
      // Si ya es un número, formatear directamente
      // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
      const adjustedPrice = priceValue < 10000 ? priceValue * 1000 : priceValue;
      
      formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(adjustedPrice);
    }
  }
  
  const location = property.location || 'Madrid, España';
  const propertyType = property.type || 'Propiedad';

  return (
    <>
      {/* Add Head with SEO meta tags */}
      <Head>
        <title>{title} | Propiedad en {location}</title>
        <meta name="description" content={`${propertyType} en ${location}. ${propertyData.bedrooms > 0 ? propertyData.bedrooms + ' habitaciones, ' : ''}${propertyData.bathrooms > 0 ? propertyData.bathrooms + ' baños, ' : ''}${propertyData.livingArea > 0 ? propertyData.livingArea + ' m². ' : ''}${cleanedContent ? cleanedContent.replace(/<[^>]*>/g, '').substring(0, 120) : ''}...`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={propertyUrl} />
        
        {/* OpenGraph tags for social sharing */}
        <meta property="og:title" content={`${title} | ${formattedPrice}`} />
        <meta property="og:description" content={`${propertyType} en ${location}. ${cleanedContent ? cleanedContent.replace(/<[^>]*>/g, '').substring(0, 150) : ''}...`} />
        <meta property="og:image" content={propertyImages && propertyImages.length > 0 ? propertyImages[0].src : '/img/default-property-image.jpg'} />
        <meta property="og:url" content={propertyUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | ${formattedPrice}`} />
        <meta name="twitter:description" content={`${propertyType} en ${location}. ${cleanedContent ? cleanedContent.replace(/<[^>]*>/g, '').substring(0, 120) : ''}...`} />
        <meta name="twitter:image" content={propertyImages && propertyImages.length > 0 ? propertyImages[0].src : '/img/default-property-image.jpg'} />
        
        {/* Schema.org JSON-LD structured data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": title,
            "description": cleanedContent.replace(/<[^>]*>/g, '').substring(0, 500) + '...',
            "url": propertyUrl,
            "image": propertyImages.length > 0 ? propertyImages[0].src : null,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": location || "Madrid",
              "addressRegion": "Madrid",
              "addressCountry": "ES"
            },
            "offers": {
              "@type": "Offer",
              "price": typeof formattedPrice === 'string' ? formattedPrice.replace(/[^\d]/g, '') : formattedPrice,
              "priceCurrency": "EUR"
            },
            "numberOfRooms": propertyData?.bedrooms !== 0 ? propertyData.bedrooms : undefined,
            "numberOfBathroomsTotal": propertyData?.bathrooms !== 0 ? propertyData.bathrooms : undefined,
            "floorSize": {
              "@type": "QuantitativeValue",
              "value": propertyData?.livingArea !== 0 ? propertyData.livingArea : undefined,
              "unitCode": "MTK"  // Square meters according to UN/CEFACT
            }
          }) }}
        />
      </Head>
    
      <div className="container mx-auto px-4 py-8">
        <article className="relative" itemScope itemType="https://schema.org/RealEstateListing">
          {/* Hidden SEO metadata */}
          <meta itemProp="name" content={title} />
          <meta itemProp="description" content={cleanedContent?.replace(/<[^>]*>/g, '').substring(0, 500)} />
          <meta itemProp="url" content={propertyUrl} />

          {/* Contenedor principal de imágenes */}
          <section aria-label="Galería de imágenes" className="flex flex-col mb-8">
            {/* Imagen principal arriba */}
            <div className="relative w-full h-[60vh] mb-8 rounded-xl overflow-hidden shadow-xl">
              {propertyImages && propertyImages.length > 0 && propertyImages[current] ? (
                <motion.img
                  key={current}
                  src={propertyImages[current].src}
                  alt={propertyImages[current].alt}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onError={handleImageError}
                />
              ) : (
                <img 
                  src="/img/default-property-image.jpg" 
                  alt="Imagen por defecto"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg hidden sm:block">
              <div className="flex flex-wrap justify-center gap-2">
                {propertyImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`relative w-[80px] h-[60px] md:w-[100px] md:h-[75px] rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === current
                        ? "border-amarillo shadow-md scale-105"
                        : "border-gray-200 hover:border-amarillo/50 hover:shadow-sm hover:scale-105"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                      data-original-src={image.originalSrc || ""}
                      data-is-proxied={image.isProxied ? "true" : "false"}
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Información principal */}
          <div className="mt-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 mt-4">
              <h2 className="text-2xl font-bold mb-4">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {propertyData?.livingArea > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg shadow">
                    <FaRuler className="text-2xl text-primary" />
                    <div>
                      <p className="text-lg font-medium">{propertyData.livingArea} m²</p>
                      <p className="text-sm text-gray-500">Superficie</p>
                    </div>
                  </div>
                )}
                
                {propertyData?.bedrooms > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg shadow">
                    <FaBed className="text-2xl text-primary" />
                    <div>
                      <p className="text-lg font-medium">{propertyData.bedrooms}</p>
                      <p className="text-sm text-gray-500">Habitaciones</p>
                    </div>
                  </div>
                )}
                
                {propertyData?.bathrooms > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg shadow">
                    <FaBath className="text-2xl text-primary" />
                    <div>
                      <p className="text-lg font-medium">{propertyData.bathrooms}</p>
                      <p className="text-sm text-gray-500">Baños</p>
                    </div>
                  </div>
                )}
                
                {propertyData?.floor > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg shadow">
                    <FaBuilding className="text-2xl text-primary" />
                    <div>
                      <p className="text-lg font-medium">{propertyData.floor}ª</p>
                      <p className="text-sm text-gray-500">Planta</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <FaEuroSign className="text-amber-400 text-lg sm:text-xl" />
              <p className="text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white" itemProp="offers">{formattedPrice}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Descripción</h2>
            <div 
              className="prose prose-lg max-w-none 
                text-black dark:text-white 
                dark:prose-headings:text-white 
                dark:prose-h1:text-white dark:prose-h2:!text-white dark:prose-h3:text-white
                dark:prose-p:text-white 
                dark:prose-li:text-white 
                dark:prose-strong:!text-white
                dark:prose-a:text-amarillo
                dark:prose-code:text-white
                dark:prose-figcaption:text-white
                dark:prose-blockquote:text-white" 
              dangerouslySetInnerHTML={{ __html: cleanedContent }} 
              itemProp="description"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8 mt-8">
            <button
              onClick={() => setShowCalendar(true)}
              className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm"
            >
              <FaCalendarAlt className="text-base sm:text-lg text-black dark:text-white" />
              <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                Agendar una visita
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
            </button>

            <button
              onClick={() => setShowOfferPanel(true)}
              className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm"
            >
              <FaHandshake className="text-base sm:text-lg text-black dark:text-white" />
              <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                Hacer Oferta
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
            </button>
          </div>
        </article>

        {/* Calendario de visitas */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              ref={calendarRef} 
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-auto shadow-lg overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 text-black dark:text-white hover:text-amarillo dark:hover:text-amarillo transition-colors duration-300"
              >
                <FaTimes className="text-xl" />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Agenda una visita</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona un día</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    filterDate={date => date >= new Date() && date.getDay() !== 0 && date.getDay() !== 6}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                    locale={es}
                    placeholderText="Selecciona una fecha"
                    className="w-full p-2 border rounded-lg text-black bg-white dark:text-white dark:bg-gray-800"
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona una hora</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 10 }, (_, i) => {
                        const time = setHours(setMinutes(new Date(), 0), i + 9);
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedTime && time.getHours() === selectedTime.getHours()
                                ? "bg-amarillo text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-black"
                            }`}
                          >
                            {time.getHours()}:00
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-amarillo">
                      <FaUser className="mr-2 text-amarillo" />
                      Datos de contacto
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email de contacto"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                      />
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && email && name && phone && (
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Solicitud de visita enviada");
                        setShowCalendar(false);
                        setSelectedDate(null);
                        setSelectedTime(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amarillo text-black font-medium hover:bg-amarillo/90 transition-all duration-300 hover:scale-105"
                    >
                      Confirmar Visita
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mapa de Google */}
        <div className="mt-8 bg-white dark:bg-gray-900 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-amarillo">Ubicación</h2>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(
                title + ', ' + location
              )}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg shadow-md"
            ></iframe>
          </div>
        </div>

        {/* Sección de preguntas */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg p-8 text-center mt-8">
          <h3 className="text-2xl font-semibold text-black dark:text-amarillo mb-6">¿Tienes preguntas sobre esta propiedad?</h3>
          <Link href="/contacto">
            <button className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm">
              <FaEnvelope className="text-base sm:text-lg text-black dark:text-white" />
              <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                Contáctanos
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
            </button>
          </Link>
        </div>

        {/* Panel de ofertas */}
        {showOfferPanel && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              ref={offerPanelRef} 
              className="bg-white dark:bg-black rounded-xl p-6 max-w-sm w-full mx-auto relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowOfferPanel(false)}
                className="absolute top-4 right-4 text-black dark:text-white hover:text-amarillo dark:hover:text-amarillo transition-colors duration-300"
              >
                <FaTimes className="text-xl" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Hacer una oferta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona tu oferta</label>
                  <div className="space-y-2">
                    {generateOfferRanges(formattedPrice).map((range, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedOffer(range)}
                        className={`w-full p-3 rounded-lg transition-all duration-300 flex justify-between items-center ${
                          selectedOffer?.percentage === range.percentage 
                            ? "bg-amarillo text-black font-semibold"
                            : "bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                        }`}
                      >
                        <span>{range.label}</span>
                        <span className="font-semibold">{Math.round(range.value).toLocaleString()}€</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Introduce tu oferta</label>
                  <input
                    type="number"
                    placeholder="Introduce tu oferta"
                    className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                    onChange={(e) =>
                      setSelectedOffer({
                        value: parseInt(e.target.value),
                        label: "Oferta personalizada",
                      })
                    }
                  />
                </div>
              </div>
              {selectedOffer && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-amarillo">
                    <FaUser className="mr-2 text-amarillo" />
                    Datos de contacto
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email de contacto"
                      className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Teléfono"
                      className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                    />
                  </div>
                </div>
              )}
              {selectedOffer && email && name && phone && (
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowOfferPanel(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      toast.success("Oferta enviada con éxito");
                      setShowOfferPanel(false);
                      setSelectedOffer(null);
                      setEmail("");
                      setName("");
                      setPhone("");
                    }}
                    className="px-4 py-2 rounded-lg bg-amarillo text-black font-medium hover:bg-amarillo/90 transition-all duration-300"
                  >
                    Enviar Oferta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

