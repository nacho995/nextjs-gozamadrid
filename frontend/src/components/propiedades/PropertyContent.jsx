"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { FaRestroom, FaBuilding, FaEuroSign, FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaRuler, FaBed, FaBath, FaArrowLeft, FaRegHeart, FaHeart, FaShareAlt, FaWhatsapp, FaPrint, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { addDays, setHours, setMinutes } from "date-fns";
import es from "date-fns/locale/es";
import { toast } from "sonner";
import { sendPropertyEmail } from '@/services/api';
import Head from "next/head";
// Removed Google Maps API imports - using iframe embeds instead
import Image from "next/legacy/image";
import CountryPrefix from "../CountryPrefix";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';

// Al inicio del archivo, agregar esta constante para controlar logs
const isDev = process.env.NODE_ENV === 'development';
const logDebug = (message, ...args) => {
  if (isDev && window.appConfig?.debug) {
    // console.log(message, ...args);
  }
};

// Extraer datos de características de la propiedad
const extractPropertyData = (property) => {
  // <<< LOG AÑADIDO PARA VER EL OBJETO RAW >>>
  console.log('[extractPropertyData] Recibido objeto property:', JSON.stringify(property, null, 2)); // Usar JSON.stringify para ver todo
  
  let result = {
    livingArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0
  };

  if (!property) {
    console.log('[extractPropertyData] Propiedad nula, devolviendo valores por defecto.');
    return result;
  }

  try {
    // Determinar la fuente: si existe explícitamente, usarla. Si no, pero tiene _id, asumir MongoDB.
    const source = property.source || (property._id ? 'mongodb' : null);
    console.log(`[extractPropertyData] Fuente determinada: ${source}`);

    // Para propiedades de WordPress (WooCommerce)
    if (source === 'woocommerce') { // Usar la fuente determinada
      let livingArea = 0;
      let bedrooms = 0;
      let bathrooms = 0;
      let floor = 0;
      
      // PRIORIDAD 1: Buscar en features (estructura nueva que funciona)
      if (property.features) {
        livingArea = parseInt(property.features.area, 10) || 0;
        bedrooms = parseInt(property.features.bedrooms, 10) || 0;
        bathrooms = parseInt(property.features.bathrooms, 10) || 0;
        floor = parseInt(property.features.floor, 10) || 0;
      }
      
      // PRIORIDAD 2: Si no hay features, buscar en propiedades directas
      if (livingArea === 0) {
        livingArea = parseInt(property.area, 10) || parseInt(property.size, 10) || parseInt(property.m2, 10) || 0;
      }
      if (bedrooms === 0) {
        bedrooms = parseInt(property.bedrooms, 10) || parseInt(property.rooms, 10) || 0;
      }
      if (bathrooms === 0) {
        bathrooms = parseInt(property.bathrooms, 10) || parseInt(property.banos, 10) || 0;
      }
      
      // PRIORIDAD 3: Buscar en meta_data como último recurso
      if ((livingArea === 0 || bedrooms === 0 || bathrooms === 0) && property.meta_data && Array.isArray(property.meta_data)) {
        property.meta_data.forEach(meta => {
          // Área/superficie
          if (livingArea === 0 && ['living_area', 'superficie', 'area', 'metros', 'm2'].includes(meta.key) && meta.value) {
            livingArea = parseInt(meta.value, 10) || 0;
          }
          
          // Dormitorios/habitaciones
          if (bedrooms === 0 && ['bedrooms', 'dormitorios', 'habitaciones'].includes(meta.key) && meta.value) {
            bedrooms = parseInt(meta.value, 10) || 0;
          }
          
          // Baños
          if (bathrooms === 0 && ['baños', 'bathrooms', 'banos'].includes(meta.key) && meta.value && meta.value !== "-1") {
            bathrooms = parseInt(meta.value, 10) || 0;
          }
          
          // Planta
          if (floor === 0 && ['Planta', 'planta', 'floor'].includes(meta.key) && meta.value) {
            floor = parseInt(meta.value, 10) || 0;
          }
        });
      }
      
      // PRIORIDAD 4: Si tenemos metadata pero no en meta_data (estructura alternativa)
      if ((livingArea === 0 || bedrooms === 0 || bathrooms === 0) && property.metadata) {
        const metadata = property.metadata;
        
        // Verificar área/superficie en metadata
        if (livingArea === 0) {
          if (metadata.living_area) livingArea = parseInt(metadata.living_area, 10) || 0;
          else if (metadata.superficie) livingArea = parseInt(metadata.superficie, 10) || 0;
          else if (metadata.area) livingArea = parseInt(metadata.area, 10) || 0;
          else if (metadata.metros) livingArea = parseInt(metadata.metros, 10) || 0;
          else if (metadata.m2) livingArea = parseInt(metadata.m2, 10) || 0;
        }
        
        // Verificar baños en metadata
        if (bathrooms === 0) {
          if (metadata.baños) bathrooms = parseInt(metadata.baños, 10) || 0;
          else if (metadata.bathrooms) bathrooms = parseInt(metadata.bathrooms, 10) || 0;
          else if (metadata.banos) bathrooms = parseInt(metadata.banos, 10) || 0;
        }
        
        // Verificar habitaciones en metadata
        if (bedrooms === 0) {
          if (metadata.bedrooms) bedrooms = parseInt(metadata.bedrooms, 10) || 0;
          else if (metadata.habitaciones) bedrooms = parseInt(metadata.habitaciones, 10) || 0;
          else if (metadata.dormitorios) bedrooms = parseInt(metadata.dormitorios, 10) || 0;
        }
      }
      
      result = {
        livingArea,
        bedrooms,
        bathrooms,
        floor
      };
    } 
    // Para propiedades de MongoDB
    else if (source === 'mongodb') { // Usar la fuente determinada
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
      
      // Extraer dormitorios y piso, asegurando que sean números
      const bedrooms = parseInt(property.bedrooms, 10) || (property.features && parseInt(property.features.bedrooms, 10)) || 0;
      const floor = parseInt(property.piso, 10) || parseInt(property.floor, 10) || (property.features && parseInt(property.features.floor, 10)) || 0;

      result = {
        livingArea, // Ya es número
        bedrooms,   // Ahora es número
        bathrooms,  // Ya es número
        floor       // Ahora es número
      };
    } 
    // Fallback general
    else {
      result = {
        livingArea: parseInt(property.living_area, 10) || parseInt(property.size, 10) || 0,
        bedrooms: parseInt(property.bedrooms, 10) || 0,
        bathrooms: parseInt(property.bathrooms, 10) || parseInt(property.baños, 10) || 0,
        floor: parseInt(property.floor, 10) || parseInt(property.Planta, 10) || 0
      };
    }
  } catch (error) {
    console.error('[extractPropertyData] Error extrayendo datos:', error);
    // Devolver valores por defecto en caso de error
    result = { livingArea: 0, bedrooms: 0, bathrooms: 0, floor: 0 };
  }
  
  // <<< LOG AÑADIDO >>>
  console.log('[extractPropertyData] Datos extraídos:', result);
  return result;
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
    
    // NO eliminar iframes de Google Maps, mantener los mapas configurados por el usuario
    // cleanContent = cleanContent.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi, "");
    
    // Mejorar visualización básica
    cleanContent = cleanContent.replace(/<p/g, '<p class="mb-4"');
  } catch (error) {
    console.error("Error en la limpieza del contenido:", error);
    return content; // Devolver el contenido original si hay error
  }
  
  // Si después de limpiar hay poco contenido, usar el original
  if (cleanContent.trim().length < 50 && content.length > 100) {
    // console.log("La limpieza eliminó demasiado contenido, usando original");
    return content;
  }
  
  return cleanContent;
};

