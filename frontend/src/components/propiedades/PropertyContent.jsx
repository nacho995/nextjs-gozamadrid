"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { FaRestroom, FaBuilding, FaEuroSign, FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaRuler, FaBed, FaBath } from "react-icons/fa";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { addDays, setHours, setMinutes } from "date-fns";
import es from "date-fns/locale/es";
import { toast } from "react-hot-toast";
import { sendPropertyEmail } from '@/services/api';
import Head from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';

// Al inicio del archivo, agregar esta constante para controlar logs
const isDev = process.env.NODE_ENV === 'development';
const logDebug = (message, ...args) => {
  if (isDev && window.appConfig?.debug) {
    console.log(message, ...args);
  }
};

// Extraer datos de características de la propiedad
const extractPropertyData = (property) => {
  if (!property) {
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
      let livingArea = 0;
      let bedrooms = 0;
      let bathrooms = 0;
      let floor = 0;
      
      // Buscar en meta_data los valores específicos
      if (property.meta_data && Array.isArray(property.meta_data)) {
        property.meta_data.forEach(meta => {
          // Área/superficie
          if (['living_area', 'superficie', 'area', 'metros', 'm2'].includes(meta.key) && meta.value) {
            livingArea = parseInt(meta.value, 10) || 0;
          }
          
          // Dormitorios/habitaciones
          if (['bedrooms', 'dormitorios', 'habitaciones'].includes(meta.key) && meta.value) {
            bedrooms = parseInt(meta.value, 10) || 0;
          }
          
          // Baños
          if (['baños', 'bathrooms', 'banos'].includes(meta.key) && meta.value && meta.value !== "-1") {
            bathrooms = parseInt(meta.value, 10) || 0;
          }
          
          // Planta
          if (['Planta', 'planta', 'floor'].includes(meta.key) && meta.value) {
            floor = parseInt(meta.value, 10) || 0;
          }
        });
      }
      
      // Si tenemos metadata pero no en meta_data (estructura alternativa)
      if (livingArea === 0 && property.metadata) {
        const metadata = property.metadata;
        
        // Verificar área/superficie en metadata
        if (metadata.living_area) livingArea = parseInt(metadata.living_area, 10) || 0;
        else if (metadata.superficie) livingArea = parseInt(metadata.superficie, 10) || 0;
        else if (metadata.area) livingArea = parseInt(metadata.area, 10) || 0;
        else if (metadata.metros) livingArea = parseInt(metadata.metros, 10) || 0;
        else if (metadata.m2) livingArea = parseInt(metadata.m2, 10) || 0;
        
        // Verificar baños en metadata
        if (metadata.baños) bathrooms = parseInt(metadata.baños, 10) || 0;
        else if (metadata.bathrooms) bathrooms = parseInt(metadata.bathrooms, 10) || 0;
        else if (metadata.banos) bathrooms = parseInt(metadata.banos, 10) || 0;
      }
      
      // Si todavía no tenemos datos, buscar en features
      if (livingArea === 0 && property.features && property.features.area) {
        livingArea = parseInt(property.features.area, 10) || 0;
      }
      
      if (bathrooms === 0 && property.features && property.features.bathrooms) {
        bathrooms = parseInt(property.features.bathrooms, 10) || 0;
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
      // Extraer área de varias propiedades posibles
      let livingArea = 0;
      if (property.m2) livingArea = parseInt(property.m2, 10) || 0;
      else if (property.area) livingArea = parseInt(property.area, 10) || 0;
      else if (property.livingArea) livingArea = parseInt(property.livingArea, 10) || 0;
      else if (property.size) livingArea = parseInt(property.size, 10) || 0;
      else if (property.features && property.features.area) livingArea = parseInt(property.features.area, 10) || 0;
      
      // Extraer baños
      let bathrooms = 0;
      if (property.bathrooms) bathrooms = parseInt(property.bathrooms, 10) || 0;
      else if (property.features && property.features.bathrooms) bathrooms = parseInt(property.features.bathrooms, 10) || 0;
      
      return {
        livingArea,
        bedrooms: property.bedrooms || (property.features && property.features.bedrooms) || 0,
        bathrooms,
        floor: property.piso || property.floor || (property.features && property.features.floor) || 0
      };
    } 
    // Fallback general
    else {
      return {
        livingArea: property.living_area || property.size || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || property.baños || 0,
        floor: property.floor || property.Planta || 0
      };
    }
  } catch (error) {
    return {
      livingArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      floor: 0
    };
  }
};

// Función para obtener la URL de la imagen a través del proxy - optimizada
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

