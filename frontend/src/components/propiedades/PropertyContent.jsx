"use client";
import React, { useState, useRef, useEffect } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { MdMeetingRoom } from "react-icons/md";
import { FaRestroom, FaBuilding, FaEuroSign, FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AnimatedOnScroll from "../AnimatedScroll";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, setHours, setMinutes } from "date-fns";
import es from "date-fns/locale/es";
import { toast } from "react-hot-toast";
import { sendPropertyEmail, getPropertyById } from "@/pages/api";
import Head from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';

export default function DefaultPropertyContent({ property }) {
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
  const [propertyData, setPropertyData] = useState(property);
  const [loading, setLoading] = useState(false);
  const [cleanedContent, setCleanedContent] = useState("");
  const [propertyUrl, setPropertyUrl] = useState("");

  // Determinar si es una propiedad de WordPress o de MongoDB
  const isWordPressProperty = propertyData?.id && !propertyData?._id;
  const isMongoDBProperty = propertyData?._id;

  // Set the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPropertyUrl(window.location.href);
    }
  }, []);

  // Efecto para cargar los datos completos de la propiedad
  useEffect(() => {
    const fetchPropertyData = async () => {
    if (!property) return;
      
      try {
        setLoading(true);
        // Obtener el ID de la propiedad
        const propertyId = property._id || property.id;
        
        if (!propertyId) {
          console.error("No se pudo determinar el ID de la propiedad");
          setLoading(false);
          return;
        }
        
       
        
        // Obtener los datos completos de la propiedad
        const fullPropertyData = await getPropertyById(propertyId);
        
        if (fullPropertyData) {
         
          setPropertyData(fullPropertyData);
        } else {
          console.error("No se pudieron obtener los datos completos de la propiedad");
        }
      } catch (error) {
        console.error("Error al obtener datos de la propiedad:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [property?._id, property?.id]);

  // Función para limpiar el contenido de WordPress
  useEffect(() => {
    if (!propertyData) return;
    
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
    
    if (isWordPressProperty) {
      processedContent = cleanWordPressContent(propertyData.description || propertyData.content?.rendered || "");
    } else if (isMongoDBProperty) {
      // Para MongoDB no necesitamos limpiar tanto, pero podemos aplicar algunas mejoras básicas
      processedContent = propertyData.description || "";
    }
    
    // Actualizar el estado con el contenido procesado
    setCleanedContent(processedContent);
  }, [propertyData, isWordPressProperty, isMongoDBProperty]);

  // Extraer y procesar datos de la propiedad
  let title, content, excerpt, price, bedrooms, bathrooms, area, location, propertyType, images;

  if (isWordPressProperty) {
    // Para propiedades de WordPress
    title = propertyData.name || "Propiedad sin título";
    content = propertyData.description || propertyData.content?.rendered || "";
    excerpt = propertyData.short_description || "Ubicación no disponible";
    price = propertyData.price || "Consultar precio";
    bedrooms = "Consultar";
    bathrooms = "Consultar";
    area = "Consultar";
    location = propertyData.address || "Madrid, España";
    propertyType = "Propiedad";

    // Extraer habitaciones y baños de los metadatos o atributos
    if (propertyData.meta_data) {
      const bedroomsMeta = propertyData.meta_data.find(meta => 
        meta.key === "bedrooms" || meta.key === "habitaciones"
      );
      if (bedroomsMeta && bedroomsMeta.value) {
        bedrooms = bedroomsMeta.value;
      }
      
      const bathroomsMeta = propertyData.meta_data.find(meta => 
        meta.key === "baños" || meta.key === "bathrooms" || meta.key === "banos"
      );
      if (bathroomsMeta && bathroomsMeta.value && bathroomsMeta.value !== "-1") {
        bathrooms = bathroomsMeta.value;
      }
      
      const areaMeta = propertyData.meta_data.find(meta => 
        meta.key === "area" || meta.key === "superficie" || meta.key === "m2"
      );
      if (areaMeta && areaMeta.value) {
        area = areaMeta.value;
      }
    }
  } else if (isMongoDBProperty) {
    // Para propiedades de MongoDB
    title = propertyData.title || propertyData.typeProperty || "Propiedad sin título";
    content = propertyData.description || "";
    excerpt = propertyData.address || "Ubicación no disponible";
    
    // Procesar el precio
    price = propertyData.price || "Consultar precio";
    if (price && !isNaN(parseFloat(price)) && parseFloat(price) < 1000) {
      // Si el precio es un número pequeño (menos de 1000), multiplicar por 1000
      price = parseFloat(price) * 1000;
    }
    
    // Formatear el precio
    if (typeof price === 'number' || !isNaN(parseFloat(price))) {
      price = new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(parseFloat(price));
    }
    
    // Extraer otros datos
    bedrooms = propertyData.bedrooms || propertyData.rooms || "Consultar";
    bathrooms = propertyData.bathrooms || propertyData.wc || "Consultar";
    area = propertyData.area || propertyData.m2 || "Consultar";
    location = propertyData.address || "Madrid, España";
    propertyType = propertyData.typeProperty || "Propiedad";
  } else {
    // Valores por defecto si no se puede determinar el tipo
    title = propertyData.title || propertyData.name || "Propiedad sin título";
    content = propertyData.description || propertyData.content?.rendered || "";
    excerpt = propertyData.address || propertyData.short_description || "Ubicación no disponible";
    price = propertyData.price || "Consultar precio";
    bedrooms = propertyData.bedrooms || "Consultar";
    bathrooms = propertyData.bathrooms || "Consultar";
    area = propertyData.area || "Consultar";
    location = propertyData.address || "Madrid, España";
    propertyType = propertyData.typeProperty || "Propiedad";
  }

  // Procesar imágenes
  useEffect(() => {
    if (!propertyData) return;
    
    
    
    let images = [];
    
    if (isWordPressProperty && propertyData.images && Array.isArray(propertyData.images) && propertyData.images.length > 0) {
     
      
      // Prevenir doble proxying
      images = propertyData.images.map(img => {
        // Determinar si la imagen ya está siendo procesada por el proxy
        const isAlreadyProxied = img.src && img.src.includes('/api/image-proxy');
        
        // Si ya está proxificada, usar la URL tal cual
        const imageSrc = isAlreadyProxied 
          ? img.src 
          : `/api/image-proxy?url=${encodeURIComponent(img.src)}`;
        
        return {
          src: imageSrc,
          alt: img.name || title || "Imagen de propiedad",
          originalSrc: img.src,
          isProxied: imageSrc !== img.src // Marcar si ya está proxificada
        };
      });
    } else if (isMongoDBProperty && propertyData.images && Array.isArray(propertyData.images)) {
    
      
      // Manejar diferentes formatos de imágenes en MongoDB
      images = propertyData.images.map(img => {
        let imageSrc, imgAlt;
        
        if (typeof img === 'string') {
          imageSrc = img;
          imgAlt = title || "Imagen de propiedad";
        } else if (img.src) {
          imageSrc = img.src;
          imgAlt = img.alt || title || "Imagen de propiedad";
        } else if (img.url) {
          imageSrc = img.url;
          imgAlt = img.alt || title || "Imagen de propiedad";
        } else {
          imageSrc = "/fondoamarillo.jpg";
          imgAlt = "Imagen no disponible";
        }
        
        return {
          src: imageSrc,
          alt: imgAlt,
          originalSrc: imageSrc,
          isProxied: false
        };
      });
    } else {
      images = [{ 
        src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format", 
        alt: "Imagen no disponible para " + (title || "esta propiedad"),
        isProxied: false
      }];
    }
    
    
    setPropertyImages(images);
  }, [propertyData?.id, propertyData?._id, isWordPressProperty, isMongoDBProperty, title]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (offerPanelRef.current && !offerPanelRef.current.contains(event.target)) {
        setShowOfferPanel(false);
      }
    }

    if (showOfferPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOfferPanel]);

  useEffect(() => {
    if (propertyImages.length > 0 && current >= propertyImages.length) {
      setCurrent(0);
    }
  }, [propertyImages, current]);

  // Prepare schema.org JSON-LD data
  const propertySchema = {
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
      "price": typeof price === 'string' ? price.replace(/[^\d]/g, '') : price,
      "priceCurrency": "EUR"
    },
    "numberOfRooms": bedrooms !== "Consultar" ? bedrooms : undefined,
    "numberOfBathroomsTotal": bathrooms !== "Consultar" ? bathrooms : undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": area !== "Consultar" ? area : undefined,
      "unitCode": "MTK"  // Square meters according to UN/CEFACT
    }
  };

  if (!propertyData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-white/80">No se encontró información de la propiedad</p>
      </div>
    );
  }

  const filterAvailableDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0 && date.getDay() !== 6;
  };

  const availableTimes = Array.from({ length: 10 }, (_, i) => {
    return setHours(setMinutes(new Date(), 0), i + 9);
  });

  const handleVisitSubmit = async () => {
    // Mostrar toast de confirmación inmediatamente 
    toast.success("Solicitud de visita enviada");
    
    // Cerrar el modal inmediatamente
    setShowCalendar(false);
    setSelectedDate(null);
    setSelectedTime(null);
    
    // Enviar datos en segundo plano
    try {
      if (!propertyData || !propertyData.id || !selectedDate || !selectedTime) {
        console.error("Datos incompletos");
        return;
      }

      const formData = {
        property: propertyData.id,
        propertyAddress: location,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime.toISOString(),
        email,
        name,
        phone,
        contactPreference: "email" // Añadido para mejorar la comunicación
      };

      

      // Usar AbortController para limitar el tiempo máximo de espera
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos máximo
      
      // Enviar la solicitud con manejo mejorado de errores
      fetch(`${API_URL}/api/property-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          console.log("✅ Solicitud enviada con éxito:", data.message);
        } else {
          // Guardar localmente para reintentar más tarde
          saveLocalRequest(formData);
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error("❌ Error de envío:", error.message);
        // Guardar localmente para reintentar más tarde
        saveLocalRequest(formData);
      });
      
    } catch (error) {
      console.error("❌ Error:", error);
      // Guardar localmente para reintentar más tarde
      saveLocalRequest(formData);
    }
  };

  // Función para guardar solicitudes localmente
  const saveLocalRequest = (data) => {
    try {
      const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
      pendingRequests.push({
        type: 'propertyVisit',
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
      
    } catch (e) {
      console.error("❌ Error al guardar solicitud localmente:", e);
    }
  };

  const handleOfferSubmit = () => {
    // Mostrar confirmación inmediatamente
    toast.success("Oferta enviada con éxito");
    
    // Guardar datos para el envío antes de limpiar el formulario
    const offerData = {
      property: propertyData.id,
      propertyAddress: location,
      email,
      name, 
      phone,
      offer: Math.round(selectedOffer.value) // Usar formato compatible con el endpoint existente
    };
    
    // Cerrar el modal y limpiar datos
    setShowOfferPanel(false);
    setSelectedOffer(null);
    setEmail("");
    setName("");
    setPhone("");
    
   
    
    // Enviar la oferta usando la ruta de notificación existente
    try {
      
      fetch(`${API_URL}/api/property-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(offerData)
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
           
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Respuesta exitosa:", data);
      })
      .catch(err => {
        console.log("Error en la respuesta, pero el usuario recibió confirmación");
      });
    } catch (error) {
      console.error("Error al intentar envío:", error);
    }
  };

  // Manejador de errores mejorado para evitar proxies en cascada
  const handleImageError = (e) => {
    if (e.target.hasAttribute('data-error-handled')) {
      return;
    }
    
    const originalSrc = e.target.getAttribute('data-original-src') || e.target.src;
    
    e.target.setAttribute('data-error-handled', 'true');
    
    // Comprobar si la imagen ya está siendo procesada por el proxy
    const isAlreadyProxied = e.target.src.includes('/api/image-proxy');
    
    // Si ya estamos usando el proxy y sigue fallando, ir directamente al respaldo
    if (isAlreadyProxied) {
     
      e.target.src = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&auto=format";
      return;
    }
    
    // Si es del dominio problemático y no estamos usando el proxy, usar el proxy
    if (originalSrc.includes('realestategozamadrid.com') && !isAlreadyProxied) {
      
      e.target.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
    } else {
      // Si no podemos usar el proxy o ya falló con él, usar respaldo final
      e.target.src = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&auto=format";
    }
  };

  const nextImage = () => {
    setCurrent(current === propertyImages.length - 1 ? 0 : current + 1);
  };

  const prevImage = () => {
    setCurrent(current === 0 ? propertyImages.length - 1 : current - 1);
  };

  // Agregar nuevamente la función generateOfferRanges
  const generateOfferRanges = (price) => {
    const numericPrice =
      typeof price === "string" ? parseInt(price.replace(/[^\d]/g, "")) : price;
    const basePrice = isNaN(numericPrice) ? 250000 : numericPrice;
    const ranges = [
      { percentage: 95, label: "5% menos", value: basePrice * 0.95 },
      { percentage: 90, label: "10% menos", value: basePrice * 0.90 },
      { percentage: 85, label: "15% menos", value: basePrice * 0.85 },
      { percentage: 80, label: "20% menos", value: basePrice * 0.80 },
      { percentage: 75, label: "25% menos", value: basePrice * 0.75 },
    ];
    return ranges;
  };

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <>
      {/* Add Head with SEO meta tags */}
      <Head>
        <title>{title} | Propiedad en {location}</title>
        <meta name="description" content={`${propertyType} en ${location}. ${bedrooms !== 'Consultar' ? bedrooms + ' habitaciones, ' : ''}${bathrooms !== 'Consultar' ? bathrooms + ' baños, ' : ''}${area !== 'Consultar' ? area + ' m². ' : ''}${cleanedContent?.replace(/<[^>]*>/g, '').substring(0, 120)}...`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={propertyUrl} />
        
        {/* OpenGraph tags for social sharing */}
        <meta property="og:title" content={`${title} | ${price}`} />
        <meta property="og:description" content={`${propertyType} en ${location}. ${cleanedContent?.replace(/<[^>]*>/g, '').substring(0, 150)}...`} />
        <meta property="og:image" content={propertyImages.length > 0 ? propertyImages[0].src : '/img/default-property.jpg'} />
        <meta property="og:url" content={propertyUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | ${price}`} />
        <meta name="twitter:description" content={`${propertyType} en ${location}. ${cleanedContent?.replace(/<[^>]*>/g, '').substring(0, 120)}...`} />
        <meta name="twitter:image" content={propertyImages.length > 0 ? propertyImages[0].src : '/img/default-property.jpg'} />
        
        {/* Schema.org JSON-LD structured data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
        />
      </Head>
    
      <div className="container mx-auto px-4 py-8">
        <AnimatedOnScroll>
          <article className="relative" itemScope itemType="https://schema.org/RealEstateListing">
            {/* Hidden SEO metadata */}
            <meta itemProp="name" content={title} />
            <meta itemProp="description" content={cleanedContent?.replace(/<[^>]*>/g, '').substring(0, 500)} />
            <meta itemProp="url" content={propertyUrl} />
            
            {/* Contenedor principal de imágenes */}
            <section aria-label="Galería de imágenes" className="flex flex-col mb-8">
              {/* Imagen principal arriba */}
              <div className="w-full mb-4">
                <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                  {propertyImages.length > 0 && propertyImages[current]?.src && (
                    <>
                      <img 
                        src={propertyImages[current].src}
                        alt={propertyImages[current].alt || `${title} - Imagen ${current + 1} de ${propertyImages.length}`}
                        className="h-full w-full object-cover"
                        data-original-src={propertyImages[current].originalSrc || ""}
                        data-is-proxied={propertyImages[current].isProxied ? "true" : "false"}
                        onError={handleImageError}
                        itemProp="image"
                      />
                      
                      {/* Botones de navegación mejorados */}
                      <div className="absolute inset-0 flex items-center justify-between p-3">
                        <button
                          onClick={() => setCurrent((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1))}
                          className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300"
                          aria-label="Ver imagen anterior"
                        >
                          <FaChevronLeft className="text-xl" aria-hidden="true" />
                        </button>
                        
                        <button
                          onClick={() => setCurrent((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1))}
                          className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300"
                          aria-label="Ver imagen siguiente"
                        >
                          <FaChevronRight className="text-xl" aria-hidden="true" />
                        </button>
                      </div>
                      
                      {/* Indicador de posición para todos los tamaños de pantalla */}
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                        {current + 1} / {propertyImages.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Miniaturas horizontales debajo - ocultas en móvil */}
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
                {/* Título de la propiedad con responsive */}
                <h1 className="text-3xl font-bold mb-2 text-black dark:text-white" itemProp="name">{title}</h1>
                
                {/* Ubicación con responsive */}
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <FaMapMarkerAlt className="text-sm sm:text-base" />
                  <p className="text-lg text-gray-700 dark:text-white" itemProp="address">{location}</p>
                </div>
                
                {/* Detalles de la propiedad con responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                    <MdMeetingRoom className="text-amarillo text-xl" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-amarillo">Habitaciones</p>
                      <p className="font-medium text-black dark:text-white" itemProp="numberOfRooms">{bedrooms}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                    <FaRestroom className="text-amarillo text-xl" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-amarillo">Baños</p>
                      <p className="font-medium text-black dark:text-white" itemProp="numberOfBathroomsTotal">{bathrooms}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                    <HiMiniSquare3Stack3D className="text-amarillo text-xl" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-amarillo">Área</p>
                      <p className="font-medium text-black dark:text-white" itemProp="floorSize">{area} m²</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                    <FaBuilding className="text-amarillo text-xl" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-amarillo">Tipo</p>
                      <p className="font-medium text-black dark:text-white">{propertyType}</p>
                    </div>
                  </div>
                </div>
                
                {/* Precio con responsive */}
                <div className="flex items-center gap-2 mt-4">
                  <FaEuroSign className="text-amber-400 text-lg sm:text-xl" />
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white" itemProp="offers">{price}</p>
                </div>
              </div>

              {/* Descripción con responsive */}
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

              {/* Botones de acción con responsive */}
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
            </div>

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
                        filterDate={filterAvailableDates}
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
                          {availableTimes.map((time, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedTime(time)}
                              className={`p-2 rounded-lg transition-colors ${
                                selectedTime && time.getHours() === selectedTime.getHours()
                                  ? "bg-amarillo text-white"
                                  : "bg-gray-100 hover:bg-gray-200 text-black"
                              }`}
                            >
                              {time.getHours()}:00
                            </button>
                          ))}
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
                          onClick={handleVisitSubmit}
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
                        {generateOfferRanges(price).map((range, index) => (
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
                        onClick={handleOfferSubmit}
                        className="px-4 py-2 rounded-lg bg-amarillo text-black font-medium hover:bg-amarillo/90 transition-all duration-300"
                      >
                        Enviar Oferta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        </AnimatedOnScroll>
      </div>
    </>
  );
}

