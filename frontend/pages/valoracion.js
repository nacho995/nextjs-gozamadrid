import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEOMetadata from '../components/SEOMetadata';

// ─── OPCIONES DEL FORMULARIO ────────────────────────────────────────────────
const TIPOS_PROPIEDAD = ['Piso', 'Atico', 'Chalet', 'Villa', 'Duplex', 'Adosado', 'Estudio', 'Local comercial', 'Oficina', 'Otro'];
const ESTADOS_CONSERVACION = ['A estrenar', 'Muy bueno', 'Bueno', 'Necesita reforma parcial', 'Necesita reforma integral'];
const OPCIONES_HABITACIONES = ['Estudio', '1', '2', '3', '4', '5+'];
const OPCIONES_BANOS = ['1', '2', '3', '4+'];
const OPCIONES_PLANTA = ['Bajo', '1', '2', '3', '4', '5', '6+', 'Atico', 'No aplica'];
const EXTRAS = ['Terraza', 'Balcon', 'Jardin', 'Piscina', 'Aire acondicionado', 'Calefaccion central', 'Suelo radiante', 'Armarios empotrados', 'Cocina equipada', 'Vistas despejadas', 'Luminoso', 'Reformado recientemente'];

const Valoracion = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipoPropiedad: '',
    direccion: '',
    codigoPostal: '',
    superficie: '',
    habitaciones: '',
    banos: '',
    planta: '',
    ascensor: '',
    garaje: '',
    trastero: '',
    estadoConservacion: '',
    anosConstruccion: '',
    extras: [],
    mensaje: '',
    aceptaPrivacidad: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOptionSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraToggle = (extra) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra],
    }));
  };

  const totalSteps = 4;

  const nextStep = () => {
    if (step === 1 && !formData.tipoPropiedad) {
      toast.error('Seleccione el tipo de propiedad');
      return;
    }
    if (step === 2 && !formData.direccion) {
      toast.error('Introduzca la direccion de la propiedad');
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.nombre || !formData.telefono || !formData.email) {
      toast.error('Complete los campos de contacto (nombre, telefono y email)');
      return;
    }
    if (!formData.aceptaPrivacidad) {
      toast.error('Debe aceptar la politica de privacidad');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/solicitar-valoracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud');
      }

      setEnviado(true);
      toast.success('Solicitud enviada. Marta se pondra en contacto con usted pronto.');
    } catch (err) {
      toast.error(err.message || 'Error al enviar. Intentelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ─── ANIMATION VARIANTS ──────────────────────────────────────────────
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideVariant = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: -60, opacity: 0, transition: { duration: 0.3 } },
  };

  // ─── PILL BUTTON COMPONENT ───────────────────────────────────────────
  const PillButton = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
        selected
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black border-yellow-400 shadow-lg shadow-yellow-500/20'
          : 'bg-white/5 text-white/80 border-white/20 hover:border-yellow-500/50 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <>
      <SEOMetadata
        title="Valoracion Gratuita de tu Propiedad en Madrid | Goza Madrid"
        description="Solicita una valoracion gratuita y sin compromiso de tu propiedad en Madrid. Nuestros expertos inmobiliarios te daran un precio estimado basado en el mercado actual."
        keywords="valoracion propiedad Madrid, valorar piso Madrid, precio vivienda Madrid, tasacion gratuita Madrid, valoracion inmobiliaria"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
        ogImageAlt="Valoracion de propiedades en Madrid - Goza Madrid"
        author="Marta Lopez - Goza Madrid"
      />
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <header className="w-full">
          <div className="bg-gradient-to-r from-black via-black to-amarillo backdrop-blur-md py-3 px-4 shadow-xl border-b border-yellow-600/30">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="relative z-10">
                <div className="flex items-center" style={{ maxHeight: '8rem' }}>
                  <img src="/logonuevo.png" alt="Real Estate Goza Madrid" width={150} height={200} style={{ maxHeight: '200px', width: 'auto' }} loading="eager" />
                </div>
              </Link>
              <a
                href="tel:+34608136529"
                className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">+34 608 136 529</span>
              </a>
            </div>
          </div>
        </header>

        {/* ── HERO SECTION ───────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1770&q=80)',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-20 h-20 md:w-40 md:h-40 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 md:w-40 md:h-40 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl" />
          </div>

          <motion.div className="relative z-10 max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-700/20 backdrop-blur-sm border border-yellow-500/40 rounded-full">
              <span className="text-yellow-400 font-medium uppercase tracking-wider text-sm md:text-base">Servicio 100% gratuito y sin compromiso</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Descubra el Valor Real</span>
              <span className="block">de su <span className="text-yellow-500">Propiedad</span></span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Nuestros expertos inmobiliarios analizaran su propiedad y le proporcionaran una valoracion personalizada basada en el mercado actual de Madrid.
            </p>
            <motion.a
              href="#formulario"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 px-8 py-4 text-lg font-bold text-black shadow-xl transition duration-300 hover:from-yellow-600 hover:to-yellow-800 inline-block border-2 border-yellow-400/30"
            >
              Solicitar Valoracion Gratuita
            </motion.a>
          </motion.div>
        </section>

        {/* ── ADVANTAGES / TRUST SECTION ─────────────────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950">
          <div className="container mx-auto max-w-6xl">
            <motion.h2 variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-center mb-4">
              Por que valorar con <span className="text-yellow-500">Goza Madrid</span>
            </motion.h2>
            <motion.p variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-white/60 text-center mb-14 max-w-2xl mx-auto">
              Mas de 15 anos de experiencia en el mercado inmobiliario madrileno nos avalan
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  ),
                  title: 'Valoracion Profesional',
                  desc: 'Analisis detallado del mercado, comparables recientes y tendencias de la zona para determinar el precio optimo.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ),
                  title: 'Respuesta en 24-48h',
                  desc: 'Marta Lopez, nuestra experta, le contactara personalmente con una estimacion en menos de 48 horas.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  ),
                  title: 'Conocimiento Local',
                  desc: 'Especializados en Madrid: Salamanca, Chamberi, Chamartin, Retiro, Centro y las mejores zonas de la capital.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:border-yellow-500/40 transition-all duration-500 group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 text-yellow-500 mb-5 group-hover:from-yellow-500/30 group-hover:to-yellow-700/30 transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMULARIO ─────────────────────────────────────────────── */}
        <section id="formulario" className="py-20 px-4 bg-gradient-to-b from-gray-950 to-black">
          <div className="container mx-auto max-w-3xl">
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Solicite su <span className="text-yellow-500">Valoracion Gratuita</span>
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Complete el formulario con los datos de su propiedad. Cuanta mas informacion nos proporcione, mas precisa sera nuestra valoracion.
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                {['Tipo', 'Ubicacion', 'Detalles', 'Contacto'].map((label, i) => (
                  <span key={i} className={`text-xs font-semibold tracking-wider uppercase ${step > i ? 'text-yellow-500' : step === i + 1 ? 'text-white' : 'text-white/30'}`}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Form card */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              {enviado ? (
                /* ─── SUCCESS STATE ─── */
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Solicitud Enviada</h3>
                  <p className="text-white/60 mb-8 max-w-md mx-auto">
                    Hemos recibido los datos de su propiedad. Marta Lopez se pondra en contacto con usted en las proximas 24-48 horas con una valoracion personalizada.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 px-6 py-3 text-black font-bold shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300">
                      Volver al Inicio
                    </Link>
                    <a href="tel:+34608136529" className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-white font-bold hover:bg-white/20 transition-all duration-300">
                      Llamar Ahora
                    </a>
                  </div>
                </motion.div>
              ) : (
                /* ─── FORM STEPS ─── */
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Tipo de propiedad */}
                    {step === 1 && (
                      <motion.div key="step1" variants={slideVariant} initial="enter" animate="center" exit="exit">
                        <h3 className="text-xl font-bold mb-2">Que tipo de propiedad desea valorar?</h3>
                        <p className="text-white/50 text-sm mb-6">Seleccione el tipo que mejor describa su inmueble</p>
                        <div className="flex flex-wrap gap-3 mb-8">
                          {TIPOS_PROPIEDAD.map(tipo => (
                            <PillButton key={tipo} label={tipo} selected={formData.tipoPropiedad === tipo} onClick={() => handleOptionSelect('tipoPropiedad', tipo)} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Ubicacion */}
                    {step === 2 && (
                      <motion.div key="step2" variants={slideVariant} initial="enter" animate="center" exit="exit">
                        <h3 className="text-xl font-bold mb-2">Donde esta la propiedad?</h3>
                        <p className="text-white/50 text-sm mb-6">Estos datos son esenciales para una valoracion precisa</p>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Direccion completa *</label>
                            <input
                              type="text"
                              name="direccion"
                              value={formData.direccion}
                              onChange={handleChange}
                              placeholder="Ej: Calle Serrano 45, 3o B, Madrid"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Codigo Postal</label>
                            <input
                              type="text"
                              name="codigoPostal"
                              value={formData.codigoPostal}
                              onChange={handleChange}
                              placeholder="Ej: 28006"
                              maxLength={5}
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Detalles de la propiedad */}
                    {step === 3 && (
                      <motion.div key="step3" variants={slideVariant} initial="enter" animate="center" exit="exit">
                        <h3 className="text-xl font-bold mb-2">Detalles de la propiedad</h3>
                        <p className="text-white/50 text-sm mb-6">Cuantos mas detalles, mejor sera la valoracion</p>
                        <div className="space-y-6">
                          {/* Superficie */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Superficie (m2)</label>
                            <input
                              type="number"
                              name="superficie"
                              value={formData.superficie}
                              onChange={handleChange}
                              placeholder="Ej: 120"
                              min="1"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                            />
                          </div>

                          {/* Habitaciones */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Habitaciones</label>
                            <div className="flex flex-wrap gap-2">
                              {OPCIONES_HABITACIONES.map(h => (
                                <PillButton key={h} label={h} selected={formData.habitaciones === h} onClick={() => handleOptionSelect('habitaciones', h)} />
                              ))}
                            </div>
                          </div>

                          {/* Banos */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Banos</label>
                            <div className="flex flex-wrap gap-2">
                              {OPCIONES_BANOS.map(b => (
                                <PillButton key={b} label={b} selected={formData.banos === b} onClick={() => handleOptionSelect('banos', b)} />
                              ))}
                            </div>
                          </div>

                          {/* Planta */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Planta</label>
                            <div className="flex flex-wrap gap-2">
                              {OPCIONES_PLANTA.map(p => (
                                <PillButton key={p} label={p} selected={formData.planta === p} onClick={() => handleOptionSelect('planta', p)} />
                              ))}
                            </div>
                          </div>

                          {/* Ascensor / Garaje / Trastero */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { name: 'ascensor', label: 'Ascensor' },
                              { name: 'garaje', label: 'Garaje' },
                              { name: 'trastero', label: 'Trastero' },
                            ].map(({ name, label }) => (
                              <div key={name}>
                                <label className="block text-sm font-semibold text-white/80 mb-2">{label}</label>
                                <div className="flex gap-2">
                                  <PillButton label="Si" selected={formData[name] === 'Si'} onClick={() => handleOptionSelect(name, 'Si')} />
                                  <PillButton label="No" selected={formData[name] === 'No'} onClick={() => handleOptionSelect(name, 'No')} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Estado de conservacion */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Estado de conservacion</label>
                            <div className="flex flex-wrap gap-2">
                              {ESTADOS_CONSERVACION.map(e => (
                                <PillButton key={e} label={e} selected={formData.estadoConservacion === e} onClick={() => handleOptionSelect('estadoConservacion', e)} />
                              ))}
                            </div>
                          </div>

                          {/* Ano de construccion */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Ano de construccion (aprox.)</label>
                            <input
                              type="text"
                              name="anosConstruccion"
                              value={formData.anosConstruccion}
                              onChange={handleChange}
                              placeholder="Ej: 1985"
                              maxLength={4}
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                            />
                          </div>

                          {/* Extras */}
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Extras y caracteristicas</label>
                            <div className="flex flex-wrap gap-2">
                              {EXTRAS.map(extra => (
                                <PillButton key={extra} label={extra} selected={formData.extras.includes(extra)} onClick={() => handleExtraToggle(extra)} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: Datos de contacto */}
                    {step === 4 && (
                      <motion.div key="step4" variants={slideVariant} initial="enter" animate="center" exit="exit">
                        <h3 className="text-xl font-bold mb-2">Sus datos de contacto</h3>
                        <p className="text-white/50 text-sm mb-6">Le enviaremos la valoracion a traves de estos medios</p>

                        {/* Marta's photo + trust message */}
                        <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                          <img src="/marta.jpeg" alt="Marta Lopez" className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500/50" />
                          <div>
                            <p className="font-bold text-sm">Marta Lopez</p>
                            <p className="text-white/50 text-xs">Experta inmobiliaria - Le contactara personalmente con la valoracion de su propiedad</p>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Nombre completo *</label>
                            <input
                              type="text"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              placeholder="Su nombre y apellidos"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Telefono *</label>
                            <input
                              type="tel"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleChange}
                              placeholder="Ej: 612 345 678"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="su@email.com"
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Mensaje adicional (opcional)</label>
                            <textarea
                              name="mensaje"
                              value={formData.mensaje}
                              onChange={handleChange}
                              placeholder="Cualquier detalle adicional sobre su propiedad que considere relevante..."
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30 transition-all resize-none"
                            />
                          </div>

                          {/* Privacy checkbox */}
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              name="aceptaPrivacidad"
                              checked={formData.aceptaPrivacidad}
                              onChange={handleChange}
                              className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-yellow-500 focus:ring-yellow-500/30 cursor-pointer"
                            />
                            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                              Acepto la{' '}
                              <Link href="/politica-privacidad" className="text-yellow-500 underline hover:text-yellow-400" target="_blank">
                                politica de privacidad
                              </Link>{' '}
                              y consiento el tratamiento de mis datos personales para recibir la valoracion solicitada.
                            </span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ─── NAVIGATION BUTTONS ─── */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    {step > 1 ? (
                      <button type="button" onClick={prevStep} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Anterior
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300"
                      >
                        Siguiente
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Enviando...
                          </>
                        ) : (
                          <>
                            Solicitar Valoracion
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>

            {/* Resumen de datos (debajo del formulario) */}
            {!enviado && step >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/50">
                <p className="font-semibold text-white/70 mb-2">Resumen de su solicitud:</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {formData.tipoPropiedad && <span>Tipo: <strong className="text-yellow-500">{formData.tipoPropiedad}</strong></span>}
                  {formData.direccion && <span>Dir: <strong className="text-white/80">{formData.direccion}</strong></span>}
                  {formData.superficie && <span>{formData.superficie} m2</span>}
                  {formData.habitaciones && <span>{formData.habitaciones} hab.</span>}
                  {formData.banos && <span>{formData.banos} banos</span>}
                  {formData.estadoConservacion && <span>{formData.estadoConservacion}</span>}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── CONTACT INFO SECTION ───────────────────────────────────── */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-950">
          <div className="container mx-auto max-w-4xl">
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <img src="/marta.jpeg" alt="Marta Lopez - Goza Madrid" className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500/40 shadow-2xl" />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Marta Lopez</h3>
                <p className="text-yellow-500 font-semibold mb-3">Directora Comercial - Goza Madrid</p>
                <p className="text-white/60 mb-5 max-w-lg">
                  Con amplia experiencia en el sector inmobiliario de Madrid, Marta le atendera personalmente para proporcionarle una valoracion precisa y asesoramiento profesional sobre la venta de su propiedad.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <a href="tel:+34608136529" className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    +34 608 136 529
                  </a>
                  <a href="mailto:marta@gozamadrid.com" className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    marta@gozamadrid.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <footer className="bg-gradient-to-b from-gray-950 via-gray-900 to-amarillo text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-white-700 rounded-full" />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="mb-6 md:mb-0 text-center md:text-left text-white">
                <Link href="/" className="relative z-10">
                  <div className="flex items-center justify-center md:justify-start" style={{ maxHeight: '8rem' }}>
                    <img src="/logonuevo.png" alt="Real Estate Goza Madrid" width={150} height={200} style={{ maxHeight: '200px', width: 'auto' }} loading="lazy" />
                  </div>
                </Link>
                <p className="text-sm text-white max-w-md leading-relaxed mt-4">
                  Expertos en valoracion y venta de propiedades en Madrid. Asesoramiento personalizado y profesional para maximizar el valor de su inmueble.
                </p>
              </div>
              <div className="text-center md:text-right">
                <a href="#formulario" className="inline-block mb-6 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105">
                  Solicitar Valoracion Gratuita
                </a>
                <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
                  <Link href="/aviso-legal" className="text-sm text-white hover:text-gray-400 transition-colors">Aviso Legal</Link>
                  <Link href="/politica-privacidad" className="text-sm text-white hover:text-gray-400 transition-colors">Politica de Privacidad</Link>
                  <Link href="/politica-cookies" className="text-sm text-white hover:text-gray-400 transition-colors">Politica de Cookies</Link>
                </div>
                <p className="text-xs text-white">&copy; {new Date().getFullYear()} Real Estate Goza Madrid. Todos los derechos reservados.</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-yellow-700/30 text-center text-sm text-white">
              <p>Calle de Azulinas, 28036 Madrid | Email: marta@gozamadrid.com | Tel: +34 608 136 529</p>
            </div>
          </div>
        </footer>

        {/* ── FLOATING BUTTONS ───────────────────────────────────────── */}
        <AnimatePresence>
          {showFloatingCTA && (
            <motion.a
              href="#formulario"
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-5 py-3 rounded-full shadow-xl flex items-center space-x-2 border-2 border-yellow-400/30"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="font-bold text-sm">Valorar mi propiedad</span>
            </motion.a>
          )}
        </AnimatePresence>
        <motion.a
          href="https://wa.me/34608136529?text=Hola%2C%20me%20gustaria%20solicitar%20una%20valoracion%20de%20mi%20propiedad%20en%20Madrid."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 left-8 z-40 bg-green-500 text-white p-3 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6" fill="white"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
        </motion.a>
      </div>
    </>
  );
};

Valoracion.getLayout = function getLayout(page) {
  return <>{page}</>;
};

export default Valoracion;
