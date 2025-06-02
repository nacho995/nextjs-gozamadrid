import React from 'react';
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/legacy/image";
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaEuroSign, FaFilter, FaCalculator, FaTimes, FaHome, FaArrowRight, FaEye } from 'react-icons/fa';
import { normalizeProperty, filterProperties } from '../utils/properties';
import ControlMenu from './header';
import { useProperties } from '../hooks/useProperties';
import SmartLocationSearch from './smart-location-search';

const Video = () => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const videoRef = useRef(null);
    const isInitializedRef = useRef(false);

    // Estado inicial consistente para SSR - usando rutas directas a public
    const [videoSrc, setVideoSrc] = useState("/video.mp4");
    const [isClientHydrated, setIsClientHydrated] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoErrorMessage, setVideoErrorMessage] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    // Un solo useEffect para la inicialización del cliente
    useEffect(() => {
        if (isInitializedRef.current) return;
        
        setIsClientHydrated(true);
        isInitializedRef.current = true;
        
        console.log('[Video] (Cliente Hidratado) Iniciando configuración del video con src:', videoSrc);
        
        // Cargar script de diagnóstico solo en producción y una vez
        if (window.location.hostname === 'www.realestategozamadrid.com') {
            const existingScript = document.querySelector('script[src="/video-diagnostic.js"]');
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = '/video-diagnostic.js';
                script.async = true;
                document.head.appendChild(script);
            }
        }
    }, []);

    // Función para verificar si el video está disponible
    const checkVideoAvailability = async (src) => {
        try {
            console.log(`[Video] 🔍 Verificando disponibilidad de: ${src}`);
            const response = await fetch(src, { method: 'HEAD' });
            const isAvailable = response.ok;
            console.log(`[Video] 📊 Video ${src} disponible: ${isAvailable} (status: ${response.status})`);
            return isAvailable;
        } catch (error) {
            console.error(`[Video] ❌ Error verificando video ${src}:`, error);
            return false;
        }
    };

    // Función para intentar cargar video con fallbacks - usando rutas directas
    const loadVideoWithFallbacks = async () => {
        const videoSources = [
            "/video.mp4", // Video principal directo desde public
            "/videoExpIngles.mp4", // Video secundario directo desde public
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny_mp4_640x360_SF.mp4" // Fallback externo
        ];

        for (let i = 0; i < videoSources.length; i++) {
            const src = videoSources[i];
            console.log(`[Video] 🔄 Intentando cargar: ${src} (intento ${i + 1}/${videoSources.length})`);
            
            const isAvailable = await checkVideoAvailability(src);
            if (isAvailable) {
                console.log(`[Video] ✅ Video encontrado: ${src}`);
                setVideoSrc(src);
                return src;
            }
        }

        console.error('[Video] ❌ Ningún video disponible, usando imagen de fallback');
        setVideoError(true);
        setVideoErrorMessage('Videos no disponibles temporalmente');
        return null;
    };

    // Efecto mejorado para la configuración del video
    useEffect(() => {
        if (!isClientHydrated || !videoRef.current) return;

        const videoElement = videoRef.current;
        console.log('[Video] 🎬 Configurando elemento video...');
        
        videoElement.loop = true;
        videoElement.muted = true; // Asegurar que esté muteado para autoplay
        videoElement.playsInline = true;
        
        const handleLoadedData = () => {
            console.log('[Video] ✅ Video cargado exitosamente');
            setIsVideoLoaded(true);
            setVideoError(false);
            setVideoErrorMessage('');
            setRetryCount(0);
        };

        const handleError = async (error) => {
            console.error('[Video] ❌ Error al cargar el video:', error);
            setVideoError(true);
            setIsVideoLoaded(false);
            
            // Intentar retry con diferentes fuentes
            if (retryCount < 2) {
                console.log(`[Video] 🔄 Reintentando carga (${retryCount + 1}/2)...`);
                setRetryCount(prev => prev + 1);
                
                const newSrc = await loadVideoWithFallbacks();
                if (newSrc && newSrc !== videoSrc) {
                    setVideoSrc(newSrc);
                    // El efecto se disparará de nuevo con el nuevo src
                    return;
                }
            }
            
            setVideoErrorMessage('Error cargando video');
        };

        const handleCanPlay = () => {
            console.log('[Video] ✅ Video listo para reproducir');
            setIsVideoLoaded(true);
            setVideoError(false);
            setVideoErrorMessage('');
        };

        const handleLoadStart = () => {
            console.log('[Video] 🔄 Iniciando carga del video...');
            setVideoError(false);
            setVideoErrorMessage('');
        };

        // Event listeners
        videoElement.addEventListener('loadeddata', handleLoadedData);
        videoElement.addEventListener('canplay', handleCanPlay);
        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('loadstart', handleLoadStart);
        
        // Inicializar carga del video
        const initializeVideo = async () => {
            // Si es el primer intento, verificar si el video actual está disponible
            if (retryCount === 0) {
                const isCurrentAvailable = await checkVideoAvailability(videoSrc);
                if (!isCurrentAvailable) {
                    console.log('[Video] ⚠️ Video principal no disponible, buscando alternativas...');
                    const newSrc = await loadVideoWithFallbacks();
                    if (newSrc && newSrc !== videoSrc) {
                        setVideoSrc(newSrc);
                        return; // El efecto se disparará de nuevo
                    }
                }
            }
            
            // Cargar y reproducir
            try {
                videoElement.load();
                const playPromise = videoElement.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("[Video] ⚠️ Autoplay bloqueado:", error.message);
                        // No es un error crítico, el usuario puede hacer click para reproducir
                    });
                }
            } catch (error) {
                console.error("[Video] ❌ Error iniciando reproducción:", error);
                handleError(error);
            }
        };

        initializeVideo();

        return () => {
            videoElement.removeEventListener('loadeddata', handleLoadedData);
            videoElement.removeEventListener('canplay', handleCanPlay);
            videoElement.removeEventListener('error', handleError);
            videoElement.removeEventListener('loadstart', handleLoadStart);
        };
    }, [isClientHydrated, videoSrc, retryCount]);

    // Función para intentar reproducir manualmente
    const handleVideoClick = async () => {
        if (videoRef.current && !videoError) {
            try {
                await videoRef.current.play();
                console.log('[Video] ✅ Reproducción iniciada por usuario');
            } catch (error) {
                console.error('[Video] ❌ Error reproducción manual:', error);
            }
        }
    };

    // Estados para el buscador de propiedades
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        propertyType: 'todos',
        operation: 'comprar',
        priceRange: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        minSize: ''
    });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    
    // Hook optimizado para propiedades REALES con cache y retry
    const { 
        properties: allProperties, 
        loading: propertiesLoading, 
        error: propertiesError,
        meta,
        refresh: refreshProperties
    } = useProperties({
        limit: 33,
        source: 'all',
        autoLoad: true,
        enableCache: true
    });

    // Estado para manejar cuando no hay propiedades reales
    const [showNoPropertiesMessage, setShowNoPropertiesMessage] = useState(false);

    // Verificar si hay propiedades reales disponibles
    useEffect(() => {
        if (!propertiesLoading && allProperties.length === 0 && propertiesError) {
            console.log('🏠 No hay propiedades reales disponibles');
            setShowNoPropertiesMessage(true);
        } else if (allProperties.length > 0) {
            setShowNoPropertiesMessage(false);
        }
    }, [allProperties, propertiesLoading, propertiesError]);

    // Efecto para seleccionar la primera propiedad cuando se cargan
    useEffect(() => {
        if (allProperties.length > 0 && !selectedProperty) {
            const normalizedProperties = allProperties.map(normalizeProperty);
            setSelectedProperty(normalizedProperties[0]);
            console.log('[Video] 🎯 Primera propiedad seleccionada:', normalizedProperties[0]?.title || 'Sin título');
            console.log('[Video] 📊 Total propiedades cargadas:', allProperties.length);
            console.log('[Video] 📊 Fuentes:', meta?.sources || 'No disponible');
        }
    }, [allProperties, selectedProperty, meta]);

    // Función para filtrar propiedades usando la utilidad
    const getFilteredProperties = () => {
        return filterProperties(allProperties, searchFilters);
    };

    // Función para seleccionar una propiedad y actualizar el mapa
    const selectProperty = (property) => {
        console.log('🏠 Seleccionando propiedad:', property.title);
        setMapLoading(true);
        setSelectedProperty(property);
        
        // Actualizar el mapa inmediatamente con la nueva propiedad
        setTimeout(() => {
            setMapLoading(false);
            console.log('✅ Mapa actualizado para:', property.title);
        }, 500); // Reducido el tiempo para una experiencia más fluida
    };

    // Función para manejar cambios en filtros
    const handleFilterChange = (field, value) => {
        setMapLoading(true);
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar selección cuando cambien los filtros para mostrar todas las propiedades filtradas
        setSelectedProperty(null);
        // Simular tiempo de actualización del mapa
        setTimeout(() => setMapLoading(false), 800);
    };

    // Efecto para actualizar el mapa cuando se abra el modal
    useEffect(() => {
        if (showMap && getFilteredProperties().length > 0) {
            // Limpiar selección para mostrar todas las propiedades al abrir
            setSelectedProperty(null);
        }
    }, [showMap]);

    // Función para generar URL del mapa con múltiples ubicaciones inteligente
    const getMultipleLocationsMapUrl = () => {
        try {
            const filteredProps = getFilteredProperties();
            console.log('🗺️ Propiedades filtradas para el mapa:', filteredProps.length);
            
            if (filteredProps.length === 0) {
                console.log('⚠️ No hay propiedades filtradas, usando mapa de Madrid por defecto');
                return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
            }
            
            // Si hay filtro de ubicación, priorizar propiedades cercanas a esa ubicación
            let sortedProperties = [...filteredProps];
            if (searchFilters.location && searchFilters.location.trim()) {
                const searchLocation = searchFilters.location.toLowerCase();
                
                // Ordenar por relevancia de ubicación
                sortedProperties.sort((a, b) => {
                    const aLocationMatch = (a.location?.toLowerCase().includes(searchLocation) ? 2 : 0) +
                                         (a.title?.toLowerCase().includes(searchLocation) ? 1 : 0);
                    const bLocationMatch = (b.location?.toLowerCase().includes(searchLocation) ? 2 : 0) +
                                         (b.title?.toLowerCase().includes(searchLocation) ? 1 : 0);
                    return bLocationMatch - aLocationMatch;
                });
                
                console.log('🎯 Propiedades ordenadas por relevancia de ubicación:', searchLocation);
            }
            
            // Crear una consulta con múltiples ubicaciones para Google Maps
            const locations = sortedProperties
                .slice(0, 10) // Tomar las 10 más relevantes
                .map(property => {
                    try {
                        // Usar coordenadas si están disponibles, sino usar la dirección
                        if (property.coordinates && 
                            property.coordinates.lat && 
                            property.coordinates.lng &&
                            !isNaN(property.coordinates.lat) &&
                            !isNaN(property.coordinates.lng)) {
                            return `${property.coordinates.lat},${property.coordinates.lng}`;
                        } else {
                            const location = property.location || property.title || 'Madrid, España';
                            return encodeURIComponent(location);
                        }
                    } catch (error) {
                        console.error('❌ Error procesando propiedad para mapa:', error);
                        return encodeURIComponent('Madrid, España');
                    }
                })
                .filter(location => location); // Filtrar ubicaciones vacías
            
            console.log('📍 Ubicaciones para el mapa (ordenadas por relevancia):', locations);
            
            // Si hay filtro de ubicación específico, centrar el mapa en esa área
            let baseUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1';
            
            if (searchFilters.location && searchFilters.location.trim()) {
                // Usar la ubicación de búsqueda como centro del mapa
                const searchLocation = encodeURIComponent(`${searchFilters.location}, Madrid, España`);
                baseUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12149.5!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1&q=${searchLocation}`;
                console.log('🎯 Mapa centrado en:', searchFilters.location);
            }
            
            // Agregar las ubicaciones como parámetros adicionales
            if (locations.length > 0) {
                const finalUrl = `${baseUrl}&markers=${locations.join('|')}`;
                console.log('🔗 URL final del mapa:', finalUrl);
                return finalUrl;
            }
            
            return baseUrl;
        } catch (error) {
            console.error('❌ Error generando URL del mapa:', error);
            // Devolver mapa de Madrid por defecto en caso de error
            return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
        }
    };

    // Generar URL del mapa embebido de Google Maps
    const getMapEmbedUrl = (property) => {
        try {
            if (!property) {
                console.log('⚠️ No hay propiedad seleccionada para el mapa');
                return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
            }
            
            console.log('🗺️ Generando mapa para propiedad:', property.title);
            
            if (property.coordinates && 
                property.coordinates.lat && 
                property.coordinates.lng &&
                !isNaN(property.coordinates.lat) &&
                !isNaN(property.coordinates.lng)) {
                const { lat, lng } = property.coordinates;
                console.log(`📍 Usando coordenadas: ${lat}, ${lng}`);
                // Zoom más cercano para propiedades individuales (zoom 16)
                return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1518.75!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat},${lng}!5e0!3m2!1ses!2ses!4v${Date.now()}`;
            } else {
                console.log('📍 Usando ubicación por texto:', property.location || property.title);
                const location = encodeURIComponent(property.location || property.title || 'Madrid, España');
                // Zoom medio para búsquedas por texto (zoom 15)
                return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1&q=${location}&zoom=15&v=${Date.now()}`;
            }
        } catch (error) {
            console.error('❌ Error generando URL del mapa individual:', error);
            return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
        }
    };

    return (
        <>
            {/* Header superpuesto solo en la página home */}
            {isHomePage && <ControlMenu />}
            
            <AnimatedOnScroll>
                <section 
                    className="relative min-h-[120vh]"
                    aria-label="Sección de presentación con video y buscador de propiedades de lujo"
                >
                    <div className="w-full h-[120vh] overflow-hidden relative">
                        {/* Imagen de fondo como fallback */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('/madrid.jpg')`,
                                filter: videoError ? 'none' : 'blur(2px)',
                                opacity: videoError ? 1 : (isVideoLoaded ? 0 : 0.7)
                            }}
                        />
                        
                        {/* Overlay de estado del video */}
                        {(!isVideoLoaded || videoError) && (
                            <div 
                                className="absolute inset-0 bg-black/30 flex items-center justify-center"
                                aria-label={videoError ? "Error cargando video" : "Cargando video"}
                            >
                                {videoError ? (
                                    <div className="text-center text-white">
                                        <div className="text-6xl mb-4">🏢</div>
                                        <h3 className="text-xl font-light mb-2">Propiedades Exclusivas en Madrid</h3>
                                        <p className="text-white/80 text-sm mb-4">
                                            {videoErrorMessage || 'Video no disponible temporalmente'}
                                        </p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-amarillo text-black rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium"
                                        >
                                            Reintentar carga
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center text-white">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo mx-auto mb-4"></div>
                                        <p className="text-white/80">Cargando video...</p>
                                        {retryCount > 0 && (
                                            <p className="text-white/60 text-xs mt-2">
                                                Intento {retryCount + 1}/3
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Video principal */}
                        {!videoError && (
                            <video
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                    isVideoLoaded ? 'opacity-100' : 'opacity-0'
                                } cursor-pointer`}
                                autoPlay
                                muted
                                playsInline
                                ref={videoRef}
                                src={isClientHydrated ? videoSrc : undefined}
                                onClick={handleVideoClick}
                                aria-label="Video promocional de Goza Madrid - Click para reproducir"
                                title="Click para reproducir video"
                            >
                                {isClientHydrated && <source src={videoSrc} type="video/mp4" />}
                                <p>Tu navegador no soporta la reproducción de video. 
                                   <a href={videoSrc} download>Descarga el video aquí</a>
                                </p>
                            </video>
                        )}

                        {/* Botón de reproducción visible cuando hay autoplay bloqueado */}
                        {isVideoLoaded && !videoError && videoRef.current?.paused && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button 
                                    onClick={handleVideoClick}
                                    className="pointer-events-auto bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-300 text-white"
                                    aria-label="Reproducir video"
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Overlay elegante y sutil con transición suave */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/40"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                        {/* Contenedor principal premium - Solo buscador en la parte inferior */}
                        <div className="absolute inset-0 flex flex-col justify-end items-center z-20 px-6 lg:px-12 pb-16 lg:pb-20">
                            
                            {/* Buscador premium centrado */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: 0.3 }}
                                className="w-full max-w-5xl"
                            >
                                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
                                    {/* Pestañas elegantes */}
                                    <div className="flex mb-6 bg-white/20 backdrop-blur-sm rounded-xl p-1 max-w-md mx-auto border border-white/30">
                                        <button
                                            onClick={() => handleFilterChange('operation', 'comprar')}
                                            className={`flex-1 py-3 px-8 rounded-lg font-medium transition-all duration-300 ${
                                                searchFilters.operation === 'comprar'
                                                    ? 'bg-amarillo text-white shadow-lg'
                                                    : 'text-white hover:text-amarillo'
                                            }`}
                                        >
                                            Comprar
                                        </button>
                                        <button
                                            onClick={() => handleFilterChange('operation', 'vender')}
                                            className={`flex-1 py-3 px-8 rounded-lg font-medium transition-all duration-300 ${
                                                searchFilters.operation === 'vender'
                                                    ? 'bg-amarillo text-white shadow-lg'
                                                    : 'text-white hover:text-amarillo'
                                            }`}
                                        >
                                            Vender
                                        </button>
                                    </div>

                                    {/* Contenido según la pestaña */}
                                    {searchFilters.operation === 'comprar' ? (
                                        <div className="space-y-6">
                                            {/* Fila principal de búsqueda */}
                                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                                                {/* Ubicación */}
                                                <div className="lg:col-span-2 relative">
                                                    <SmartLocationSearch
                                                        value={searchFilters.location}
                                                        onChange={(value) => handleFilterChange('location', value)}
                                                        properties={allProperties}
                                                        placeholder="Ubicación (ej. Malasaña, Salamanca...)"
                                                        className="w-full px-4 py-4 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo text-white placeholder-white/70 bg-white/10 backdrop-blur-sm"
                                                    />
                                                </div>

                                                {/* Tipo de propiedad */}
                                                <div className="relative">
                                                    <select
                                                        value={searchFilters.propertyType}
                                                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                                        className="w-full px-4 py-4 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo appearance-none bg-white/10 backdrop-blur-sm text-white"
                                                    >
                                                        <option value="todos">Todos los tipos</option>
                                                        <option value="piso">Piso</option>
                                                        <option value="atico">Ático</option>
                                                        <option value="duplex">Dúplex</option>
                                                        <option value="estudio">Estudio</option>
                                                        <option value="casa">Casa</option>
                                                    </select>
                                                </div>

                                                {/* Precio */}
                                                <div className="relative">
                                                    <select
                                                        value={searchFilters.priceRange}
                                                        onChange={(e) => {
                                                            const range = e.target.value.split('-');
                                                            handleFilterChange('minPrice', range[0] || '');
                                                            handleFilterChange('maxPrice', range[1] || '');
                                                            handleFilterChange('priceRange', e.target.value);
                                                        }}
                                                        className="w-full px-4 py-4 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo appearance-none bg-white/10 backdrop-blur-sm text-white"
                                                    >
                                                        <option value="">Precio</option>
                                                        <option value="0-500000">Hasta 500.000€</option>
                                                        <option value="500000-800000">500.000€ - 800.000€</option>
                                                        <option value="800000-1200000">800.000€ - 1.200.000€</option>
                                                        <option value="1200000-2000000">1.200.000€ - 2.000.000€</option>
                                                        <option value="2000000-">Más de 2.000.000€</option>
                                                    </select>
                                                </div>

                                                {/* Botón de búsqueda */}
                                                <div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('🗺️ Botón Ver Mapa clickeado');
                                                            try {
                                                                setShowMap(true);
                                                                console.log('✅ Modal del mapa activado');
                                                            } catch (error) {
                                                                console.error('❌ Error al abrir el mapa:', error);
                                                            }
                                                        }}
                                                        disabled={propertiesLoading}
                                                        type="button"
                                                        className="w-full bg-amarillo hover:bg-amarillo/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                                                    >
                                                        {propertiesLoading ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                                                <span className="hidden sm:inline">Cargando...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <FaMapMarkerAlt className="text-sm" />
                                                                <span className="hidden sm:inline">Ver en Mapa</span>
                                                                <span className="sm:hidden">Mapa</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Filtros adicionales */}
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                                <select
                                                    value={searchFilters.bedrooms}
                                                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                                    className="px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo appearance-none bg-white/10 backdrop-blur-sm text-white text-sm"
                                                >
                                                    <option value="">Habitaciones</option>
                                                    <option value="1">1+ habitación</option>
                                                    <option value="2">2+ habitaciones</option>
                                                    <option value="3">3+ habitaciones</option>
                                                    <option value="4">4+ habitaciones</option>
                                                </select>

                                                <select
                                                    value={searchFilters.bathrooms}
                                                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                                                    className="px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo appearance-none bg-white/10 backdrop-blur-sm text-white text-sm"
                                                >
                                                    <option value="">Baños</option>
                                                    <option value="1">1+ baño</option>
                                                    <option value="2">2+ baños</option>
                                                    <option value="3">3+ baños</option>
                                                </select>

                                                <input
                                                    type="number"
                                                    placeholder="Superficie mín. (m²)"
                                                    value={searchFilters.minSize}
                                                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                                                    className="px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo text-white placeholder-white/70 bg-white/10 backdrop-blur-sm text-sm"
                                                />
                                            </div>

                                            {/* Indicador de propiedades */}
                                            <div className="text-center pt-2">
                                                <div className="inline-flex items-center gap-2 text-white/80 text-sm">
                                                    {propertiesLoading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-amarillo"></div>
                                                            <span>Cargando propiedades...</span>
                                                        </>
                                                    ) : propertiesError ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-red-500">⚠️ {propertiesError}</span>
                                                            <button 
                                                                onClick={() => window.location.reload()} 
                                                                className="bg-amarillo text-white px-2 py-1 rounded text-xs hover:bg-amarillo/90 transition-colors"
                                                            >
                                                                🔄 Reintentar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-amarillo font-medium">
                                                            {allProperties.length} propiedades disponibles
                                                            {getFilteredProperties().length !== allProperties.length && (
                                                                <span className="text-white/90">
                                                                    {` • `}
                                                                    <span className="bg-amarillo/20 px-2 py-1 rounded-full text-amarillo text-xs font-semibold">
                                                                        {getFilteredProperties().length} coinciden
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Contenido para vender - compacto
                                        <div className="text-center py-6">
                                            <div className="max-w-xl mx-auto">
                                                <h3 className="font-serif text-2xl font-light text-white mb-4">
                                                    ¿Desea vender su propiedad?
                                                </h3>
                                                <p className="text-white/80 mb-6 text-base font-light leading-relaxed">
                                                    Obtenga una valoración profesional y gratuita de su propiedad. 
                                                    Nuestros expertos le ayudarán a conseguir el mejor precio del mercado.
                                                </p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                                                        <div className="text-amarillo text-2xl mb-2">📊</div>
                                                        <h4 className="font-medium text-white mb-1 text-sm">Valoración Gratuita</h4>
                                                        <p className="text-white/70 text-xs">Análisis completo del mercado</p>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                                                        <div className="text-amarillo text-2xl mb-2">🏆</div>
                                                        <h4 className="font-medium text-white mb-1 text-sm">Expertos en Madrid</h4>
                                                        <p className="text-white/70 text-xs">Conocimiento especializado</p>
                                                    </div>
                                                </div>

                                                <a
                                                    href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-amarillo hover:bg-amarillo/90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                                >
                                                    <FaCalculator className="text-sm" />
                                                    <span>Valorar mi Propiedad</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Botón valorador flotante premium */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 2 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <a
                            href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-amarillo hover:bg-amarillo/90 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 transform hover:scale-105"
                        >
                            <FaCalculator className="text-lg" />
                            <span className="font-medium hidden lg:inline">Valorador Gratuito</span>
                            <span className="font-medium lg:hidden">Valorar</span>
                        </a>
                    </motion.div>

                    {/* Modal de resultados con diseño premium responsive mejorado */}
                    <AnimatePresence>
                        {showMap && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                                onClick={() => setShowMap(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center p-4 sm:p-6 lg:p-8 border-b border-gray-100">
                                        <div>
                                            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-gray-900">
                                                Propiedades Encontradas
                                                <span className="text-amarillo font-normal ml-2">({getFilteredProperties().length})</span>
                                            </h2>
                                            <p className="text-gray-600 text-xs sm:text-sm mt-2 font-light">
                                                Haz clic en cualquier propiedad para ver su ubicación exacta en el mapa
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowMap(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 h-[70vh] sm:h-[75vh]">
                                        {/* Lista de propiedades con diseño premium */}
                                        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                            {propertiesLoading ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amarillo"></div>
                                                    <span className="ml-3 text-gray-600 font-light">Conectando con el servidor...</span>
                                                </div>
                                            ) : propertiesError || showNoPropertiesMessage ? (
                                                <div className="text-center py-16 text-red-600">
                                                    <FaTimes className="text-5xl text-red-400 mx-auto mb-6" />
                                                    <h3 className="font-serif text-2xl font-light mb-4">
                                                        {showNoPropertiesMessage ? 'Propiedades reales no disponibles' : 'No se pueden cargar las propiedades'}
                                                    </h3>
                                                    <p className="text-sm mb-2 text-gray-600">
                                                        {showNoPropertiesMessage 
                                                            ? 'Las propiedades reales del inventario no están disponibles en este momento.'
                                                            : propertiesError
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-6">
                                                        {showNoPropertiesMessage 
                                                            ? 'Estamos trabajando para conectar con nuestro inventario de propiedades reales. Inténtelo de nuevo en unos minutos.'
                                                            : 'Asegúrate de que el servidor backend esté corriendo en el puerto 8081'
                                                        }
                                                    </p>
                                                    <button 
                                                        onClick={() => {
                                                            setShowNoPropertiesMessage(false);
                                                            refreshProperties();
                                                        }} 
                                                        className="bg-amarillo text-white px-6 py-3 rounded-xl hover:bg-amarillo/90 transition-colors font-medium"
                                                    >
                                                        🔄 Reintentar conexión
                                                    </button>
                                                </div>
                                            ) : getFilteredProperties().length === 0 ? (
                                                <div className="text-center py-16 text-gray-600">
                                                    <FaMapMarkerAlt className="text-5xl text-amarillo mx-auto mb-6" />
                                                    <h3 className="font-serif text-2xl font-light mb-4">
                                                        {allProperties.length === 0 ? 'No hay propiedades disponibles' : 'No se encontraron propiedades'}
                                                    </h3>
                                                    <p className="font-light">
                                                        {allProperties.length === 0 
                                                            ? 'Las propiedades se están cargando desde las APIs' 
                                                            : 'Intenta ajustar los filtros de búsqueda'
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                getFilteredProperties().map((property) => (
                                                <motion.div
                                                    key={property.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`bg-white rounded-2xl p-4 lg:p-6 cursor-pointer transition-all duration-300 border-2 group shadow-lg hover:shadow-xl ${
                                                        selectedProperty?.id === property.id 
                                                            ? 'border-amarillo bg-amarillo/10' 
                                                            : 'border-gray-100 hover:border-amarillo/30'
                                                    }`}
                                                    onClick={() => {
                                                        console.log('🖱️ Click en propiedad:', property.title);
                                                        selectProperty(property);
                                                    }}
                                                    title={`Ver ${property.title} en el mapa`}
                                                >
                                                    {/* Layout responsivo: stack en móvil, horizontal en desktop */}
                                                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                                                        {/* Imagen responsive */}
                                                        <div className="relative w-full sm:w-32 lg:w-36 h-48 sm:h-24 lg:h-28 flex-shrink-0">
                                                            <img
                                                                src={(() => {
                                                                    // Función para obtener la imagen con fallbacks
                                                                    const getPropertyImage = (prop) => {
                                                                        // Prioridad 1: Campo image normalizado
                                                                        if (prop.image && prop.image !== "/analisis.png") {
                                                                            return prop.image;
                                                                        }
                                                                        
                                                                        // Prioridad 2: Array de imágenes (tomar la primera)
                                                                        if (prop.images && Array.isArray(prop.images) && prop.images.length > 0) {
                                                                            const firstImage = prop.images[0];
                                                                            if (typeof firstImage === 'string') {
                                                                                return firstImage;
                                                                            }
                                                                            if (firstImage.src) return firstImage.src;
                                                                            if (firstImage.url) return firstImage.url;
                                                                        }
                                                                        
                                                                        // Prioridad 3: Campo featured_image
                                                                        if (prop.featured_image) {
                                                                            return prop.featured_image;
                                                                        }
                                                                        
                                                                        // Prioridad 4: Campos de imagen alternativos
                                                                        if (prop.featuredImage) {
                                                                            return prop.featuredImage;
                                                                        }
                                                                        
                                                                        // Prioridad 5: Thumbnail
                                                                        if (prop.thumbnail) {
                                                                            return prop.thumbnail;
                                                                        }
                                                                        
                                                                        // Fallback final: imagen por defecto
                                                                        return "https://placekitten.com/400/300";
                                                                    };
                                                                    
                                                                    return getPropertyImage(property);
                                                                })()}
                                                                alt={property.title || 'Imagen de propiedad'}
                                                                className="w-full h-full object-cover rounded-xl"
                                                                onError={(e) => {
                                                                    // Fallback en caso de error de carga
                                                                    if (e.target.src !== "https://placekitten.com/400/300") {
                                                                        e.target.src = "https://placekitten.com/400/300";
                                                                    }
                                                                }}
                                                                loading="lazy"
                                                            />
                                                            
                                                            {/* Badge de estado si está seleccionado */}
                                                            {selectedProperty?.id === property.id && (
                                                                <div className="absolute top-2 right-2">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amarillo text-white shadow-lg">
                                                                        ✓ Seleccionado
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Contenido de la propiedad */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Título responsive */}
                                                            <h3 className={`font-serif text-lg sm:text-xl font-light transition-colors mb-2 line-clamp-2 ${
                                                                selectedProperty?.id === property.id 
                                                                    ? 'text-amarillo' 
                                                                    : 'text-gray-900 group-hover:text-amarillo'
                                                            }`}>
                                                                {property.title}
                                                            </h3>
                                                            
                                                            {/* Ubicación responsive */}
                                                            <p className="text-gray-600 flex items-start sm:items-center gap-2 mb-3 font-light text-sm sm:text-base">
                                                                <FaMapMarkerAlt className="text-amarillo mt-0.5 sm:mt-0 flex-shrink-0" />
                                                                <span className="line-clamp-2 sm:line-clamp-1">
                                                                    {property.location}
                                                                </span>
                                                            </p>
                                                            
                                                            {/* Características responsive */}
                                                            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4 lg:gap-6 mb-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1 justify-center sm:justify-start">
                                                                    <FaBed className="text-amarillo" />
                                                                    <span className="hidden sm:inline">{property.bedrooms}</span>
                                                                    <span className="sm:hidden">{property.bedrooms}</span>
                                                                </span>
                                                                <span className="flex items-center gap-1 justify-center sm:justify-start">
                                                                    <FaBath className="text-amarillo" />
                                                                    <span className="hidden sm:inline">{property.bathrooms}</span>
                                                                    <span className="sm:hidden">{property.bathrooms}</span>
                                                                </span>
                                                                <span className="flex items-center gap-1 justify-center sm:justify-start">
                                                                    <FaRuler className="text-amarillo" />
                                                                    <span className="hidden sm:inline">{property.size}m²</span>
                                                                    <span className="sm:hidden">{property.size}m²</span>
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Footer responsive con precio y botón */}
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                <p className="text-xl lg:text-2xl font-light text-amarillo">
                                                                    €{property.price}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Evitar que se active selectProperty
                                                                        
                                                                        // Determinar el ID correcto según el tipo de propiedad
                                                                        const propertyId = property._id || property.id;
                                                                        console.log('🔗 Navegando a propiedad:', property.title, 'ID:', propertyId);
                                                                        
                                                                        // Usar la URL correcta
                                                                        window.open(`/property/${propertyId}`, '_blank');
                                                                    }}
                                                                    className="w-full sm:w-auto bg-amarillo hover:bg-amarillo/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                                                    title={`Ver detalles de ${property.title}`}
                                                                >
                                                                    <FaEye className="text-xs" />
                                                                    <span>Ver detalles</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                                ))
                                            )}
                                        </div>
                                        
                                        {/* Google Maps con diseño premium responsive */}
                                        <div className="relative bg-gray-50">
                                            {getFilteredProperties().length > 0 ? (
                                                <div className="h-full flex flex-col">
                                                    <div className="p-4 sm:p-6 bg-white border-b border-gray-100">
                                                        <h3 className="font-serif text-lg sm:text-xl font-light text-gray-900 mb-2">
                                                            {selectedProperty ? selectedProperty.title : `${getFilteredProperties().length} Propiedades en el Mapa`}
                                                        </h3>
                                                        <p className="text-gray-600 flex items-center gap-2 font-light text-sm sm:text-base">
                                                            <FaMapMarkerAlt className="text-amarillo flex-shrink-0" />
                                                            <span className="truncate">
                                                                {selectedProperty ? selectedProperty.location : 'Madrid, España'}
                                                            </span>
                                                        </p>
                                                        {!selectedProperty && (
                                                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                                                Haz clic en una propiedad para centrar el mapa en su ubicación
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 relative min-h-0">
                                                        {mapLoading && (
                                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amarillo"></div>
                                                                    <span className="text-gray-700 font-medium text-sm sm:text-base">Actualizando mapa...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {selectedProperty ? (
                                                            // Mapa centrado en propiedad seleccionada
                                                            <iframe
                                                                key={`property-map-${selectedProperty.id}-${Date.now()}`}
                                                                src={getMapEmbedUrl(selectedProperty)}
                                                                width="100%"
                                                                height="100%"
                                                                style={{ border: 0 }}
                                                                allowFullScreen=""
                                                                loading="lazy"
                                                                referrerPolicy="no-referrer-when-downgrade"
                                                                title={`Mapa de ${selectedProperty.title || 'Propiedad'}`}
                                                                className="w-full h-full transition-opacity duration-300"
                                                                onLoad={() => {
                                                                    console.log('✅ Mapa individual cargado para:', selectedProperty.title);
                                                                }}
                                                                onError={(e) => {
                                                                    console.error('❌ Error cargando iframe del mapa individual:', e);
                                                                    e.target.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
                                                                }}
                                                            ></iframe>
                                                        ) : (
                                                            // Mapa con todas las propiedades filtradas
                                                            <iframe
                                                                key={`map-${getFilteredProperties().length}-${JSON.stringify(searchFilters)}`}
                                                                src={getMultipleLocationsMapUrl()}
                                                                width="100%"
                                                                height="100%"
                                                                style={{ border: 0 }}
                                                                allowFullScreen=""
                                                                loading="lazy"
                                                                referrerPolicy="no-referrer-when-downgrade"
                                                                title={`Mapa con ${getFilteredProperties().length} propiedades disponibles`}
                                                                className="w-full h-full"
                                                                onError={(e) => {
                                                                    console.error('❌ Error cargando iframe del mapa múltiple:', e);
                                                                    e.target.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.42287922!2d-3.8196207!3d40.4378698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890123';
                                                                }}
                                                            ></iframe>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Controles del mapa responsivos */}
                                                    <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                                            <div className="flex items-center gap-3 sm:gap-4">
                                                                <button
                                                                    onClick={() => setSelectedProperty(null)}
                                                                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                                        !selectedProperty 
                                                                            ? 'bg-amarillo text-white' 
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    Ver Todas
                                                                </button>
                                                                <span className="text-xs sm:text-sm text-gray-500">
                                                                    {getFilteredProperties().length} propiedades
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2">
                                                                {selectedProperty ? (
                                                                    <a
                                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.coordinates.lat},${selectedProperty.coordinates.lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 bg-amarillo text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amarillo/90 transition-colors text-xs sm:text-sm font-medium"
                                                                    >
                                                                        <FaMapMarkerAlt />
                                                                        <span className="hidden sm:inline">Cómo llegar</span>
                                                                        <span className="sm:hidden">Ruta</span>
                                                                    </a>
                                                                ) : (
                                                                    <a
                                                                        href="https://www.google.com/maps/place/Madrid,+Spain"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
                                                                    >
                                                                        <FaMapMarkerAlt />
                                                                        <span className="hidden sm:inline">Ver Madrid</span>
                                                                        <span className="sm:hidden">Madrid</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center p-4">
                                                    <div className="text-center text-gray-600">
                                                        <FaMapMarkerAlt className="text-4xl sm:text-6xl text-amarillo mx-auto mb-4 sm:mb-6" />
                                                        <h3 className="font-serif text-xl sm:text-2xl font-light mb-3 sm:mb-4">No hay propiedades para mostrar</h3>
                                                        <p className="font-light text-sm sm:text-base">Ajusta los filtros de búsqueda para ver propiedades en el mapa</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </AnimatedOnScroll>

            {/* Barra inferior premium minimalista - Justo debajo del video */}
            <div className="relative w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-amarillo/20">
                <div className="relative w-full py-8 flex items-center justify-center px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-center max-w-3xl"
                    >
                        <h2 className="font-serif text-xl sm:text-2xl lg:text-4xl font-light text-white mb-3">
                            Invierte en 
                            <span className="font-normal text-amarillo italic"> bienes inmuebles</span>
                        </h2>
                        <p className="text-base lg:text-lg text-white/70 font-light tracking-wide">
                            Las mejores oportunidades de inversión en Madrid
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Video;