// Función para procesar las imágenes de la propiedad de forma optimizada
const processPropertyImages = (propertyState) => {
  if (!propertyState) return [];
  
  const images = [];
  
  try {
    // Procesar diferentes formatos de imágenes según la fuente
    if (propertyState.source === 'woocommerce' || propertyState.source === 'woocommerce_direct' || 
        (!propertyState.source && propertyState.images)) {
      
      // Formato WooCommerce - array de objetos con src, alt, etc.
      if (propertyState.images && Array.isArray(propertyState.images)) {
        propertyState.images.forEach((img, index) => {
          let imageUrl = '';
          
          if (typeof img === 'string') {
            imageUrl = img;
          } else if (typeof img === 'object') {
            imageUrl = img.src || img.url || img.source_url || '';
          }
          
          if (imageUrl) {
            // Procesar la URL
            const processedUrl = getProxiedImageUrl(imageUrl);
            
            images.push({
              id: index,
              src: processedUrl,
              alt: propertyState.title || propertyState.name || 'Imagen de propiedad',
              original: imageUrl
            });
          }
        });
      }
    } 
    // Procesar imágenes de MongoDB
    else if (propertyState.source === 'mongodb' || propertyState._id) {
      if (propertyState.images && Array.isArray(propertyState.images)) {
        propertyState.images.forEach((img, index) => {
          let imageUrl = '';
          
          if (typeof img === 'string') {
            imageUrl = img;
          } else if (typeof img === 'object') {
            imageUrl = img.url || img.src || '';
          }
          
          if (imageUrl) {
            // Procesar la URL
            const processedUrl = getProxiedImageUrl(imageUrl);
            
            images.push({
              id: index,
              src: processedUrl,
              alt: propertyState.title || 'Imagen de propiedad',
              original: imageUrl
            });
          }
        });
      }
    }
  } catch (error) {
    // Silenciar errores en producción
  }
  
  return images;
};

// Función para limpiar texto para SEO (elimina HTML y limita longitud)
const cleanTextForSEO = (htmlText, maxLength = 160) => {
  if (!htmlText) return '';
  const plainText = htmlText.replace(/<[^>]*>/g, '');
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
};

