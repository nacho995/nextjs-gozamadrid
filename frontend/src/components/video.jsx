import React from 'react';
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/legacy/image";
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaEuroSign, FaFilter, FaCalculator, FaTimes, FaHome, FaArrowRight } from 'react-icons/fa';
import { fetchAllProperties, normalizeProperty, filterProperties } from '../utils/properties';
import ControlMenu from './header';

const Video = () => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState("/video.mp4");
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    
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
        <>
            {/* Header superpuesto solo en la página home */}
            {isHomePage && <ControlMenu />}
            
            <AnimatedOnScroll>
                <section 
                    className="relative min-h-[120vh]"
                    aria-label="Sección de presentación con video y buscador de propiedades de lujo"
                >
                    <div className="w-full h-[120vh] overflow-hidden relative">
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
                            className="absolute top-0 left-0 w-full h-full object-cover"
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
                                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
                                    {/* Pestañas elegantes */}
                                    <div className="flex mb-8 bg-white/20 backdrop-blur-sm rounded-xl p-1 max-w-md mx-auto border border-white/30">
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
                                                    <input
                                                        type="text"
                                                        placeholder="Ubicación (ej. Malasaña, Salamanca...)"
                                                        value={searchFilters.location}
                                                        onChange={(e) => handleFilterChange('location', e.target.value)}
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
                                                        onClick={() => setShowMap(true)}
                                                        disabled={propertiesLoading}
                                                        className="w-full bg-amarillo hover:bg-amarillo/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                                                    >
                                                        {propertiesLoading ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                                                <span className="hidden sm:inline">Cargando...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <FaSearch className="text-sm" />
                                                                <span className="hidden sm:inline">Buscar Propiedades</span>
                                                                <span className="sm:hidden">Buscar</span>
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
                                                            {getFilteredProperties().length !== allProperties.length && 
                                                                ` • ${getFilteredProperties().length} coinciden`
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Contenido para vender - ultra premium
                                        <div className="text-center py-12">
                                            <div className="max-w-2xl mx-auto">
                                                                                            <h3 className="font-serif text-3xl font-light text-white mb-6">
                                                ¿Desea vender su propiedad?
                                            </h3>
                                            <p className="text-white/80 mb-8 text-lg font-light leading-relaxed">
                                                    Obtenga una valoración profesional y gratuita de su propiedad. 
                                                    Nuestros expertos le ayudarán a conseguir el mejor precio del mercado.
                                                </p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                                                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                                                    <div className="text-amarillo text-4xl mb-4">📊</div>
                                                    <h4 className="font-medium text-white mb-2">Valoración Gratuita</h4>
                                                    <p className="text-white/70 text-sm">Análisis completo del mercado inmobiliario</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                                                    <div className="text-amarillo text-4xl mb-4">🏆</div>
                                                    <h4 className="font-medium text-white mb-2">Expertos en Madrid</h4>
                                                    <p className="text-white/70 text-sm">Conocimiento especializado del mercado local</p>
                                                </div>
                                                </div>

                                                <a
                                                    href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 bg-amarillo hover:bg-amarillo/90 text-white font-medium px-10 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                                >
                                                    <FaCalculator className="text-lg" />
                                                    <span>Valorar mi Propiedad</span>
                                                </a>
                                                
                                                {/* Espaciado adicional para evitar solapamiento con la barra inferior */}
                                                <div className="h-20 mt-8"></div>
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

                    {/* Modal de resultados con diseño premium */}
                    <AnimatePresence>
                        {showMap && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setShowMap(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center p-8 border-b border-gray-100">
                                        <h2 className="font-serif text-3xl font-light text-gray-900">
                                            Propiedades Encontradas
                                            <span className="text-amarillo font-normal ml-2">({getFilteredProperties().length})</span>
                                        </h2>
                                        <button
                                            onClick={() => setShowMap(false)}
                                            className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 h-[75vh]">
                                        {/* Lista de propiedades con diseño premium */}
                                        <div className="overflow-y-auto p-8 space-y-6">
                                            {propertiesLoading ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amarillo"></div>
                                                    <span className="ml-3 text-gray-600 font-light">Conectando con el servidor...</span>
                                                </div>
                                            ) : propertiesError ? (
                                                <div className="text-center py-16 text-red-600">
                                                    <FaTimes className="text-5xl text-red-400 mx-auto mb-6" />
                                                    <h3 className="font-serif text-2xl font-light mb-4">No se pueden cargar las propiedades</h3>
                                                    <p className="text-sm mb-2 text-gray-600">{propertiesError}</p>
                                                    <p className="text-xs text-gray-500 mb-6">
                                                        Asegúrate de que el servidor backend esté corriendo en el puerto 8081
                                                    </p>
                                                    <button 
                                                        onClick={() => window.location.reload()} 
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
                                                    className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 group shadow-lg hover:shadow-xl ${
                                                        selectedProperty?.id === property.id 
                                                            ? 'border-amarillo bg-amarillo/10' 
                                                            : 'border-gray-100 hover:border-amarillo/30'
                                                    }`}
                                                    onClick={() => selectProperty(property)}
                                                    title={`Ver ${property.title} en el mapa`}
                                                >
                                                    <div className="flex gap-6">
                                                        <img
                                                            src={property.image}
                                                            alt={property.title}
                                                            className="w-24 h-24 object-cover rounded-xl"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className={`font-serif text-xl font-light transition-colors mb-2 ${
                                                                selectedProperty?.id === property.id 
                                                                    ? 'text-amarillo' 
                                                                    : 'text-gray-900 group-hover:text-amarillo'
                                                            }`}>
                                                                {property.title}
                                                            </h3>
                                                            <p className="text-gray-600 flex items-center gap-2 mb-3 font-light">
                                                                <FaMapMarkerAlt className="text-amarillo" />
                                                                {property.location}
                                                                {selectedProperty?.id === property.id && (
                                                                    <span className="ml-2 text-xs bg-amarillo text-white px-2 py-1 rounded-full font-medium">
                                                                        Seleccionado
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <FaBed className="text-amarillo" />
                                                                    {property.bedrooms}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <FaBath className="text-amarillo" />
                                                                    {property.bathrooms}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <FaRuler className="text-amarillo" />
                                                                    {property.size}m²
                                                                </span>
                                                            </div>
                                                            <p className="text-2xl font-light text-amarillo">
                                                                €{property.price}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                                ))
                                            )}
                                        </div>
                                        
                                        {/* Google Maps con diseño premium */}
                                        <div className="relative bg-gray-50">
                                            {selectedProperty ? (
                                                <div className="h-full flex flex-col">
                                                    <div className="p-6 bg-white border-b border-gray-100">
                                                        <h3 className="font-serif text-xl font-light text-gray-900 mb-2">
                                                            {selectedProperty.title}
                                                        </h3>
                                                        <p className="text-gray-600 flex items-center gap-2 font-light">
                                                            <FaMapMarkerAlt className="text-amarillo" />
                                                            {selectedProperty.location}
                                                        </p>
                                                    </div>
                                                    
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
                                                        <FaMapMarkerAlt className="text-6xl text-amarillo mx-auto mb-6" />
                                                        <h3 className="font-serif text-2xl font-light mb-4">Selecciona una propiedad</h3>
                                                        <p className="font-light">Haz clic en cualquier propiedad para ver su ubicación</p>
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