export default function DefaultPropertyContent({ property }) {
  // console.log("Renderizando PropertyContent con propiedad:", property ? `ID: ${property.id || property._id}` : 'null');
  
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
  const [imageLoading, setImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [imageTimeout, setImageTimeout] = useState(null);
  const [propertyData, setPropertyData] = useState({
    livingArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    floor: 0
  });
  
  // Nuevo estado para guardar la propiedad actualizada desde MongoDB
  const [propertyState, setPropertyState] = useState(property);
  
  // Añadir dentro del componente principal cerca de otros useState
  const [mapLocation, setMapLocation] = useState(() => {
    // Calcular coordenadas iniciales para SSR
    if (property?.coordinates?.lat && property?.coordinates?.lng) {
      return { lat: parseFloat(property.coordinates.lat), lng: parseFloat(property.coordinates.lng) };
    }
    return { lat: 40.4167, lng: -3.7037 };
  }); // Coordenadas por defecto de Madrid
  const [formattedAddress, setFormattedAddress] = useState(() => {
    // Calcular dirección inicial para SSR (evitar mapa vacío)
    if (!property) return "Madrid, España";
    const addr = property.address || property.location || property.name || property.title || "";
    if (!addr) return "Madrid, España";
    let result = typeof addr === 'string' ? addr : (addr?.toString() || "Madrid, España");
    if (!result.toLowerCase().includes("madrid")) result += ", Madrid";
    if (!result.toLowerCase().includes("españa")) result += ", España";
    return result;
  }); // Estado para guardar la dirección formateada
  
  // Evento para recibir datos de MongoDB a través del script de integración
  useEffect(() => {
    const handleMongoDBPropertyData = (event) => {
      // console.log("PropertyContent: Recibidos datos de propiedad MongoDB:", event.detail);
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
    // console.log("Contenido raw inicial:", rawContent.substring(0, 100));
    
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
    // console.log("Contenido original length:", rawContent.length);
    // console.log("Contenido procesado length:", processedContent.length);
    
    // Si el contenido procesado está vacío o muy corto, usar el original
    if (!processedContent || processedContent.trim().length < 20) {
      // console.log("El contenido procesado está vacío, usando el original");
      processedContent = rawContent;
    }
    
    // Actualizar el estado con el contenido procesado
    // console.log("Estableciendo cleanedContent");
    setCleanedContent(processedContent);
    
  }, [propertyState]);

  // Actualizar el manejo de errores de imágenes
  const handleImageError = (e) => {
    console.warn('[PropertyContent] Error loading image:', e.target.src);
    
    // Si la imagen es de Cloudinary y falla, intentar con proxy
    const originalSrc = e.target.src;
    if (originalSrc.includes('cloudinary') && !originalSrc.includes('/api/proxy-image')) {
      console.log('[PropertyContent] Intentando cargar imagen via proxy...');
      try {
        const newSrc = `/api/proxy-image?url=${encodeURIComponent(originalSrc)}`;
        e.target.src = newSrc;
        return; // Salir para que intente cargar la nueva URL
      } catch (error) {
        console.error('[PropertyContent] Error al generar URL del proxy:', error);
      }
    } else {
      // Si es una URL local o ya es proxy, mostrar mensaje de no disponible
      // console.log("URL no es HTTP o ya es proxy, mostrando mensaje de no disponible");
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
    
    // SIEMPRE ocultar el loader cuando hay un error
    setImageLoading(false);
    
    // Marcar la imagen actual como cargada (aunque sea la de error)
    setLoadedImages(prev => ({
      ...prev,
      [current]: true
    }));
  };

  // Función para avanzar a la siguiente imagen
  const nextImage = () => {
    const newIndex = (current + 1) % propertyImages.length;
    
    // Limpiar timeout anterior
    if (imageTimeout) {
      clearTimeout(imageTimeout);
      setImageTimeout(null);
    }
    
    setCurrent(newIndex);
    
    // Solo mostrar loader si la imagen no está previamente cargada
    if (!loadedImages[newIndex]) {
      setImageLoading(true);
      
      // Timeout de seguridad para ocultar el loader después de 5 segundos
      const timeout = setTimeout(() => {
        console.warn('[PropertyContent] Timeout: Ocultando loader después de 5 segundos');
        setImageLoading(false);
        setLoadedImages(prev => ({ ...prev, [newIndex]: true }));
      }, 5000);
      
      setImageTimeout(timeout);
    } else {
      setImageLoading(false);
    }
  };

  // Función para retroceder a la imagen anterior
  const prevImage = () => {
    const newIndex = (current - 1 + propertyImages.length) % propertyImages.length;
    
    // Limpiar timeout anterior
    if (imageTimeout) {
      clearTimeout(imageTimeout);
      setImageTimeout(null);
    }
    
    setCurrent(newIndex);
    
    // Solo mostrar loader si la imagen no está previamente cargada
    if (!loadedImages[newIndex]) {
      setImageLoading(true);
      
      // Timeout de seguridad para ocultar el loader después de 5 segundos
      const timeout = setTimeout(() => {
        console.warn('[PropertyContent] Timeout: Ocultando loader después de 5 segundos');
        setImageLoading(false);
        setLoadedImages(prev => ({ ...prev, [newIndex]: true }));
      }, 5000);
      
      setImageTimeout(timeout);
    } else {
      setImageLoading(false);
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

  // useEffect para manejar el estado inicial del loader  
  useEffect(() => {
    if (propertyImages && propertyImages.length > 0) {
      // Reiniciar estado cuando cambien las imágenes
      setLoadedImages({});
      setCurrent(0);
      
      // Solo mostrar loader para la primera imagen si no se ha cargado aún
      setImageLoading(true);
      
      // Timeout de seguridad inicial
      const timeout = setTimeout(() => {
        console.warn('[PropertyContent] Timeout inicial: Ocultando loader después de 5 segundos');
        setImageLoading(false);
        setLoadedImages(prev => ({ ...prev, [0]: true }));
      }, 5000);
      
      setImageTimeout(timeout);
    } else {
      // Si no hay imágenes, no mostrar loader
      setImageLoading(false);
      if (imageTimeout) {
        clearTimeout(imageTimeout);
        setImageTimeout(null);
      }
    }
    
    // Cleanup al desmontar o cambiar
    return () => {
      if (imageTimeout) {
        clearTimeout(imageTimeout);
      }
    };
  }, [propertyImages]);

  // Efecto para pre-cargar las imágenes adyacentes
  useEffect(() => {
    // Asegurarse de que se ejecuta solo en el cliente
    if (typeof window === 'undefined' || propertyImages.length <= 1) return;
    
    const nextIndex = (current + 1) % propertyImages.length;
    const prevIndex = (current - 1 + propertyImages.length) % propertyImages.length;
    
    // Pre-cargar la siguiente imagen
    if (propertyImages[nextIndex] && !loadedImages[nextIndex]) {
      // Usar window.Image explícitamente
      const nextImg = new window.Image(); 
      nextImg.src = propertyImages[nextIndex].src;
      nextImg.onload = () => {
        setLoadedImages(prev => ({
          ...prev,
          [nextIndex]: true
        }));
      };
      // Manejar posible error de carga
      nextImg.onerror = () => {
        console.warn(`[PropertyContent] Error pre-loading image: ${propertyImages[nextIndex].src}`);
        // Marcar como cargada igualmente para no reintentar infinitamente
        setLoadedImages(prev => ({ ...prev, [nextIndex]: true })); 
      };
    }
    
    // Pre-cargar la imagen anterior
    if (propertyImages[prevIndex] && !loadedImages[prevIndex]) {
       // Usar window.Image explícitamente
      const prevImg = new window.Image();
      prevImg.src = propertyImages[prevIndex].src;
      prevImg.onload = () => {
        setLoadedImages(prev => ({
          ...prev,
          [prevIndex]: true
        }));
      };
       // Manejar posible error de carga
      prevImg.onerror = () => {
        console.warn(`[PropertyContent] Error pre-loading image: ${propertyImages[prevIndex].src}`);
        // Marcar como cargada igualmente para no reintentar infinitamente
        setLoadedImages(prev => ({ ...prev, [prevIndex]: true }));
      };
    }
  }, [current, propertyImages, loadedImages]);

  // Modificar el useEffect para extraer y mostrar mejor la dirección
  useEffect(() => {
    // Extraer ubicación para el mapa
    const extractLocationForMap = () => {
      if (!propertyState) return { lat: 40.4167, lng: -3.7037 }; // Coordenadas por defecto de Madrid
      
      try {
        console.log('[PropertyContent] 🗺️ Extrayendo coordenadas para:', propertyState.title);
        console.log('[PropertyContent] 📍 Datos de propiedad disponibles:', {
          coordinates: propertyState.coordinates,
          location: propertyState.location,
          address: propertyState.address,
          source: propertyState.source
        });

        // ✅ PRIORIDAD 1: Buscar coordenadas directas de MongoDB (estructura normalizada)
        if (propertyState.coordinates) {
          const { lat, lng } = propertyState.coordinates;
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
            console.log(`[PropertyContent] ✅ Coordenadas de MongoDB encontradas: ${coordinates.lat}, ${coordinates.lng}`);
            return coordinates;
          }
        }

        // ✅ PRIORIDAD 2: Buscar en meta_data si es de WooCommerce
        if (propertyState.meta_data && Array.isArray(propertyState.meta_data)) {
          // Buscar coordenadas en meta_data
          const coordinatesMeta = propertyState.meta_data.find(
            meta => meta.key === 'coordinates' || meta.key === 'location' || meta.key === 'map_location'
          );
          
          if (coordinatesMeta && coordinatesMeta.value) {
            const value = coordinatesMeta.value;
            
            // Si es un string con formato "lat,lng"
            if (typeof value === 'string' && value.includes(',')) {
              const [lat, lng] = value.split(',').map(num => parseFloat(num.trim()));
              if (!isNaN(lat) && !isNaN(lng)) {
                console.log(`[PropertyContent] ✅ Coordenadas de meta_data (string): ${lat}, ${lng}`);
                return { lat, lng };
              }
            }
            
            // Si es un objeto con lat y lng
            if (typeof value === 'object' && value.lat && value.lng) {
              const lat = parseFloat(value.lat);
              const lng = parseFloat(value.lng);
              if (!isNaN(lat) && !isNaN(lng)) {
                console.log(`[PropertyContent] ✅ Coordenadas de meta_data (objeto): ${lat}, ${lng}`);
                return { lat, lng };
              }
            }
          }
        }

        // ✅ PRIORIDAD 3: Coordenadas por defecto basadas en la ubicación conocida
        const location = propertyState.location || propertyState.address || '';
        
        // Mapeo de ubicaciones conocidas de Madrid a coordenadas aproximadas
        const madridLocations = {
          'la latina': { lat: 40.4086, lng: -3.7097 },
          'salamanca': { lat: 40.4359, lng: -3.6774 },
          'malasaña': { lat: 40.4254, lng: -3.7031 },
          'chueca': { lat: 40.4254, lng: -3.6976 },
          'chamberí': { lat: 40.4459, lng: -3.7026 },
          'retiro': { lat: 40.4153, lng: -3.6844 },
          'centro': { lat: 40.4168, lng: -3.7038 },
          'sol': { lat: 40.4168, lng: -3.7038 },
          'moncloa': { lat: 40.4378, lng: -3.7169 },
          'tetuán': { lat: 40.4647, lng: -3.6986 },
          // Calles específicas que hemos mapeado
          'antonia merce': { lat: 40.4231, lng: -3.6836 },
          'padilla': { lat: 40.4284, lng: -3.6787 },
          'diego de león': { lat: 40.4403, lng: -3.6774 },
          'general pardiñas': { lat: 40.4326, lng: -3.6798 },
          'ortega y gasset': { lat: 40.4368, lng: -3.6829 },
          'general díaz porlier': { lat: 40.4392, lng: -3.6742 },
          'ayala': { lat: 40.4315, lng: -3.6775 },
          'montera': { lat: 40.4186, lng: -3.7018 },
          'isabel la católica': { lat: 40.4136, lng: -3.7053 },
          'principe de vergara': { lat: 40.4251, lng: -3.6836 },
          'ventura de la vega': { lat: 40.4153, lng: -3.6984 },
          'hermosilla': { lat: 40.4346, lng: -3.6756 }
        };

        // Buscar coincidencia en ubicaciones conocidas
        const locationLower = location.toLowerCase();
        for (const [key, coords] of Object.entries(madridLocations)) {
          if (locationLower.includes(key)) {
            console.log(`[PropertyContent] ✅ Coordenadas estimadas para '${key}': ${coords.lat}, ${coords.lng}`);
            return coords;
          }
        }

        // Ubicación por defecto (Centro de Madrid)
        console.log('[PropertyContent] ⚠️ Usando coordenadas por defecto de Madrid centro');
        return { lat: 40.4167, lng: -3.7037 };
      
      } catch (error) {
        console.error("[PropertyContent] ❌ Error al extraer ubicación para el mapa:", error);
        return { lat: 40.4167, lng: -3.7037 }; // Coordenadas por defecto de Madrid
      }
    };
    
    // Extraer y formatear la dirección de la propiedad
    const extractAddress = () => {
      if (!propertyState) return "Madrid, España";
      
      try {
        let address = "";
        
        // Usar el nombre de la propiedad como dirección principal si existe
        // La mayoría de propiedades en la API tienen el nombre como la dirección
        if (propertyState.name) {
          // Verificar si el nombre contiene información de dirección
          const name = propertyState.name.trim();
          
          // Si el nombre parece una dirección (contiene palabras como Calle, Avenida, etc.)
          if (name.match(/calle|avenida|plaza|paseo|vía|c\/|avda\.|pl\.|pº\.|principe|alcalde|jorge|lope|castelló|castelló|goya/i)) {
            address = name;
            
            // Asegurarse de que termine con "Madrid" o la ciudad correspondiente
            if (!address.toLowerCase().includes("madrid")) {
              address += ", Madrid";
            }
            
            return address;
          }
          
          // Si el nombre NO parece una dirección completa, pero puede ser parte de una
          address = name;
        }
        
        // Opción 1: Buscar en la propiedad directamente
        if (propertyState.address && !address) {
          // Si es un objeto, intentar convertirlo a string
          if (typeof propertyState.address === 'object') {
            // Si el objeto tiene una propiedad address, utilizarla
            if (propertyState.address.address) {
              // Verificar que la dirección sea española
              const addressStr = propertyState.address.address.toString();
              if (addressStr.toLowerCase().includes("spain") || 
                  addressStr.toLowerCase().includes("españa") || 
                  addressStr.toLowerCase().includes("madrid") ||
                  addressStr.toLowerCase().includes("barcelona")) {
                address = addressStr;
              } else {
                // Si no es una dirección española, usar el nombre de la propiedad
                address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
              }
            } 
            // Si tiene lat y lng, formatear como coordenadas
            else if (propertyState.address.lat && propertyState.address.lng) {
              const lat = parseFloat(propertyState.address.lat);
              const lng = parseFloat(propertyState.address.lng);
              if (!isNaN(lat) && !isNaN(lng)) {
                // Usar las coordenadas como parte de la dirección
                setMapLocation({ lat, lng }); // Actualizar mapLocation con las coordenadas exactas
                
                // Verificar si las coordenadas parecen ser de España (-10 a 5 longitud, 35 a 44 latitud aproximadamente)
                const isLikelySpain = (lng >= -10 && lng <= 5 && lat >= 35 && lat <= 44);
                
                if (isLikelySpain) {
                  // Intentar usar cualquier información adicional disponible
                  const parts = [];
                  if (propertyState.address.street_name) parts.push(propertyState.address.street_name);
                  if (propertyState.address.city) parts.push(propertyState.address.city);
                  
                  if (parts.length > 0) {
                    // Verificar que no contiene localizaciones no españolas
                    const joinedParts = parts.join(", ").toLowerCase();
                    if (!joinedParts.includes("australia") && 
                        !joinedParts.includes("canada") && 
                        !joinedParts.includes("germany") &&
                        !joinedParts.includes("usa") &&
                        !joinedParts.includes("united states")) {
                      address = parts.join(", ");
                      
                      // Añadir Madrid, España si no está ya incluido
                      if (!address.toLowerCase().includes("madrid")) {
                        address += ", Madrid";
                      }
                      if (!address.toLowerCase().includes("españa")) {
                        address += ", España";
                      }
                    } else {
                      // Si contiene palabras clave de otros países, usar nombre de propiedad
                      address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
                    }
                  } else {
                    // Si no hay partes de dirección disponibles, usar el nombre de la propiedad
                    address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
                  }
                } else {
                  // Las coordenadas no parecen ser de España, usar el nombre de la propiedad
                  address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
                }
              }
            }
            // Intentar convertir el objeto a string como último recurso
            else {
              try {
                // Filtrar solo valores que parezcan ser de España
                const addressValues = Object.values(propertyState.address)
                  .filter(val => {
                    if (typeof val !== 'string') return false;
                    const valLower = val.toLowerCase().trim();
                    return valLower !== '' && 
                          !valLower.includes("australia") && 
                          !valLower.includes("canada") &&
                          !valLower.includes("germany") &&
                          !valLower.includes("usa") &&
                          !valLower.includes("united states");
                  })
                  .join(", ");
                
                if (addressValues) {
                  address = addressValues;
                  
                  // Añadir Madrid, España si no está ya incluido
                  if (!address.toLowerCase().includes("madrid")) {
                    address += ", Madrid";
                  }
                  if (!address.toLowerCase().includes("españa")) {
                    address += ", España";
                  }
                } else {
                  // Si no hay valores válidos, usar el nombre de la propiedad
                  address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
                }
              } catch (error) {
                console.error("Error al procesar dirección compleja:", error);
                // Usar el nombre de la propiedad en caso de error
                address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
              }
            }
          } else {
            // Es un string, verificar que sea una dirección española
            const addressStr = propertyState.address.toString().toLowerCase();
            if (addressStr.includes("spain") || 
                addressStr.includes("españa") || 
                addressStr.includes("madrid") ||
                addressStr.includes("barcelona")) {
              address = propertyState.address;
            } else if (addressStr.includes("australia") ||
                      addressStr.includes("canada") ||
                      addressStr.includes("germany") ||
                      addressStr.includes("usa") ||
                      addressStr.includes("united states")) {
              // Si contiene palabras clave de otros países, usar nombre de propiedad
              address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
            } else {
              // Si no se identifica claramente, añadir Madrid, España al final
              address = propertyState.address;
              
              // Añadir Madrid, España si no está ya incluido
              if (!address.toLowerCase().includes("madrid")) {
                address += ", Madrid";
              }
              if (!address.toLowerCase().includes("españa")) {
                address += ", España";
              }
            }
          }
        } 
        // Opción 2: Buscar en la propiedad location
        else if (propertyState.location && !address) {
          // Manejar también si location es un objeto
          if (typeof propertyState.location === 'object') {
            // Similar al manejo de address como objeto
            try {
              // Filtrar solo valores que parezcan ser de España
              const locationValues = Object.values(propertyState.location)
                .filter(val => {
                  if (typeof val !== 'string') return false;
                  const valLower = val.toLowerCase().trim();
                  return valLower !== '' && 
                        !valLower.includes("australia") && 
                        !valLower.includes("canada") &&
                        !valLower.includes("germany") &&
                        !valLower.includes("usa") &&
                        !valLower.includes("united states");
                })
                .join(", ");
              
              if (locationValues) {
                address = locationValues;
                
                // Añadir Madrid, España si no está ya incluido
                if (!address.toLowerCase().includes("madrid")) {
                  address += ", Madrid";
                }
                if (!address.toLowerCase().includes("españa")) {
                  address += ", España";
                }
              } else {
                // Si no hay valores válidos, usar el nombre de la propiedad
                address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
              }
            } catch (error) {
              console.error("Error al procesar location compleja:", error);
              // Usar el nombre de la propiedad en caso de error
              address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
            }
          } else {
            // Es un string, verificar que sea una ubicación española
            const locationStr = propertyState.location.toString().toLowerCase();
            if (locationStr.includes("spain") || 
                locationStr.includes("españa") || 
                locationStr.includes("madrid") ||
                locationStr.includes("barcelona")) {
              address = propertyState.location;
            } else if (locationStr.includes("australia") ||
                      locationStr.includes("canada") ||
                      locationStr.includes("germany") ||
                      locationStr.includes("usa") ||
                      locationStr.includes("united states")) {
              // Si contiene palabras clave de otros países, usar nombre de propiedad
              address = propertyState.name ? propertyState.name + ", Madrid, España" : "Madrid, España";
            } else {
              // Si no se identifica claramente, añadir Madrid, España al final
              address = propertyState.location;
              
              // Añadir Madrid, España si no está ya incluido
              if (!address.toLowerCase().includes("madrid")) {
                address += ", Madrid";
              }
              if (!address.toLowerCase().includes("españa")) {
                address += ", España";
              }
            }
          }
        }
        // Opción 3: Buscar en meta_data
        else if (propertyState.meta_data && Array.isArray(propertyState.meta_data) && !address) {
          // Buscar campos comunes para dirección
          const addressFields = ['address', 'direccion', 'location', 'ubicacion'];
          
          for (const field of addressFields) {
            const meta = propertyState.meta_data.find(m => m.key.toLowerCase() === field.toLowerCase());
            if (meta && meta.value) {
              // Si el valor es un objeto, procesarlo
              if (typeof meta.value === 'object') {
                try {
                  // Si tiene propiedad address, usarla
                  if (meta.value.address) {
                    const metaAddressStr = meta.value.address.toString().toLowerCase();
                    if (metaAddressStr.includes("spain") || 
                        metaAddressStr.includes("españa") || 
                        metaAddressStr.includes("madrid") ||
                        metaAddressStr.includes("barcelona")) {
                      address = meta.value.address;
                    } else if (metaAddressStr.includes("australia") ||
                              metaAddressStr.includes("canada") ||
                              metaAddressStr.includes("germany") ||
                              metaAddressStr.includes("usa") ||
                              metaAddressStr.includes("united states")) {
                      // Si contiene palabras clave de otros países, omitirlo
                      continue;
                    } else {
                      // Si no se identifica claramente, usar pero añadir Madrid, España
                      address = meta.value.address;
                      
                      // Añadir Madrid, España si no está ya incluido
                      if (!address.toLowerCase().includes("madrid")) {
                        address += ", Madrid";
                      }
                      if (!address.toLowerCase().includes("españa")) {
                        address += ", España";
                      }
                    }
                    break;
                  }
                  // Si tiene lat y lng, actualizar mapLocation
                  else if (meta.value.lat && meta.value.lng) {
                    const lat = parseFloat(meta.value.lat);
                    const lng = parseFloat(meta.value.lng);
                    if (!isNaN(lat) && !isNaN(lng)) {
                      // Verificar si las coordenadas parecen ser de España (-10 a 5 longitud, 35 a 44 latitud aproximadamente)
                      const isLikelySpain = (lng >= -10 && lng <= 5 && lat >= 35 && lat <= 44);
                      
                      if (isLikelySpain) {
                        setMapLocation({ lat, lng });
                        break;
                      } else {
                        // Ignorar coordenadas que no son de España
                        continue;
                      }
                    }
                  }
                  // Intentar extraer valores del objeto
                  const metaValues = Object.values(meta.value)
                    .filter(val => {
                      if (typeof val !== 'string') return false;
                      const valLower = val.toLowerCase().trim();
                      return valLower !== '' && 
                            !valLower.includes("australia") && 
                            !valLower.includes("canada") &&
                            !valLower.includes("germany") &&
                            !valLower.includes("usa") &&
                            !valLower.includes("united states");
                    })
                    .join(", ");
                  
                  if (metaValues) {
                    address = metaValues;
                    
                    // Añadir Madrid, España si no está ya incluido
                    if (!address.toLowerCase().includes("madrid")) {
                      address += ", Madrid";
                    }
                    if (!address.toLowerCase().includes("españa")) {
                      address += ", España";
                    }
                    break;
                  }
                } catch (error) {
                  console.error("Error al procesar meta_data compleja:", error);
                  continue; // Continuar con el siguiente campo
                }
              } else {
                // Es un string, verificar que sea una ubicación española
                const metaValueStr = meta.value.toString().toLowerCase();
                if (metaValueStr.includes("spain") || 
                    metaValueStr.includes("españa") || 
                    metaValueStr.includes("madrid") ||
                    metaValueStr.includes("barcelona")) {
                  address = meta.value;
                  break;
                } else if (metaValueStr.includes("australia") ||
                          metaValueStr.includes("canada") ||
                          metaValueStr.includes("germany") ||
                          metaValueStr.includes("usa") ||
                          metaValueStr.includes("united states")) {
                  // Si contiene palabras clave de otros países, ignorar
                  continue;
                } else {
                  // Si no se identifica claramente, añadir Madrid, España al final
                  address = meta.value;
                  
                  // Añadir Madrid, España si no está ya incluido
                  if (!address.toLowerCase().includes("madrid")) {
                    address += ", Madrid";
                  }
                  if (!address.toLowerCase().includes("españa")) {
                    address += ", España";
                  }
                  break;
                }
              }
            }
          }
        }
        
        // Si aún no hay dirección y ya tenemos el nombre, usamos el nombre como dirección
        if (!address && propertyState.name) {
          address = propertyState.name;
        }
        
        // Si no se encontró dirección, intentar crear una a partir del título y ubicación
        if (!address && (propertyState.title || propertyState.name)) {
          const title = propertyState.title || propertyState.name;
          // Extraer posible ubicación del título (ej: "Piso en Malasaña")
          const locationMatch = title.match(/en\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
          if (locationMatch && locationMatch[1]) {
            address = `${locationMatch[1]}, Madrid, España`;
          } else {
            // Si no hay match, usar el título completo
            address = title;
          }
        }
        
        // Si aún no hay dirección, usar un valor predeterminado
        if (!address) {
          address = "Madrid, España";
        }
        
        // Garantizar que la dirección incluya "Madrid, España" si no está presente
        if (!address.toLowerCase().includes("madrid")) {
          address = `${address}, Madrid, España`;
        } else if (!address.toLowerCase().includes("españa") && address.toLowerCase().includes("madrid")) {
          address = `${address}, España`;
        }
        
        // Verificar una última vez que no contenga países no deseados
        const finalAddressLower = address.toLowerCase();
        if (finalAddressLower.includes("australia") || 
            finalAddressLower.includes("canada") || 
            finalAddressLower.includes("germany") ||
            finalAddressLower.includes("duisburg") ||
            finalAddressLower.includes("kardinya") ||
            finalAddressLower.includes("qc") ||
            finalAddressLower.includes("wa") ||
            finalAddressLower.includes("king est")) {
          // Si contiene palabras clave de otros países, usar un valor predeterminado con el nombre
          return propertyState.name ? `${propertyState.name}, Madrid, España` : "Madrid, España";
        }
        
        // Asegurarse de que address sea un string
        if (typeof address !== 'string') {
          console.error("La dirección no es un string:", address);
          address = "Madrid, España";
        }
        
        return address;
      } catch (error) {
        console.error("Error al extraer dirección:", error);
        return "Madrid, España";
      }
    };
    
    // Establecer ubicación para el mapa
    const location = extractLocationForMap();
    setMapLocation(location);
    
    // Establecer dirección formateada
    const address = extractAddress();
    setFormattedAddress(address);
    
  }, [propertyState]);

  // <<< LOG AÑADIDO >>>
  console.log('[PropertyContent Render] Estado propertyData:', propertyData);

  if (!propertyState) {
    // console.log("Renderizando estado de propiedad no disponible");
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg">Información de la propiedad no disponible</p>
      </div>
    );
  }

  // console.log("Renderizando propiedad completa:", propertyState.title || propertyState.name);
  // console.log("Imágenes disponibles:", propertyImages.length);
  
  // Extraer datos básicos de la propiedad
  const title = propertyState.title || propertyState.name || 'Propiedad sin título';
  const description = cleanedContent || propertyState.description || '';
  
  // SOLUCIÓN DEFINITIVA: No formatear precios de MongoDB, mostrarlos exactamente como vienen
  const isFromMongoDB = propertyState?.source === 'mongodb' || propertyState?._id;
  let formattedPrice = 'Consultar precio';
  let price; // Variable para usar en el render
  
  try {
    // ***** IMPLEMENTACIÓN CRÍTICA *****
    // Para propiedades de MongoDB: NUNCA modificar el precio, usar EXACTAMENTE como viene
    if (isFromMongoDB) {
      // Acceder directamente al campo que viene en el objeto original sin manipulación
      if (propertyState._original && propertyState._original.price) {
        // Log para debug - original sin manipulación
        console.log('PropertyContent - PRECIO ORIGINAL DE MONGODB:', propertyState._original.price);
        
        // Si _original.price ya es un número formateado como string (ej. "2.500.000 €"), usarlo directamente
        if (typeof propertyState._original.price === 'string') {
          formattedPrice = propertyState._original.price;
          console.log('PropertyContent - Usando precio original string de MongoDB:', formattedPrice);
          return; // No procesar más, usar exactamente como viene
        }
        
        price = propertyState._original.price;
      } 
      // Si no hay _original, intentar con priceNumeric aplicando corrección especial para punto decimal
      else if (propertyState.priceNumeric !== undefined && propertyState.priceNumeric !== null) {
        // CORRECCIÓN CRUCIAL: Detectar si el número tiene forma de precio español con formato americano
        // Si es menor que 10 y tiene decimales, probablemente sea un precio en miles con punto decimal
        let priceNum = propertyState.priceNumeric;
        
        // Convertir a string para analizar
        const priceStr = String(priceNum);
        
        // Verificar si tiene formato de precio español incorrectamente almacenado (1.299 debe ser 1.299.000)
        if (priceNum < 10 && priceStr.includes('.')) {
          // CORRECCIÓN CRUCIAL: Multiplicar por 1,000,000 para obtener el precio real en euros
          // 1.299 → 1,299,000 euros (un millón doscientos noventa y nueve mil euros)
          const cleanPrice = parseFloat(priceStr.replace(/[^\d.-]/g, '')) * 1000000;
          console.log('PropertyContent MongoDB - Corrigiendo precio en formato millón euros:', priceNum, ' a ', cleanPrice);
          price = cleanPrice;
        } else {
          price = priceNum;
        }
        
        console.log('PropertyContent MongoDB - Precio final tras análisis:', price);
      } 
      // Último recurso: usar el precio sin ninguna manipulación
      else if (propertyState.price !== undefined && propertyState.price !== null) {
        console.log('PropertyContent MongoDB - Usando price sin manipular:', propertyState.price);
        
        // Si ya es una cadena formateada, usarla directamente
        if (typeof propertyState.price === 'string' && propertyState.price.includes('€')) {
          formattedPrice = propertyState.price;
          return; // No procesar más
        } else {
          price = propertyState.price;
        }
      }
    } 
    // WORDPRESS: Aplicar correcciones solo para datos de WordPress
    else {
      let priceToFormat = propertyState.price;
      if (priceToFormat !== undefined && priceToFormat !== null && priceToFormat !== '') {
        // Convertir a número si es necesario
        price = typeof priceToFormat === 'number' 
          ? priceToFormat
          : parseFloat(String(priceToFormat).replace(/[^\d.-]/g, ''));
        
        // Solo para WordPress, aplicar correcciones
        if (!isNaN(price) && isFinite(price) && price > 0) {
          if (price < 10000 && price > 100) {
            price = price * 1000;
            console.log('PropertyContent WordPress - Precio corregido:', price);
          }
        }
      }
    }
    
    // Verificar que tenemos un precio válido y formatearlo
    if (!isNaN(price) && isFinite(price) && price > 0) {
      // Formatear sin style: 'currency' para evitar duplicación del símbolo del euro
      formattedPrice = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price) + ' €';
      console.log('PropertyContent - Precio final formateado:', formattedPrice);
    } else {
      console.warn('PropertyContent: Precio inválido', {
        priceNumeric: propertyState.priceNumeric,
        price: propertyState.price,
        convertedPrice: price,
        title: propertyState.title
      });
    }
  } catch (error) {
    console.error('Error al formatear precio:', error);
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
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight" itemProp="name">{title}</h2>
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
              {imageLoading && propertyImages && propertyImages.length > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-amarillo/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-amarillo border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-white text-sm font-light">Cargando imagen...</p>
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
                    console.log('[PropertyContent] Imagen cargada correctamente:', current);
                    
                    // Limpiar timeout si existe
                    if (imageTimeout) {
                      clearTimeout(imageTimeout);
                      setImageTimeout(null);
                    }
                    
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
            
            {(() => {
              // Calcular valores directamente desde propertyState para garantizar SSR correcto
              // propertyData se establece via useEffect que no se ejecuta en SSR
              const p = propertyState || property;
              const displayArea = propertyData?.livingArea || parseInt(p?.m2, 10) || parseInt(p?.area, 10) || parseInt(p?.size, 10) || (p?.features && parseInt(p?.features?.area, 10)) || 0;
              const displayBedrooms = propertyData?.bedrooms || parseInt(p?.bedrooms, 10) || parseInt(p?.rooms, 10) || (p?.features && parseInt(p?.features?.bedrooms, 10)) || 0;
              const displayBathrooms = propertyData?.bathrooms || parseInt(p?.bathrooms, 10) || parseInt(p?.wc, 10) || (p?.features && parseInt(p?.features?.bathrooms, 10)) || 0;
              const displayFloor = propertyData?.floor || parseInt(p?.piso, 10) || parseInt(p?.floor, 10) || (p?.features && parseInt(p?.features?.floor, 10)) || 0;
              return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-10">
              {displayArea > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaRuler className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{displayArea} m²</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Superficie</p>
                  </div>
                </div>
              )}
              
              {displayBedrooms > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBed className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{displayBedrooms}</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Habitaciones</p>
                  </div>
                </div>
              )}
              
              {displayBathrooms > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBath className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{displayBathrooms}</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Baños</p>
                  </div>
                </div>
              )}
              
              {displayFloor > 0 && (
                <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl shadow-2xl transition-transform hover:scale-105 border border-amarillo/20 overflow-hidden group">
                  <div className="bg-gradient-to-r from-amarillo to-amarillo/90 p-6 flex justify-center">
                    <FaBuilding className="text-3xl text-black" />
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <p className="text-4xl font-bold text-white mb-2">{displayFloor}ª</p>
                    <p className="text-lg text-gray-300 group-hover:text-amarillo transition-colors">Planta</p>
                  </div>
                </div>
              )}
                          
            </div>
              );
            })()}
          </div>

          {/* Mapa de Ubicación con manejo robusto de errores */}
          <div className="mt-12 mb-16 bg-black/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-amarillo/20 overflow-hidden">
            <div className="p-8 border-b border-amarillo/20 flex items-center">
              <FaMapMarkerAlt className="text-amarillo mr-4 text-4xl" />
              <h2 className="text-3xl font-bold tracking-wide !text-amarillo">Ubicación Premium</h2>
            </div>
            
            <div className="p-6">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-amarillo/20" style={{ height: '400px' }}>
                {/* Mapa robusto con fallback */}
                <div className="relative w-full h-full">
                  {/* Usar iframe básico de Google Maps sin API key y manejar diferentes formatos de dirección */}
                  <iframe 
                    src={typeof formattedAddress === 'string' ? 
                      `https://www.google.com/maps?q=${encodeURIComponent(formattedAddress)}&output=embed&z=16` : 
                      `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&output=embed&z=16`
                    }
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de la propiedad"
                    onError={(e) => {
                      console.warn('[PropertyContent] Error al cargar Google Maps:', e);
                    }}
                    onLoad={() => {
                      console.log('[PropertyContent] Google Maps cargado correctamente');
                    }}
                  ></iframe>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-white text-lg">
                  {typeof formattedAddress === 'string' ? formattedAddress : "Madrid, España"}
                </p>
                <a 
                  href={typeof formattedAddress === 'string' ? 
                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formattedAddress)}` : 
                    `https://www.google.com/maps/dir/?api=1&destination=${mapLocation.lat},${mapLocation.lng}`
                  }
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 mt-4 bg-amarillo text-black px-4 py-2 rounded-lg hover:bg-amarillo/90 transition-colors"
                >
                  <FaMapMarkerAlt /> Cómo llegar
                </a>
              </div>
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
                          
                          // console.log('Enviando datos de visita:', visitData);
                          
                          // Usar la ruta directa al backend
                          const response = await fetch(`/api/property-visit/create`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(visitData)
                          });
                          
                          // Logs adicionales para depuración
                          // console.log('Estado de respuesta visita:', response.status);
                          // console.log('Headers de respuesta:', Object.fromEntries([...response.headers.entries()]));
                          
                          if (!response.ok) {
                            const errorText = await response.text();
                            console.error('Error del servidor:', errorText);
                            
                            // Si es un timeout (504), informar que se usó el servicio de respaldo
                            if (response.status === 504) {
                              throw new Error('El servidor tardó demasiado, pero tu solicitud de visita se envió usando el servicio de respaldo. Te contactaremos pronto.');
                            }
                            
                            throw new Error('Error al enviar la solicitud de visita');
                          }
                          
                          const data = await response.json();
                          // console.log("Respuesta API visita:", data);
                          
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
                        
                        // console.log('Enviando datos de oferta:', offerData);
                        
                        // Usar la ruta directa al backend
                        const response = await fetch(`/api/property-offer/create`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(offerData)
                        });
                        
                        // Logs adicionales para depuración
                        // console.log('Estado de respuesta oferta:', response.status);
                        // console.log('Headers de respuesta:', Object.fromEntries([...response.headers.entries()]));
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('Error del servidor:', errorText);
                          
                          // Si es un timeout (504), informar que se usó el servicio de respaldo
                          if (response.status === 504) {
                            throw new Error('El servidor tardó demasiado, pero tu oferta se envió usando el servicio de respaldo. Te contactaremos pronto.');
                          }
                          
                          throw new Error('Error al enviar la oferta');
                        }
                        
                        const data = await response.json();
                        // console.log("Respuesta API oferta:", data);
                        
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

