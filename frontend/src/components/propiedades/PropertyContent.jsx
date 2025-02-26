"use client";
import React, { useState, useRef, useEffect } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2"
import { MdMeetingRoom } from "react-icons/md";
import { FaRestroom } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AnimatedOnScroll from "../AnimatedScroll";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes } from 'react-icons/fa';
import { addDays, setHours, setMinutes } from 'date-fns';
import es from 'date-fns/locale/es';
import { toast } from 'react-hot-toast';

export default function DefaultPropertyContent({ property }) {
    const [current, setCurrent] = useState(0);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const calendarRef = useRef(null);
    const [showOfferPanel, setShowOfferPanel] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const offerPanelRef = useRef(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        function handleClickOutside(event) {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        }

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (offerPanelRef.current && !offerPanelRef.current.contains(event.target)) {
                setShowOfferPanel(false);
            }
        }

        if (showOfferPanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOfferPanel]);

    if (!property.images || property.images.length === 0) {
        return (
            <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md mb-6">
                <Image
                    src="/placeholder.png"
                    alt="Placeholder"
                    fill
                    style={{ objectFit: "cover" }}
                />
            </div>
        );
    }

    // Filtrar fechas pasadas y fines de semana
    const filterAvailableDates = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Solo permitir fechas futuras y días de semana (L-V)
        return date >= today && date.getDay() !== 0 && date.getDay() !== 6;
    };

    // Horarios disponibles (de 9:00 a 18:00)
    const availableTimes = Array.from({ length: 10 }, (_, i) => {
        return setHours(setMinutes(new Date(), 0), i + 9);
    });

    const handleSubmit = async () => {
        try {
            const formData = {
                date: selectedDate,
                time: selectedTime,
                email,
                name,
                phone,
                property: property._id
            };

            const response = await fetch('/api/schedule-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Visita programada con éxito');
                setShowCalendar(false);
                // Resetear el formulario
                setSelectedDate(null);
                setSelectedTime(null);
                setEmail('');
                setName('');
                setPhone('');
            } else {
                toast.error('Error al programar la visita');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar la solicitud');
        }
    };

    const handleOfferSubmit = async () => {
        try {
            const formData = {
                offer: selectedOffer.value,
                email,
                name,
                phone,
                property: property._id
            };

            const response = await fetch('/api/submit-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Oferta enviada con éxito');
                setShowOfferPanel(false);
                // Resetear el formulario
                setSelectedOffer(null);
                setEmail('');
                setName('');
                setPhone('');
            } else {
                toast.error('Error al enviar la oferta');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar la oferta');
        }
    };

    // Función para generar rangos de precios
    const generateOfferRanges = (price) => {
        const ranges = [
            { percentage: 95, label: '5% menos', value: price * 0.95 },
            { percentage: 90, label: '10% menos', value: price * 0.90 },
            { percentage: 85, label: '15% menos', value: price * 0.85 },
            { percentage: 80, label: '20% menos', value: price * 0.80 },
            { percentage: 75, label: '25% menos', value: price * 0.75 },
        ];
        return ranges;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <AnimatedOnScroll>
                <article className="relative">
                    {/* Contenedor principal de imágenes */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Miniaturas */}
                        <div className="flex flex-row gap-2 overflow-x-auto w-full md:w-auto md:mr-[5vw] p-2">
                            {property.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`min-w-[80px] h-[60px] md:min-w-[100px] md:h-[80px] 
                                        relative rounded-lg overflow-hidden 
                                        border-2 transition-all duration-300
                                        ${current === index 
                                            ? 'border-amarillo dark:border-amarillo' 
                                            : 'border-transparent hover:border-amarillo dark:hover:border-amarillo'
                                        }`}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Imagen principal */}
                        <div className="relative w-full md:w-[30vw] h-[30vh] md:h-[40vh] 
                            rounded-lg overflow-hidden shadow-lg 
                            transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <Image
                                src={property.images[current].src}
                                alt={property.images[current].alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 30vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Información de la propiedad */}
                    <div className="mt-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">
                            {property.typeProperty}
                        </h1>

                        {/* Detalles principales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-black dark:text-white">
                                <HiMiniSquare3Stack3D className="text-amarillo dark:text-amarillo text-xl" />
                                <span>{property.m2} m²</span>
                            </div>
                            <div className="flex items-center gap-2 text-black dark:text-white">
                                <MdMeetingRoom className="text-amarillo dark:text-amarillo text-xl" />
                                <span>{property.rooms} habitaciones</span>
                            </div>
                            <div className="flex items-center gap-2 text-black dark:text-white">
                                <FaRestroom className="text-amarillo dark:text-amarillo text-xl" />
                                <span>{property.wc} baños</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-amarillo dark:text-amarillo">
                                    {property.price}€
                                </span>
                            </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-black dark:text-white mb-6">
                            {property.description}
                        </p>

                        {/* Botones de acción */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="group relative inline-flex items-center gap-2 overflow-hidden 
                                    rounded-full bg-amarillo/20 dark:bg-amarillo/20 px-8 py-3 
                                    transition-all duration-300 
                                    hover:bg-amarillo/30 dark:hover:bg-amarillo/30 
                                    backdrop-blur-sm"
                            >
                                <span className="relative text-lg font-semibold text-black dark:text-white">
                                    Solicitar visita
                                </span>
                                <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                    bg-gradient-to-r from-amarillo via-black to-amarillo 
                                    dark:from-amarillo dark:via-white dark:to-amarillo 
                                    transition-transform duration-300 
                                    group-hover:translate-x-full">
                                </span>
                            </button>

                            <button
                                onClick={() => setShowOfferPanel(true)}
                                className="group relative inline-flex items-center gap-2 overflow-hidden 
                                    rounded-full bg-amarillo/20 dark:bg-amarillo/20 px-8 py-3 
                                    transition-all duration-300 
                                    hover:bg-amarillo/30 dark:hover:bg-amarillo/30 
                                    backdrop-blur-sm"
                            >
                                <span className="relative text-lg font-semibold text-black dark:text-white">
                                    Hacer una oferta
                                </span>
                                <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                    bg-gradient-to-r from-amarillo via-black to-amarillo 
                                    dark:from-amarillo dark:via-white dark:to-amarillo 
                                    transition-transform duration-300 
                                    group-hover:translate-x-full">
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Panel del calendario */}
                    {showCalendar && (
                        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 
                            flex items-center justify-center"
                        >
                            <div className="bg-white dark:bg-black rounded-xl p-8 max-w-md w-full mx-4 relative">
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className="absolute top-4 right-4 text-black dark:text-white 
                                        hover:text-amarillo dark:hover:text-amarillo 
                                        transition-colors duration-300"
                                >
                                    <FaTimes className="text-xl" />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
                                    Solicitar una visita
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                            Selecciona una fecha
                                        </label>
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={date => setSelectedDate(date)}
                                            minDate={new Date()}
                                            maxDate={addDays(new Date(), 30)}
                                            dateFormat="dd/MM/yyyy"
                                            className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                bg-white dark:bg-black"
                                            locale={es}
                                        />
                                    </div>

                                    {selectedDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                                Horario disponible
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {availableTimes.map((time) => (
                                                    <button
                                                        key={time.getTime()}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`p-2 md:p-3 text-sm md:text-base rounded-lg transition-all duration-300 
                                                            ${selectedTime?.getTime() === time.getTime()
                                                                ? 'bg-amarillo text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
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
                                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                                Email de contacto
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Introduce tu email"
                                                className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                    bg-white dark:bg-black"
                                            />
                                        </div>
                                    )}

                                    {selectedDate && selectedTime && email && (
                                        <div>
                                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                                Datos personales
                                            </label>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Nombre completo"
                                                    className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                        bg-white dark:bg-black"
                                                />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="Teléfono"
                                                    className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                        bg-white dark:bg-black"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedDate && selectedTime && email && name && phone && (
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="w-full sm:w-auto px-4 py-2 md:py-3 text-sm md:text-base rounded-lg 
                                                bg-gray-200 hover:bg-gray-300 
                                                transition-all duration-300 
                                                hover:scale-105"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full sm:w-auto px-4 py-2 md:py-3 text-sm md:text-base rounded-lg 
                                                bg-amarillo text-white hover:bg-amarillo/80 
                                                transition-all duration-300
                                                hover:scale-105"
                                        >
                                            Confirmar Visita
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Panel de ofertas */}
                    {showOfferPanel && (
                        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 
                            flex items-center justify-center"
                        >
                            <div className="bg-white dark:bg-black rounded-xl p-8 max-w-md w-full mx-4 relative">
                                <button
                                    onClick={() => setShowOfferPanel(false)}
                                    className="absolute top-4 right-4 text-black dark:text-white 
                                        hover:text-amarillo dark:hover:text-amarillo 
                                        transition-colors duration-300"
                                >
                                    <FaTimes className="text-xl" />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
                                    Hacer una oferta
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                            Selecciona tu oferta
                                        </label>
                                        <div className="space-y-2">
                                            {generateOfferRanges(property.price).map((range, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedOffer(range)}
                                                    className={`w-full p-3 rounded-lg transition-all duration-300 flex justify-between items-center
                                                        ${selectedOffer?.percentage === range.percentage 
                                                            ? 'bg-amarillo text-white' 
                                                            : 'bg-gray-100 hover:bg-gray-200'}`}
                                                >
                                                    <span>{range.label}</span>
                                                    <span className="font-semibold">
                                                        {Math.round(range.value).toLocaleString()}€
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                            Introduce tu oferta
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Introduce tu oferta"
                                            className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                bg-white dark:bg-black"
                                            onChange={(e) => setSelectedOffer({
                                                value: parseInt(e.target.value),
                                                label: 'Oferta personalizada'
                                            })}
                                        />
                                    </div>
                                </div>

                                {selectedOffer && (
                                    <div className="mt-6 space-y-4 border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                                            <FaUser className="mr-2 text-amarillo dark:text-amarillo" />
                                            Datos de contacto
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email de contacto"
                                                className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                    bg-white dark:bg-black"
                                            />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nombre completo"
                                                className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                    bg-white dark:bg-black"
                                            />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Teléfono"
                                                className="w-full p-2 border rounded-lg text-black dark:text-white 
                                                    bg-white dark:bg-black"
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
                                            className="px-4 py-2 rounded-lg bg-amarillo text-white hover:bg-amarillo/80 transition-all duration-300"
                                        >
                                            Enviar Oferta
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mapa de Google */}
                    <div className="mt-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
                            Ubicación
                        </h2>
                        <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(property.address)}`}
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
                    <div className="bg-gradient-to-br from-black/40 to-amarillo/40 
                        dark:from-black/40 dark:to-amarillo/40 
                        rounded-2xl shadow-lg p-8 text-center mt-8"
                    >
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-6">
                            ¿Tienes preguntas sobre esta propiedad?
                        </h3>
                        <Link href="/contacto">
                            <button className="group relative inline-flex items-center gap-2 overflow-hidden 
                                rounded-full bg-white/20 dark:bg-white/20 px-8 py-3 
                                transition-all duration-300 
                                hover:bg-white/30 dark:hover:bg-white/30 
                                backdrop-blur-sm"
                            >
                                <span className="relative text-lg font-semibold text-black dark:text-white">
                                    Contáctanos
                                </span>
                                <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                    bg-gradient-to-r from-amarillo via-black to-amarillo 
                                    dark:from-amarillo dark:via-white dark:to-amarillo 
                                    transition-transform duration-300 
                                    group-hover:translate-x-full">
                                </span>
                            </button>
                        </Link>
                    </div>
                </article>
            </AnimatedOnScroll>
        </div>
    );
}
