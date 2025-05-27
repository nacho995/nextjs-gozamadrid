import React from 'react';
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/legacy/image";
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaEuroSign, FaFilter, FaCalculator, FaTimes, FaHome, FaArrowRight } from 'react-icons/fa';
import { fetchAllProperties, normalizeProperty, filterProperties } from '../utils/properties';

const Video = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState("/video.mp4");
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    
    // Estados para el buscador de propiedades
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        propertyType: 'todos',
        operation: 'comprar',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        minSize: ''
    });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [allProperties, setAllProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(true);
    const [propertiesError, setPropertiesError] = useState(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.loop = true;
            videoElement.load();
            
            // Manejar la carga del video
            videoElement.addEventListener('loadeddata', () => {
                setIsVideoLoaded(true);
            });

            videoElement.play().catch(error => {
                console.log("Error al reproducir el video:", error);
            });

            // Limpieza
            return () => {
                videoElement.removeEventListener('loadeddata', () => {
                    setIsVideoLoaded(true);
                });
            };
        }
    }, [videoSrc]);

    // Cargar todas las propiedades reales desde las APIs
    useEffect(() => {
        const loadAllProperties = async () => {
            setPropertiesLoading(true);
            setPropertiesError(null);
            
            try {
                console.log('[Video] Cargando todas las propiedades desde las APIs...');
                
                // Limpiar cualquier cache previo
                if (typeof window !== 'undefined') {
                    // Limpiar cache de fetch API
                    if ('caches' in window) {
                        caches.keys().then(names => {
                            names.forEach(name => {
                                if (name.includes('properties') || name.includes('api')) {
                                    caches.delete(name);
                                }
                            });
                        });
                    }
                }
                
                const properties = await fetchAllProperties();
                console.log('[Video] Propiedades obtenidas:', properties.length);
                
                if (properties.length > 0) {
                    const normalizedProperties = properties.map(normalizeProperty);
                    console.log('[Video] Propiedades normalizadas:', normalizedProperties.length);
                    setAllProperties(normalizedProperties);
                    
                    // Seleccionar la primera propiedad por defecto
                    setSelectedProperty(normalizedProperties[0]);
                    console.log('[Video] Primera propiedad seleccionada:', normalizedProperties[0].title);
                } else {
                    console.warn('[Video] No se encontraron propiedades en las APIs');
                    setAllProperties([]);
                    setSelectedProperty(null);
                    setPropertiesError('No hay propiedades disponibles en este momento');
                }
            } catch (error) {
                console.error('[Video] Error al cargar propiedades:', error);
                setAllProperties([]);
                setSelectedProperty(null);
                setPropertiesError(`Error al cargar propiedades: ${error.message}`);
            } finally {
                setPropertiesLoading(false);
            }
        };

        loadAllProperties();
    }, []);

    const MotionLink = motion.a;

    // Función para filtrar propiedades usando la utilidad
    const getFilteredProperties = () => {
        return filterProperties(allProperties, searchFilters);
    };

    // Función para seleccionar una propiedad y actualizar el mapa
    const selectProperty = (property) => {
        setSelectedProperty(property);
    };

    // Función para manejar cambios en filtros
    const handleFilterChange = (field, value) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Generar URL del mapa embebido de Google Maps
    const getMapEmbedUrl = (property) => {
        if (!property) return '';
        const { lat, lng } = property.coordinates;
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-y-2b8s&q=${lat},${lng}&zoom=16&maptype=roadmap`;
    };

    return (
        <AnimatedOnScroll>
            <section 
                className="relative"
                aria-label="Sección de presentación con video y buscador de propiedades"
            >
                <div className="w-full h-[50vh] lg:h-[100vh] overflow-hidden relative">
                    {/* Fallback para cuando el video no está cargado */}
                    {!isVideoLoaded && (
                        <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                            aria-label="Cargando video"
                        >
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo"></div>
                        </div>
                    )}
                    
                    <video
                        className="absolute top-0 left-0 w-full h-full object-cover lg:object-fill"
                        autoPlay
                        muted
                        playsInline
                        ref={videoRef}
                        aria-label="Video promocional de Goza Madrid"
                    >
                        <source src={videoSrc} type="video/mp4" />
                        <p>Tu navegador no soporta la reproducción de video. 
                           <a href={videoSrc} download>Descarga el video aquí</a>
                        </p>
                    </video>

                    {/* Overlay premium con gradientes sofisticados */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>

                    {/* Contenedor principal con diseño premium */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center z-20 px-4 lg:px-8">
                        
                        {/* Hero section premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="text-center mb-12 lg:mb-16 max-w-5xl"
                        >
                            {/* Subtítulo elegante */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="text-amarillo font-light text-lg lg:text-xl mb-4 tracking-wider uppercase"
                                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                Propiedades Exclusivas en Madrid
                            </motion.p>
                            
                            {/* Título principal premium */}
                            <h1 
                                className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-light text-white mb-6 leading-tight"
                                style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)' }}
                            >
                                Encuentra tu
                                <span 
                                    className="block font-bold text-amarillo italic"
                                    style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)' }}
                                >
                                    hogar de lujo
                                </span>
                            </h1>
                            
                            {/* Descripción elegante */}
                            <p 
                                className="text-lg sm:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-3xl mx-auto"
                                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                Descubre las propiedades más exclusivas de la capital, 
                                <span 
                                    className="text-amarillo font-bold" 
                                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                                > 
                                    seleccionadas especialmente para ti
                                </span>
                            </p>
                        </motion.div>

                        {/* Buscador premium minimalista */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="w-full max-w-2xl mb-8"
                        >
                            <div className="bg-black/20 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                                        <input
                                            type="text"
                                            placeholder="Buscar propiedades de lujo en Madrid..."
                                            value={searchFilters.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/60 border-none focus:outline-none text-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowMap(true)}
                                        disabled={propertiesLoading}
                                        className="bg-amarillo hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                    >
                                        {propertiesLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                                                <span>Cargando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Explorar</span>
                                                <FaArrowRight className="text-sm" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Enlace discreto para filtros avanzados e información de propiedades */}
                            <div className="text-center mt-4 space-y-2">
                                <button
                                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                                    className="text-white hover:text-amarillo text-sm font-medium transition-colors underline decoration-dotted bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"
                                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                                >
                                    {showSearchPanel ? '🔼 Ocultar filtros avanzados' : '🔽 Filtros avanzados'}
                                </button>
                                
                                {/* Indicador de propiedades disponibles */}
                                <div 
                                    className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
                                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                                >
                                    {propertiesLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-amarillo"></div>
                                            Cargando propiedades...
                                        </span>
                                    ) : propertiesError ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-red-300 font-bold">⚠️ {propertiesError}</span>
                                            <button 
                                                onClick={() => window.location.reload()} 
                                                className="ml-2 bg-amarillo text-black px-2 py-1 rounded text-xs hover:bg-yellow-500 transition-colors"
                                                title="Limpiar cache y recargar"
                                            >
                                                🔄 Limpiar Cache
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-amarillo font-bold">
                                            ✨ {allProperties.length} propiedades disponibles
                                            {getFilteredProperties().length !== allProperties.length && 
                                                ` • ${getFilteredProperties().length} coinciden`
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Botones de acción premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.9 }}
                            className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl"
                        >
                            {/* Botón valorador premium */}
                            <MotionLink
                                href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex-1 bg-gradient-to-r from-amarillo via-yellow-400 to-amarillo text-black font-bold px-8 py-5 rounded-full transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl hover:shadow-amarillo/25 border border-yellow-600 overflow-hidden"
                                whileHover={{ scale: 1.02, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Efecto de brillo premium */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <FaCalculator className="text-xl" />
                                <div className="relative z-10 text-center">
                                    <div className="text-lg font-bold">Valoración Gratuita</div>
                                    <div className="text-sm font-normal opacity-80">Conoce el valor real</div>
                                </div>
                            </MotionLink>

                            {/* Botón explorar propiedades */}
                            <MotionLink
                                href="/vender/comprar"
                                className="group relative flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-8 py-5 rounded-full transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl border border-white/20 hover:border-white/40 overflow-hidden"
                                whileHover={{ scale: 1.02, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Efecto de brillo sutil */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <FaHome className="text-xl" />
                                <div className="relative z-10 text-center">
                                    <div className="text-lg font-bold">Explorar Propiedades</div>
                                    <div className="text-sm font-light opacity-80">Encuentra tu hogar ideal</div>
                                </div>
                            </MotionLink>
                        </motion.div>
                    </div>
                </div>

                {/* Panel de filtros avanzados */}
                <AnimatePresence>
                    {showSearchPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border-t border-gray-200 overflow-hidden"
                        >
                            <div className="container mx-auto px-4 py-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Filtros avanzados</h3>
                                    <button
                                        onClick={() => setShowSearchPanel(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaBed className="inline mr-2" />
                                            Dormitorios mínimos
                                        </label>
                                        <select
                                            value={searchFilters.bedrooms}
                                            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo"
                                        >
                                            <option value="">Cualquiera</option>
                                            <option value="1">1+</option>
                                            <option value="2">2+</option>
                                            <option value="3">3+</option>
                                            <option value="4">4+</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaBath className="inline mr-2" />
                                            Baños mínimos
                                        </label>
                                        <select
                                            value={searchFilters.bathrooms}
                                            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo"
                                        >
                                            <option value="">Cualquiera</option>
                                            <option value="1">1+</option>
                                            <option value="2">2+</option>
                                            <option value="3">3+</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaRuler className="inline mr-2" />
                                            Superficie mínima (m²)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="ej. 80"
                                            value={searchFilters.minSize}
                                            onChange={(e) => handleFilterChange('minSize', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaEuroSign className="inline mr-2" />
                                            Precio mínimo
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ej. 500000"
                                            value={searchFilters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amarillo"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal de resultados con mapa embebido */}
                <AnimatePresence>
                    {showMap && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowMap(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Propiedades encontradas ({getFilteredProperties().length})
                                        {propertiesLoading && <span className="text-sm text-gray-500 ml-2">(Cargando...)</span>}
                                    </h2>
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 h-[70vh]">
                                    {/* Lista de propiedades */}
                                    <div className="overflow-y-auto p-6 space-y-4">
                                        {propertiesLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amarillo"></div>
                                                <span className="ml-3 text-gray-600">Conectando con el servidor...</span>
                                            </div>
                                        ) : propertiesError ? (
                                            <div className="text-center py-8 text-red-600">
                                                <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold mb-2">No se pueden cargar las propiedades</h3>
                                                <p className="text-sm mb-2">{propertiesError}</p>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    Asegúrate de que el servidor backend esté corriendo en el puerto 8081
                                                </p>
                                                <button 
                                                    onClick={() => window.location.reload()} 
                                                    className="mt-4 bg-amarillo text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                                                >
                                                    🔄 Reintentar conexión
                                                </button>
                                            </div>
                                        ) : getFilteredProperties().length === 0 ? (
                                            <div className="text-center py-8 text-gray-600">
                                                <FaMapMarkerAlt className="text-4xl text-amarillo mx-auto mb-4" />
                                                <h3 className="text-lg font-bold mb-2">
                                                    {allProperties.length === 0 ? 'No hay propiedades disponibles' : 'No se encontraron propiedades'}
                                                </h3>
                                                <p>
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
                                                whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(199, 163, 54, 0.15)" }}
                                                className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all duration-300 border-2 group ${
                                                    selectedProperty?.id === property.id 
                                                        ? 'border-amarillo bg-amarillo/10' 
                                                        : 'border-gray-200 hover:border-amarillo/30 hover:bg-amarillo/5'
                                                }`}
                                                onClick={() => selectProperty(property)}
                                                title={`Haz clic para ver ${property.title} en el mapa`}
                                            >
                                                <div className="flex gap-4">
                                                    <img
                                                        src={property.image}
                                                        alt={property.title}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold text-lg transition-colors ${
                                                            selectedProperty?.id === property.id 
                                                                ? 'text-amarillo' 
                                                                : 'text-gray-900 group-hover:text-amarillo'
                                                        }`}>
                                                            {property.title}
                                                        </h3>
                                                        <p className="text-gray-600 flex items-center gap-1 group-hover:text-gray-800 transition-colors">
                                                            <FaMapMarkerAlt className={`${
                                                                selectedProperty?.id === property.id 
                                                                    ? 'text-amarillo animate-pulse' 
                                                                    : 'text-amarillo'
                                                            }`} />
                                                            {property.location}
                                                            {selectedProperty?.id === property.id && (
                                                                <span className="ml-2 text-xs bg-amarillo text-black px-2 py-1 rounded-full font-bold">
                                                                    📍 Seleccionado
                                                                </span>
                                                            )}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <FaBed />
                                                                {property.bedrooms}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaBath />
                                                                {property.bathrooms}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaRuler />
                                                                {property.size}m²
                                                            </span>
                                                        </div>
                                                        <p className="text-xl font-bold text-amarillo mt-2">
                                                            €{property.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            ))
                                        )}
                                    </div>
                                    
                                    {/* Google Maps embebido */}
                                    <div className="relative bg-gray-100">
                                        {selectedProperty ? (
                                            <div className="h-full flex flex-col">
                                                {/* Header del mapa */}
                                                <div className="p-4 bg-white border-b">
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {selectedProperty.title}
                                                    </h3>
                                                    <p className="text-gray-600 flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-amarillo" />
                                                        {selectedProperty.location}
                                                    </p>
                                                </div>
                                                
                                                {/* Iframe del mapa */}
                                                <div className="flex-1">
                                                    <iframe
                                                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d${selectedProperty.coordinates.lng}!3d${selectedProperty.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI1JzUyLjMiTiAzwrA0MScwMi4wIlc!5e0!3m2!1ses!2ses!4v1234567890123`}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        allowFullScreen=""
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title={`Mapa de ${selectedProperty.title}`}
                                                        className="w-full h-full"
                                                    ></iframe>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="text-center text-gray-600">
                                                    <FaMapMarkerAlt className="text-6xl text-amarillo mx-auto mb-4" />
                                                    <h3 className="text-xl font-bold mb-2">Selecciona una propiedad</h3>
                                                    <p>Haz clic en cualquier propiedad de la izquierda para ver su ubicación</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Barra inferior premium */}
                <div 
                    className="relative w-full bg-gradient-to-r from-black via-gray-900 to-black border-t border-amarillo/20"
                    role="complementary"
                    aria-label="Mensaje destacado"
                >
                    {/* Efecto de brillo sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amarillo/5 to-transparent"></div>
                    
                    <div className="relative w-full h-20 lg:h-28 flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.2 }}
                            className="text-center"
                        >
                            <h2 className="text-xl sm:text-3xl lg:text-5xl font-light text-white mb-2">
                                Invierte en 
                                <span className="font-bold text-amarillo italic"> bienes inmuebles</span>
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-white/60 font-light tracking-wide">
                                Las mejores oportunidades de inversión en Madrid
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </AnimatedOnScroll>
    );
};

export default Video;
