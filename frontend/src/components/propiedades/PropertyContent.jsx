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
import { FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser } from 'react-icons/fa';
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

    const handleSubmit = () => {
        console.log({
            date: selectedDate,
            time: selectedTime,
            email,
            name,
            phone
        });
        
        setSelectedDate(null);
        setSelectedTime(null);
        setEmail('');
        setName('');
        setPhone('');
        setShowCalendar(false);
    };

    const handleOfferSubmit = async () => {
        if (selectedOffer && email && name && phone) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'offer',
                        data: {
                            offerAmount: selectedOffer.value,
                            originalPrice: property.price,
                            propertyId: property.id,
                            propertyAddress: property.address,
                            contactInfo: {
                                email,
                                name,
                                phone
                            }
                        }
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Oferta enviada correctamente');
                    setShowOfferPanel(false);
                    // Resetear los campos
                    setEmail('');
                    setName('');
                    setPhone('');
                    setSelectedOffer(null);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error('Error al enviar la oferta');
                console.error('Error:', error);
            }
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
        <div className="relative w-full min-h-fit pb-32">
            <div
                className="fixed inset-0 z-0 opacity-100 h-full"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <article className="prose max-w-none relative z-10">
                    <div className="container-fluid relative px-3">
                        <div className="layout-specing">
                            <div className="md:flex justify-center items-center">
                                <h5 className="text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amarillo via-amarillo to-black  font-semibold">Detalles de la propiedad</h5>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-full md:w-3/4 h-96 overflow-hidden rounded-lg shadow-md">
                                    <Image
                                        src={property.images[0].src}
                                        alt={property.images[0].alt || "Imagen principal"}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <div className="flex flex-row items-center gap-4">
                                    <div className="flex flex-row gap-2 overflow-x-auto mr-[5vw]">
                                        {property.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrent(idx)}
                                                className={`w-24 h-24 border-2 rounded overflow-hidden ${idx === current ? "border-green-600" : "border-transparent"}`}
                                            >
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt || `Miniatura ${idx + 1}`}
                                                    width={96}
                                                    height={96}
                                                    objectFit="cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative w-[30vw] h-[40vh] ml-[5vw] overflow-hidden rounded-lg shadow-md">
                                        <Image
                                            src={property.images[current].src}
                                            alt={property.images[current].alt || "Imagen seleccionada"}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pb-20">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8">
                                        <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                                            <h4 className="text-3xl font-semibold text-gray-800 mb-6">{property.address}</h4>
                                            
                                            <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-gray-100">
                                                <div className="flex items-center justify-center">
                                                    <HiMiniSquare3Stack3D className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Superficie</p>
                                                        <p className="text-lg font-semibold">{property.m2} m²</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <MdMeetingRoom className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Habitaciones</p>
                                                        <p className="text-lg font-semibold">{property.rooms}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <FaRestroom className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Baños</p>
                                                        <p className="text-lg font-semibold">{property.wc}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <h5 className="text-xl font-semibold mb-4">Descripción</h5>
                                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                                            </div>

                                            <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
                                                <iframe
                                                    width="100%"
                                                    height="400"
                                                    loading="lazy"
                                                    allowFullScreen
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(property.address)}`}
                                                    title="Mapa de ubicación"
                                                    className="rounded-xl"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="bg-white rounded-2xl shadow-lg p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h5 className="text-2xl font-semibold text-gray-800">Precio</h5>
                                                <span className="bg-amarillo/20 text-black font-semibold px-4 py-2 rounded-full text-sm">
                                                    En venta
                                                </span>
                                            </div>

                                            <div className="text-3xl font-bold text-gray-800 mb-6">
                                                {property.price.toLocaleString()}€
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Precio/m²</span>
                                                    <span className="font-semibold">{property.priceM2 || "N/A"}€</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowCalendar(!showCalendar)}
                                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/20 w-full
                                                            px-4 sm:px-6 lg:px-8 
                                                            py-2 sm:py-2.5 lg:py-3 
                                                            transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                                    >
                                                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center w-full">
                                                            Agendar Visita
                                                        </span>
                                                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                    </button>

                                                    <AnimatePresence>
                                                        {showCalendar && (
                                                            <motion.div
                                                                ref={calendarRef}
                                                                initial={{ opacity: 0, y: -20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                                className="absolute z-[500] mt-2 w-full bg-white rounded-xl shadow-xl p-4"
                                                                style={{
                                                                    maxHeight: '80vh',
                                                                    overflowY: 'auto',
                                                                    marginBottom: '2rem'
                                                                }}
                                                            >
                                                                <div className="mb-4">
                                                                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                                                                        <FaCalendarAlt className="mr-2 text-amarillo" />
                                                                        Selecciona una fecha
                                                                    </h3>
                                                                    <DatePicker
                                                                        selected={selectedDate}
                                                                        onChange={(date) => setSelectedDate(date)}
                                                                        filterDate={filterAvailableDates}
                                                                        minDate={new Date()}
                                                                        locale={es}
                                                                        dateFormat="dd/MM/yyyy"
                                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                        placeholderText="Selecciona una fecha"
                                                                        inline
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        yearItemNumber={6}
                                                                    />
                                                                </div>

                                                                {selectedDate && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="mb-4"
                                                                    >
                                                                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                                                                            <FaClock className="mr-2 text-amarillo" />
                                                                            Horario disponible
                                                                        </h3>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {availableTimes.map((time) => (
                                                                                <button
                                                                                    key={time.getTime()}
                                                                                    onClick={() => setSelectedTime(time)}
                                                                                    className={`p-2 rounded-lg text-sm transition-all duration-300 
                                                                                        ${selectedTime?.getTime() === time.getTime()
                                                                                            ? 'bg-amarillo text-white'
                                                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                                                        }`}
                                                                                >
                                                                                    {time.getHours()}:00
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                )}

                                                                {selectedDate && selectedTime && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="mb-4"
                                                                    >
                                                                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                                                                            <FaEnvelope className="mr-2 text-amarillo" />
                                                                            Email de contacto
                                                                        </h3>
                                                                        <input
                                                                            type="email"
                                                                            value={email}
                                                                            onChange={(e) => setEmail(e.target.value)}
                                                                            placeholder="Introduce tu email"
                                                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                        />
                                                                    </motion.div>
                                                                )}

                                                                {selectedDate && selectedTime && email && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="mb-4"
                                                                    >
                                                                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                                                                            <FaUser className="mr-2 text-amarillo" />
                                                                            Datos personales
                                                                        </h3>
                                                                        <div className="space-y-3">
                                                                            <input
                                                                                type="text"
                                                                                value={name}
                                                                                onChange={(e) => setName(e.target.value)}
                                                                                placeholder="Nombre completo"
                                                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                            />
                                                                            <input
                                                                                type="tel"
                                                                                value={phone}
                                                                                onChange={(e) => setPhone(e.target.value)}
                                                                                placeholder="Teléfono"
                                                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                            />
                                                                        </div>
                                                                    </motion.div>
                                                                )}

                                                                {selectedDate && selectedTime && email && name && phone && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="flex justify-end gap-2"
                                                                    >
                                                                        <button
                                                                            onClick={() => setShowCalendar(false)}
                                                                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                        <button
                                                                            onClick={handleSubmit}
                                                                            className="px-4 py-2 rounded-lg bg-amarillo text-white hover:bg-amarillo/80 transition-all duration-300"
                                                                        >
                                                                            Confirmar Visita
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowOfferPanel(!showOfferPanel)}
                                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/20 w-full
                                                            px-4 sm:px-6 lg:px-8 
                                                            py-2 sm:py-2.5 lg:py-3 
                                                            transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                                    >
                                                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center w-full">
                                                            Hacer Oferta
                                                        </span>
                                                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                    </button>

                                                    <AnimatePresence>
                                                        {showOfferPanel && (
                                                            <motion.div
                                                                ref={offerPanelRef}
                                                                initial={{ opacity: 0, y: -20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                                className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl p-4"
                                                                style={{
                                                                    maxHeight: '80vh',
                                                                    overflowY: 'auto',
                                                                    marginBottom: '2rem'
                                                                }}
                                                            >
                                                                <div className="mb-4">
                                                                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                                                                        <span className="flex items-center">
                                                                            <FaHandshake className="mr-2 text-amarillo" />
                                                                            Selecciona tu oferta
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">
                                                                            Precio actual: {property.price.toLocaleString()}€
                                                                        </span>
                                                                    </h3>
                                                                    <div className="space-y-2">
                                                                        {generateOfferRanges(property.price).map((range, index) => (
                                                                            <motion.button
                                                                                key={index}
                                                                                initial={{ opacity: 0, x: -20 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: index * 0.1 }}
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
                                                                            </motion.button>
                                                                        ))}
                                                                        
                                                                        <div className="mt-6 pt-4 border-t">
                                                                            <p className="text-sm text-gray-600 mb-2">
                                                                                ¿Tienes otra oferta en mente?
                                                                            </p>
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Introduce tu oferta"
                                                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent mb-4"
                                                                                onChange={(e) => setSelectedOffer({
                                                                                    value: parseInt(e.target.value),
                                                                                    label: 'Oferta personalizada'
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {selectedOffer && (
                                                                    <>
                                                                        <motion.div
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            className="mt-6 space-y-4 border-t pt-4"
                                                                        >
                                                                            <h3 className="text-lg font-semibold mb-2 flex items-center">
                                                                                <FaUser className="mr-2 text-amarillo" />
                                                                                Datos de contacto
                                                                            </h3>
                                                                            
                                                                            <div className="space-y-3">
                                                                                <input
                                                                                    type="email"
                                                                                    value={email}
                                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                                    placeholder="Email de contacto"
                                                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={name}
                                                                                    onChange={(e) => setName(e.target.value)}
                                                                                    placeholder="Nombre completo"
                                                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                                />
                                                                                <input
                                                                                    type="tel"
                                                                                    value={phone}
                                                                                    onChange={(e) => setPhone(e.target.value)}
                                                                                    placeholder="Teléfono"
                                                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amarillo focus:border-transparent"
                                                                                />
                                                                            </div>
                                                                        </motion.div>

                                                                        {email && name && phone && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0 }}
                                                                                animate={{ opacity: 1 }}
                                                                                className="flex justify-end gap-2 mt-4"
                                                                            >
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
                                                                            </motion.div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-black/40 to-amarillo/40 rounded-2xl shadow-lg p-8 text-center">
                                            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                                ¿Tienes preguntas sobre esta propiedad?
                                            </h3>
                                            <Link href="/contacto">
                                                <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/20
                                                    px-4 sm:px-6 lg:px-8 
                                                    py-2 sm:py-2.5 lg:py-3 
                                                    transition-all duration-300 hover:bg-white/40 backdrop-blur-sm"
                                                >
                                                    <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center">
                                                        Contáctanos
                                                    </span>
                                                    <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showOfferPanel && <div className="h-[500px]" />}
                </article>
            </AnimatedOnScroll>
        </div>
    );
}