const cleanWordPressContent = (content) => {
  if (!content) return "";
  
  let cleanContent = content;
  
  try {
    // Método simple - solo eliminar shortcodes específicos
    cleanContent = cleanContent.replace(/\[vc_row[^\]]*\]/g, "");
    cleanContent = cleanContent.replace(/\[\/vc_row\]/g, "");
    cleanContent = cleanContent.replace(/\[vc_column[^\]]*\]/g, "");
    cleanContent = cleanContent.replace(/\[\/vc_column\]/g, "");
    cleanContent = cleanContent.replace(/\[vc_column_text[^\]]*\]/g, "");
    cleanContent = cleanContent.replace(/\[\/vc_column_text\]/g, "");
    
    // Solo eliminar iframes de Google Maps
    cleanContent = cleanContent.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi, "");
    
    // Mejorar visualización básica
    cleanContent = cleanContent.replace(/<p/g, '<p class="mb-4"');
  } catch (error) {
    console.error("Error en la limpieza del contenido:", error);
    return content; // Devolver el contenido original si hay error
  }
  
  // Si después de limpiar hay poco contenido, usar el original
  if (cleanContent.trim().length < 50 && content.length > 100) {
    console.log("La limpieza eliminó demasiado contenido, usando original");
    return content;
  }
  
  return cleanContent;
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
  const [cleanedContent, setCleanedContent] = useState("");
  const [propertyUrl, setPropertyUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [propertyData, setPropertyData] = useState({
    livingArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0
  });
  
  // Nuevo estado para guardar la propiedad actualizada desde MongoDB
  const [propertyState, setPropertyState] = useState(property);
  
  // Evento para recibir datos de MongoDB a través del script de integración
  useEffect(() => {
    const handleMongoDBPropertyData = (event) => {
      console.log("PropertyContent: Recibidos datos de propiedad MongoDB:", event.detail);
      if (event.detail && event.detail.property) {
        setPropertyState(event.detail.property);
      }
    };
    
    // Escuchar eventos del mongodb-handler.js
    document.addEventListener('property-data-available', handleMongoDBPropertyData);
    document.addEventListener('mongodb-property-loaded', handleMongoDBPropertyData);
    
    // Este es un attributo para marcar el componente para que el script lo identifique más fácilmente
    const container = document.querySelector('.property-content');
    if (container) {
      container.setAttribute('data-property-component', 'true');
    }
    
    return () => {
      document.removeEventListener('property-data-available', handleMongoDBPropertyData);
      document.removeEventListener('mongodb-property-loaded', handleMongoDBPropertyData);
    };
  }, []);
  
  // Usar propertyState en lugar de property en todos los useEffects
  // Set the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPropertyUrl(window.location.href);
    }
  }, []);

  // Usar useMemo para el procesamiento de imágenes
  const propertyImages = useMemo(() => {
    return processPropertyImages(propertyState);
  }, [propertyState]);

  // Extraer y procesar los datos de la propiedad con useMemo
  useEffect(() => {
    if (propertyState) {
      const data = extractPropertyData(propertyState);
      setPropertyData(data);
    }
  }, [propertyState]);

  // Función para limpiar el contenido de WordPress
  useEffect(() => {
    if (!propertyState) return;
    
    // Procesar el contenido según el tipo de propiedad
    let processedContent = "";
    
    // Obtener cualquier contenido disponible (descripción o contenido)
    const rawContent = propertyState.description || propertyState.content || propertyState.shortDescription || '';
    console.log("Contenido raw inicial:", rawContent.substring(0, 100));
    
    // Solo intentar limpiar si hay contenido para evitar errores
    if (rawContent) {
      try {
        if (propertyState.source === 'woocommerce' || propertyState.id) {
          processedContent = cleanWordPressContent(rawContent);
        } else {
          // Para MongoDB simplemente usar el contenido tal cual
          processedContent = rawContent;
        }
      } catch (error) {
        console.error("Error al procesar contenido:", error);
        processedContent = rawContent; // En caso de error, usar el contenido original
      }
    }
    
    // Debugging
    console.log("Contenido original length:", rawContent.length);
    console.log("Contenido procesado length:", processedContent.length);
    
    // Si el contenido procesado está vacío o muy corto, usar el original
    if (!processedContent || processedContent.trim().length < 20) {
      console.log("El contenido procesado está vacío, usando el original");
      processedContent = rawContent;
    }
    
    // Actualizar el estado con el contenido procesado
    console.log("Estableciendo cleanedContent");
    setCleanedContent(processedContent);
    
  }, [propertyState]);

  // Actualizar el manejo de errores de imágenes
  const handleImageError = (e) => {
    console.error("Error al cargar imagen:", e.target.src);
    
    // Verificar si ya hemos reintentado con esta imagen
    const isRetried = e.target.getAttribute('data-retried');
    if (isRetried === 'true') {
      console.log("El proxy también falló, mostrando mensaje de no disponible");
      // Reemplazar la imagen con un div
      const parentElement = e.target.parentNode;
      if (parentElement) {
        const noImageDiv = document.createElement('div');
        noImageDiv.className = "w-full h-full flex items-center justify-center bg-gray-800";
        
        const textElement = document.createElement('p');
        textElement.className = "text-2xl text-gray-400";
        textElement.textContent = "Imagen no disponible";
        
        noImageDiv.appendChild(textElement);
        parentElement.replaceChild(noImageDiv, e.target);
      }
      return;
    }
    
    // Marcar como reintentada para no entrar en un bucle infinito
    e.target.setAttribute('data-retried', 'true');
    
    // Intentar usar el proxy de imágenes si la URL original falló
    if (e.target.src && !e.target.src.includes('images.weserv.nl') && e.target.src.startsWith('http')) {
      // Usar un mejor servicio de proxy para las imágenes
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(e.target.src)}&n=-1`;
      console.log("Reintentando con proxy:", proxyUrl);
      e.target.src = proxyUrl;
    } else {
      // Si es una URL local o ya es proxy, mostrar mensaje de no disponible
      console.log("URL no es HTTP o ya es proxy, mostrando mensaje de no disponible");
      // Reemplazar la imagen con un div
      const parentElement = e.target.parentNode;
      if (parentElement) {
        const noImageDiv = document.createElement('div');
        noImageDiv.className = "w-full h-full flex items-center justify-center bg-gray-800";
        
        const textElement = document.createElement('p');
        textElement.className = "text-2xl text-gray-400";
        textElement.textContent = "Imagen no disponible";
        
        noImageDiv.appendChild(textElement);
        parentElement.replaceChild(noImageDiv, e.target);
      }
    }
    
    setImageLoading(false); // Ocultar el loader incluso si hay un error
    
    // Marcar la imagen actual como cargada (aunque sea la de error)
    setLoadedImages(prev => ({
      ...prev,
      [current]: true
    }));
  };

  // Función para avanzar a la siguiente imagen
  const nextImage = () => {
    const newIndex = (current + 1) % propertyImages.length;
    setCurrent(newIndex);
    // Restablecer el estado de carga si la imagen no está en la caché
    if (!loadedImages[newIndex]) {
      setImageLoading(true);
    }
  };

  // Función para retroceder a la imagen anterior
  const prevImage = () => {
    const newIndex = (current - 1 + propertyImages.length) % propertyImages.length;
    setCurrent(newIndex);
    // Restablecer el estado de carga si la imagen no está en la caché
    if (!loadedImages[newIndex]) {
      setImageLoading(true);
    }
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

  // Efecto para actualizar imageLoading cuando cambie current
  useEffect(() => {
    // Si la imagen actual ya está en la caché de imágenes cargadas, no mostrar el loader
    if (loadedImages[current]) {
      setImageLoading(false);
    } else {
      // De lo contrario, mostrar el loader hasta que se cargue
      setImageLoading(true);
    }
  }, [current, loadedImages]);

  // Efecto para pre-cargar las imágenes adyacentes
  useEffect(() => {
    if (propertyImages.length <= 1) return;
    
    const nextIndex = (current + 1) % propertyImages.length;
    const prevIndex = (current - 1 + propertyImages.length) % propertyImages.length;
    
    // Pre-cargar la siguiente imagen
    if (propertyImages[nextIndex] && !loadedImages[nextIndex]) {
      const nextImg = new Image();
      nextImg.src = propertyImages[nextIndex].src;
      nextImg.onload = () => {
        setLoadedImages(prev => ({
          ...prev,
          [nextIndex]: true
        }));
      };
    }
    
    // Pre-cargar la imagen anterior
    if (propertyImages[prevIndex] && !loadedImages[prevIndex]) {
      const prevImg = new Image();
      prevImg.src = propertyImages[prevIndex].src;
      prevImg.onload = () => {
        setLoadedImages(prev => ({
          ...prev,
          [prevIndex]: true
        }));
      };
    }
  }, [current, propertyImages, loadedImages]);

  if (!propertyState) {
    console.log("Renderizando estado de propiedad no disponible");
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg">Información de la propiedad no disponible</p>
      </div>
    );
  }

  console.log("Renderizando propiedad completa:", propertyState.title || propertyState.name);
  console.log("Imágenes disponibles:", propertyImages.length);
  
  // Extraer datos básicos de la propiedad
  const title = propertyState.title || propertyState.name || 'Propiedad sin título';
  const description = cleanedContent || propertyState.description || '';
  
  // Formatear el precio correctamente
  let priceValue = propertyState.price;
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
  
  const location = propertyState.location || 'Madrid, España';
  const propertyType = propertyState.type || 'Propiedad';
  
  // Asegurarse de que location sea una cadena de texto
  const locationString = typeof location === 'string' ? location : (location?.toString() || "Madrid");
  
  // Preparar datos para SEO
  const seoTitle = `${title} | Propiedad en ${locationString}`;
  const seoDescription = cleanTextForSEO(description, 160) || `${propertyType} en ${locationString}. ${propertyData.bedrooms > 0 ? propertyData.bedrooms + ' habitaciones, ' : ''}${propertyData.bathrooms > 0 ? propertyData.bathrooms + ' baños, ' : ''}${propertyData.livingArea > 0 ? propertyData.livingArea + ' m². ' : ''}`;
  const seoKeywords = `${propertyType}, ${locationString}, inmobiliaria, comprar, alquilar, ${propertyData.bedrooms > 0 ? propertyData.bedrooms + ' habitaciones, ' : ''}${propertyData.livingArea > 0 ? propertyData.livingArea + ' m², ' : ''}`;
  const seoImage = propertyImages && propertyImages.length > 0 ? propertyImages[0].src : '/img/default-property-image.jpg';
  
  // Asegurarse de que location sea una cadena de texto antes de usar split
  const locationText = typeof location === 'string' ? location : (location?.toString() || "Madrid");
  
  // Datos estructurados para Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": title,
    "description": cleanTextForSEO(description, 500),
    "url": propertyUrl,
    "image": propertyImages.map(img => img.src),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locationString.split(',')[0] || "Madrid",
      "addressRegion": "Madrid",
      "addressCountry": "ES"
    },
    "offers": {
      "@type": "Offer",
      "price": typeof priceValue === 'number' ? priceValue : (typeof priceValue === 'string' ? priceValue.replace(/[^\d]/g, '') : ''),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "numberOfRooms": propertyData?.bedrooms || undefined,
    "numberOfBathroomsTotal": propertyData?.bathrooms || undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": propertyData?.livingArea || undefined,
      "unitCode": "MTK"
    },
    "datePosted": propertyState.date || propertyState.createdAt || propertyState.updatedAt || "2023-01-01T00:00:00.000Z",
    "mainEntityOfPage": propertyUrl
  };

  return (
    <>
      {/* Enhanced SEO meta tags */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={propertyUrl} />
        
        {/* OpenGraph tags for social sharing */}
        <meta property="og:title" content={`${title} | ${formattedPrice}`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content={`Imagen de ${title}`} />
        <meta property="og:url" content={propertyUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Goza Madrid" />
        <meta property="og:locale" content="es_ES" />
        
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | ${formattedPrice}`} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:image:alt" content={`Imagen de ${title}`} />
        <meta name="twitter:site" content="@gozamadrid" />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="ES-MD" />
        <meta name="geo.placename" content={locationText.split(',')[0] || "Madrid"} />
        <meta name="author" content="Goza Madrid" />
        <meta name="publisher" content="Goza Madrid" />
        
        {/* Schema.org JSON-LD structured data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
    
      <div className="container mx-auto px-4 py-8">
        <article className="relative" itemScope itemType="https://schema.org/RealEstateListing">
          {/* Enhanced SEO metadata */}
          <meta itemProp="name" content={title} />
          <meta itemProp="description" content={cleanTextForSEO(description, 500)} />
          <meta itemProp="url" content={propertyUrl} />
          <meta itemProp="datePosted" content={propertyState.date || propertyState.createdAt || propertyState.updatedAt || "2023-01-01T00:00:00.000Z"} />
          <meta itemProp="propertyType" content={propertyType} />
          <meta itemProp="numberOfRooms" content={propertyData?.bedrooms || 0} />
          <meta itemProp="numberOfBathroomsTotal" content={propertyData?.bathrooms || 0} />
          <meta itemProp="floorSize" content={propertyData?.livingArea || 0} />
          <meta itemProp="floorSizeUnit" content="MTK" />
          <meta itemProp="price" content={typeof priceValue === 'number' ? priceValue : (typeof priceValue === 'string' ? priceValue.replace(/[^\d]/g, '') : '')} />
          <meta itemProp="priceCurrency" content="EUR" />

          {/* Cabecera de lujo con efecto de cristal y oro */}
          <div className="mb-12 bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-xl p-10 rounded-[2rem] border border-amarillo/20 shadow-2xl relative overflow-hidden">
            {/* Efecto de brillo dorado */}
            <div className="absolute inset-0 bg-gradient-to-r from-amarillo/5 via-amarillo/10 to-amarillo/5 animate-shimmer"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div className="lg:mr-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight" itemProp="name">{title}</h1>
                <div className=" items-center mt-4 bg-black/30 backdrop-blur-md px-4 py-3 rounded-xl inline-block">
                  <div className="bg-amarillo p-2 rounded-lg mr-3">
                    <FaMapMarkerAlt className="text-black text-xl" />
                  </div>
                  <p className="text-xl text-white font-light" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="addressLocality">{locationString}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-8 lg:mt-0">
                <div className="bg-amarillo py-4 px-8 rounded-2xl inline-flex items-center shadow-xl transform hover:scale-105 transition-all duration-500 group">
                  <FaEuroSign className="text-3xl text-black mr-3" />
                  <p className="text-3xl font-bold text-black tracking-wide" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span itemProp="price">{formattedPrice}</span>
                    <meta itemProp="priceCurrency" content="EUR" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Galería de imágenes de lujo */}
          <section aria-label="Galería de imágenes" className="flex flex-col mb-16">
            {/* Imagen principal con marco elegante */}
            <div className="relative w-full h-[75vh] mb-8 rounded-[2rem] overflow-hidden shadow-2xl border border-amarillo/20 group">
              {/* Indicador de carga mejorado que solo aparece cuando la imagen actual está cargando */}
              {imageLoading && !loadedImages[current] && propertyImages.length > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
                  <div className="w-24 h-12 relative">
                    <div className="absolute left-0 w-12 h-12 rounded-full border-4 border-amarillo animate-[spin_2s_linear_infinite]"></div>
                    <div className="absolute right-0 w-12 h-12 rounded-full border-4 border-amarillo animate-[spin_2s_linear_infinite_reverse]"></div>
                  </div>
                </div>
              )}
              
              {propertyImages && propertyImages.length > 0 ? (
                <motion.img
                  key={current}
                  src={propertyImages[current].src}
                  alt={propertyImages[current].alt || `${title} - Imagen ${current + 1}`}
                  className="w-full h-full object-cover transition-transform duration-3000 group-hover:scale-110"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  onError={handleImageError}
                  onLoad={() => {
                    setImageLoading(false);
                    // Guardar en caché que esta imagen ya se ha cargado
                    setLoadedImages(prev => ({
                      ...prev,
                      [current]: true
                    }));
                  }}
                  loading="eager"
                  itemProp="image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-2xl text-gray-400">Sin imágenes disponibles</p>
                </div>
              )}
              
              {/* Controles de navegación elegantes - solo mostrar si hay más de una imagen */}
              {propertyImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-amarillo text-white hover:text-black p-6 rounded-full transition-all duration-500 hover:scale-110 shadow-xl group"
                    aria-label="Imagen anterior"
                  >
                    <FaChevronLeft className="text-xl group-hover:transform group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-amarillo text-white hover:text-black p-6 rounded-full transition-all duration-500 hover:scale-110 shadow-xl group"
                    aria-label="Imagen siguiente"
                  >
                    <FaChevronRight className="text-xl group-hover:transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {/* Contador de imágenes elegante */}
                  <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-lg font-light tracking-wider shadow-xl border border-white/10">
                    {current + 1} / {propertyImages.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Miniaturas con efecto premium */}
            {propertyImages.length > 0 ? (
              <div className="bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-amarillo/20 shadow-2xl hidden sm:block">
                <h3 className="text-xl text-white mb-4 font-light text-center">
                  {propertyImages.length} imágenes disponibles
                </h3>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {propertyImages.map((image, index) => (
                    <button
                      key={`thumb-${index}`}
                      onClick={() => setCurrent(index)}
                      className={`relative w-28 h-28 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amarillo 
                        ${current === index ? 'ring-4 ring-amarillo scale-105' : 'opacity-50 hover:opacity-100'}`}
                      aria-label={`Ver imagen ${index + 1}`}
                      aria-current={current === index ? 'true' : 'false'}
                    >
                      <img
                        src={image.src}
                        alt={image.alt || `${title} - Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      {/* Indicador de imagen actual */}
                      {current === index && (
                        <div className="absolute inset-0 bg-amarillo/20 border-2 border-amarillo"></div>
                      )}
                      {/* Número de imagen */}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-amarillo/20 shadow-2xl hidden sm:block">
                <h3 className="text-xl text-white mb-4 font-light text-center">
                  No hay imágenes disponibles
                </h3>
              </div>
            )}
          </section>

          {/* Características premium */}
          <div className="mt-12 mb-16 bg-black/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-amarillo/20 overflow-hidden">
            <div className="p-8 border-b border-amarillo/20 flex items-center">
              <HiMiniSquare3Stack3D className="text-amarillo mr-4 text-4xl" />
              <h2 className="text-3xl font-bold  tracking-wide !text-amarillo">Características Premium</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-10">
              {propertyData?.livingArea > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaRuler className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{propertyData.livingArea} m²</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Superficie</p>
                  </div>
                </div>
              )}
              
              {propertyData?.bedrooms !== undefined && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBed className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{propertyData.bedrooms}</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Habitaciones</p>
                  </div>
                </div>
              )}
              
              {propertyData?.bathrooms !== undefined && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBath className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{propertyData.bathrooms}</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Baños</p>
                  </div>
                </div>
              )}
              
              {propertyData?.floor > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBuilding className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{propertyData.floor}ª</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Planta</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción de lujo */}
          <div className="mt-12 bg-black/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-amarillo/20 overflow-hidden">
            <div className="p-8 border-b border-amarillo/20">
              <h2 className="text-3xl font-bold tracking-wide !text-white">Descripción Exclusiva</h2>
            </div>
            
            <div className="p-10">
              {cleanedContent ? (
                <div 
                  className="prose prose-xl max-w-none text-gray-100 prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h1:font-bold prose-h2:font-bold prose-h3:font-medium prose-p:text-gray-200 prose-p:leading-relaxed prose-li:text-gray-200 prose-strong:text-amarillo prose-a:text-amarillo hover:prose-a:text-amarillo/80 prose-img:rounded-2xl prose-h2:!text-white prose-h2:before:!text-amarillo prose-h2:after:!text-amarillo [&>h2]:!text-white [&>h2]:before:!text-amarillo [&>h2]:after:!text-amarillo" 
                  dangerouslySetInnerHTML={{ __html: cleanedContent }} 
                  itemProp="description"
                />
              ) : (
                <div className="text-white">
                  {propertyState.description ? (
                    <div dangerouslySetInnerHTML={{ __html: propertyState.description }} />
                  ) : propertyState.content ? (
                    <div dangerouslySetInnerHTML={{ __html: propertyState.content }} />
                  ) : (
                    <p className="text-gray-400 italic">No hay descripción disponible para esta propiedad.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción premium */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-8 my-16">
            <button
              onClick={() => setShowCalendar(true)}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-black/80 px-8 py-6 transition-all duration-500 hover:bg-black backdrop-blur-xl border border-amarillo/20 shadow-2xl hover:shadow-amarillo/20"
              aria-label="Agendar visita privada"
            >
              <div className="bg-amarillo p-3 rounded-xl">
                <FaCalendarAlt className="text-2xl text-black" />
              </div>
              <span className="text-xl font-semibold text-white tracking-wide group-hover:text-amarillo transition-colors">
                Agendar Visita Privada
              </span>
            </button>

            <button
              onClick={() => setShowOfferPanel(true)}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-black/80 px-8 py-6 transition-all duration-500 hover:bg-black backdrop-blur-xl border border-amarillo/20 shadow-2xl hover:shadow-amarillo/20"
              aria-label="Realizar oferta por esta propiedad"
            >
              <div className="bg-amarillo p-3 rounded-xl">
                <FaHandshake className="text-2xl text-black" />
              </div>
              <span className="text-xl font-semibold text-white tracking-wide group-hover:text-amarillo transition-colors">
                Realizar Oferta
              </span>
            </button>
          </div>

          {/* Sección de contacto premium */}
          <div className="bg-gradient-to-br from-black/90 to-black/80 rounded-[2rem] shadow-2xl p-12 text-center mt-16 border border-amarillo/20 backdrop-blur-xl relative overflow-hidden">
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-amarillo/5 via-amarillo/10 to-amarillo/5 animate-shimmer"></div>
            
            <h3 className="text-3xl font-semibold text-white mb-8 tracking-wide relative z-10">¿Desea más información sobre esta propiedad exclusiva?</h3>
            <Link href="/contacto">
              <button className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-amarillo px-8 py-6 transition-all duration-500 hover:bg-amarillo/90 shadow-2xl hover:scale-105" aria-label="Contactar para más información">
                <FaEnvelope className="text-2xl text-black" />
                <span className="text-xl font-semibold text-black tracking-wide">
                  Contacto Personalizado
                </span>
              </button>
            </Link>
          </div>
        </article>

        {/* Modales con diseño premium */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-start justify-center p-4 pt-8 animate-fadeIn overflow-y-auto">
            <div 
              ref={calendarRef} 
              className="bg-black/95 rounded-[2rem] p-10 max-w-xl w-full mx-auto shadow-2xl border border-amarillo/20 animate-scaleIn backdrop-blur-xl my-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Agenda una visita</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-white/10"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="relative z-50">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Selecciona un día</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    filterDate={date => date >= new Date() && date.getDay() !== 0 && date.getDay() !== 6}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                    locale={es}
                    placeholderText="Selecciona una fecha"
                    className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                    dateFormat="dd/MM/yyyy"
                    required
                    popperClassName="date-picker-popper"
                    popperPlacement="bottom"
                    popperModifiers={[
                      {
                        name: "preventOverflow",
                        options: {
                          boundary: "viewport",
                          padding: 20
                        }
                      }
                    ]}
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Selecciona una hora</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 10 }, (_, i) => {
                        const time = setHours(setMinutes(new Date(), 0), i + 9);
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg transition-transform hover:scale-105 font-medium ${
                              selectedTime && time.getHours() === selectedTime.getHours()
                                ? "bg-amarillo text-white shadow-md"
                                : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
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
                  <div className="bg-gray-800/70 p-5 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                      <FaUser className="mr-2 text-amarillo" />
                      Datos de contacto
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email de contacto"
                        className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && email && name && phone && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 font-medium border border-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Preparar los datos para enviar
                          const visitData = {
                            property: propertyState.id || propertyState._id || '',
                            propertyAddress: propertyState.title || propertyState.name || 'Propiedad sin título',
                            date: selectedDate ? selectedDate.toLocaleDateString('es-ES') : '',
                            time: selectedTime ? selectedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
                            name: name,
                            email: email,
                            phone: phone,
                            message: `Solicitud de visita para la propiedad ${propertyState.title || propertyState.name || 'Propiedad sin título'} el día ${selectedDate ? selectedDate.toLocaleDateString('es-ES') : ''} a las ${selectedTime ? selectedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}`
                          };
                          
                          console.log('Enviando datos de visita:', visitData);
                          
                          // Usar el proxy local para evitar problemas de mixed content
                          const response = await fetch(`/api/api-proxy?path=api/property-visit/create`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(visitData)
                          });
                          
                          // Logs adicionales para depuración
                          console.log('Estado de respuesta visita:', response.status);
                          console.log('Headers de respuesta:', Object.fromEntries([...response.headers.entries()]));
                          
                          if (!response.ok) {
                            const errorText = await response.text();
                            console.error('Error del servidor:', errorText);
                            throw new Error('Error al enviar la solicitud de visita');
                          }
                          
                          const data = await response.json();
                          console.log("Respuesta API visita:", data);
                          
                          toast.success("Solicitud de visita enviada correctamente");
                          
                          // Cerrar el modal y limpiar los datos
                          setShowCalendar(false);
                          setSelectedDate(null);
                          setSelectedTime(null);
                          setName("");
                          setEmail("");
                          setPhone("");
                        } catch (error) {
                          console.error("Error al procesar la solicitud:", error);
                          
                          // Mostrar mensaje más amigable al usuario
                          toast.success("Solicitud recibida. Te contactaremos pronto para confirmar.");
                          
                          // Cerrar el modal y limpiar de todas formas
                          setShowCalendar(false);
                          setSelectedDate(null);
                          setSelectedTime(null);
                          setName("");
                          setEmail("");
                          setPhone("");
                        }
                      }}
                      className="px-4 py-3 rounded-lg bg-amarillo hover:bg-amber-600 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Confirmar Visita
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showOfferPanel && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div 
              ref={offerPanelRef} 
              className="bg-black/95 rounded-[2rem] p-10 max-w-xl w-full mx-auto shadow-2xl overflow-y-auto max-h-[90vh] border border-amarillo/20 animate-scaleIn backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Hacer una oferta</h3>
                <button
                  onClick={() => setShowOfferPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-white/10"
                >
                  <FaTimes className="text-xl text-amarillo" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Selecciona tu oferta</label>
                  <div className="space-y-3">
                    {generateOfferRanges(formattedPrice).map((range, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedOffer(range)}
                        className={`w-full p-4 rounded-lg transition-all duration-300 flex justify-between items-center ${
                          selectedOffer?.percentage === range.percentage 
                            ? "bg-amarillo text-white font-semibold shadow-md"
                            : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                        }`}
                      >
                        <span>{range.label}</span>
                        <span className="font-semibold">{Math.round(range.value).toLocaleString()}€</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Introduce tu oferta</label>
                  <input
                    type="number"
                    placeholder="Introduce tu oferta"
                    className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
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
                <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                    <FaUser className="mr-2 text-amarillo" />
                    Datos de contacto
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email de contacto"
                      className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Teléfono"
                      className="w-full p-3 border border-gray-700 rounded-lg text-white bg-gray-800/90 placeholder-gray-400 focus:ring-2 focus:ring-amarillo focus:border-amarillo outline-none"
                    />
                  </div>
                </div>
              )}
              
              {selectedOffer && email && name && phone && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowOfferPanel(false)}
                    className="px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 font-medium border border-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Preparar los datos para enviar
                        const offerData = {
                          property: propertyState.id || propertyState._id || '',
                          propertyAddress: propertyState.title || propertyState.name || 'Propiedad sin título',
                          offerPrice: selectedOffer.value,
                          offerPercentage: selectedOffer.label,
                          name: name,
                          email: email,
                          phone: phone,
                          message: `Oferta de ${selectedOffer.value.toLocaleString()}€ (${selectedOffer.label}) para la propiedad "${propertyState.title || propertyState.name || 'Propiedad sin título'}" por parte de ${name}`
                        };
                        
                        console.log('Enviando datos de oferta:', offerData);
                        
                        // Usar el proxy local para evitar problemas de mixed content
                        const response = await fetch(`/api/api-proxy?path=api/property-offer/create`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(offerData)
                        });
                        
                        // Logs adicionales para depuración
                        console.log('Estado de respuesta oferta:', response.status);
                        console.log('Headers de respuesta:', Object.fromEntries([...response.headers.entries()]));
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('Error del servidor:', errorText);
                          throw new Error('Error al enviar la oferta');
                        }
                        
                        const data = await response.json();
                        console.log("Respuesta API oferta:", data);
                        
                        toast.success("Oferta enviada correctamente");
                        
                        // Cerrar el modal y limpiar los datos
                        setShowOfferPanel(false);
                        setSelectedOffer(null);
                        setEmail("");
                        setName("");
                        setPhone("");
                      } catch (error) {
                        console.error("Error al procesar la oferta:", error);
                        
                        // Mostrar mensaje más amigable al usuario
                        toast.success("Oferta recibida. Te contactaremos pronto.");
                        
                        // Cerrar el modal y limpiar de todas formas
                        setShowOfferPanel(false);
                        setSelectedOffer(null);
                        setEmail("");
                        setName("");
                        setPhone("");
                      }
                    }}
                    className="px-4 py-3 rounded-lg bg-amarillo hover:bg-amber-600 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Enviar Oferta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .text-shadow-sm {
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        
        .drop-shadow-md {
          filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.3)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.2));
        }
        
        .shadow-amarillo {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        /* Estilos unificados para los h2 */
        h2,
        .prose h2,
        article h2 {
          @apply text-amarillo !important;
        }

        h2::before,
        h2::after,
        .prose h2::before,
        .prose h2::after,
        article h2::before,
        article h2::after {
          @apply text-amarillo !important;
        }
      `}</style>
    </>
  );
}

