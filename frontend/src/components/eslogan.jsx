import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaHandshake, FaHeart, FaUsers, FaBaby, FaUser, FaChartLine, FaArrowRight, FaCheck, FaExchangeAlt } from 'react-icons/fa';
import Link from "next/link";

const Eslogan = () => {
  const [activeTab, setActiveTab] = useState('vender');
  const [selectedMotivo, setSelectedMotivo] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState(null);

  const motivosVenta = [
    {
      id: 'divorcio',
      icon: <FaHome className="text-2xl" />,
      titulo: 'Un divorcio o un cambio de ciudad',
      descripcion: 'Situaciones de vida que requieren una transición inmobiliaria'
    },
    {
      id: 'tamaño',
      icon: <FaUsers className="text-2xl" />,
      titulo: 'Una casa demasiado grande que ya no se ajusta a tu estilo de vida',
      descripcion: 'Espacios que han dejado de ser funcionales para tu situación actual'
    },
    {
      id: 'liquidez',
      icon: <FaChartLine className="text-2xl" />,
      titulo: 'Necesidad de liquidez urgente',
      descripcion: 'Requieres convertir tu propiedad en efectivo rápidamente'
    }
  ];

  const perfilesCompra = [
    {
      id: 'familia',
      icon: <FaUsers className="text-2xl" />,
      titulo: 'Una casa para recibir amigos y familia',
      descripcion: 'Un hogar acogedor para compartir momentos especiales'
    },
    {
      id: 'hijos',
      icon: <FaBaby className="text-2xl" />,
      titulo: 'Un hogar donde crecer con tus hijos',
      descripcion: 'Un espacio donde tu familia pueda desarrollarse'
    },
    {
      id: 'soltero',
      icon: <FaUser className="text-2xl" />,
      titulo: 'Eres soltero/a y quieres un espacio especial para ti',
      descripcion: 'Tu refugio perfecto diseñado para ti'
    },
    {
      id: 'inversion',
      icon: <FaChartLine className="text-2xl" />,
      titulo: 'Estás pensando en invertir',
      descripcion: 'Comprar para alquilar, reformar y vender, o asegurar un patrimonio para tus hijos'
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-transparent relative z-20 mb-16">
      <div className="container mx-auto px-4">
        {/* Header principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
          style={{
            paddingTop: '20px', // Padding top mínimo
            transition: 'padding-top 0.5s ease-in-out'
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Cada propiedad, cada historia,
            <span className="text-amarillo block">un método único</span>
          </h1>
          <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
            Si estás heredando una vivienda, un local o cualquier activo inmobiliario, 
            cada operación requiere un enfoque diferente.
          </p>
        </motion.div>

        {/* Filosofía de trabajo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12 border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="bg-amarillo/20 p-3 rounded-full mr-4">
              <FaHandshake className="text-2xl text-amarillo" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nuestro compromiso</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6">
            No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir <strong>NO</strong>. 
            ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ No captamos sin más</h3>
              <p className="text-red-700">Muchas veces es mejor decir NO</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Cuando aceptamos</h3>
              <p className="text-green-700">Tenemos claro que la vamos a vender</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs para Vender/Comprar */}
        <div className="mb-8">
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg">
              <button
                onClick={() => setActiveTab('vender')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'vender' 
                    ? 'bg-amarillo text-black shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ¿Quieres vender?
              </button>
              <button
                onClick={() => setActiveTab('comprar')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'comprar' 
                    ? 'bg-amarillo text-black shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ¿Quieres comprar/alquilar?
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'vender' && (
              <motion.div
                key="vender"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-center mb-8 text-black flex items-center justify-center">
                  <FaExchangeAlt className="mr-3 text-amarillo" />
                  Los motivos para vender son diversos:
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {motivosVenta.map((motivo) => (
                    <motion.div
                      key={motivo.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMotivo(selectedMotivo === motivo.id ? null : motivo.id)}
                      className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedMotivo === motivo.id 
                          ? 'border-amarillo bg-amarillo/5' 
                          : 'border-gray-100 hover:border-amarillo/50'
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full mr-4 ${
                          selectedMotivo === motivo.id ? 'bg-amarillo text-black' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {motivo.icon}
                        </div>
                        {selectedMotivo === motivo.id && (
                          <FaCheck className="text-amarillo text-xl ml-auto" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{motivo.titulo}</h3>
                      <p className="text-gray-600">{motivo.descripcion}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <p className="text-lg text-black mb-6">
                    <strong>Cada situación es única</strong> y debe tratarse con el método adecuado.
                  </p>
                  {/* Botón estratégico del valorador para vendedores */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-4"
                  >
                    <a
                      href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amarillo to-yellow-500 text-black font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center text-lg border-2 border-yellow-600"
                    >
                      💰 ¿Cuánto vale mi propiedad? - Valoración Gratuita
                      <FaArrowRight className="ml-2" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'comprar' && (
              <motion.div
                key="comprar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-amarillo/10 backdrop-blur-sm border border-amarillo/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <FaHandshake className="text-2xl text-amarillo mr-3" />
                    <h2 className="text-xl font-bold text-black">Y si buscas comprar o alquilar, trabajamos bajo un principio clave: confianza</h2>
                  </div>
                  <p className="text-gray-700">
                    No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar 
                    la propiedad que realmente encaje contigo.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-center mb-8 text-black">
                  ¿Cuál es tu situación?
                </h2>
                
                {/* Botón estratégico del valorador para compradores */}
                <div className="text-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amarillo to-yellow-500 text-black font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center text-lg border-2 border-yellow-600"
                    >
                      🔍 Valora propiedades antes de comprar - Servicio Gratuito
                      <FaArrowRight className="ml-2" />
                    </a>
                  </motion.div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {perfilesCompra.map((perfil) => (
                    <motion.div
                      key={perfil.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPerfil(selectedPerfil === perfil.id ? null : perfil.id)}
                      className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedPerfil === perfil.id 
                          ? 'border-amarillo bg-amarillo/5' 
                          : 'border-gray-100 hover:border-amarillo/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`inline-flex p-4 rounded-full mb-4 ${
                          selectedPerfil === perfil.id ? 'bg-amarillo text-black' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {perfil.icon}
                        </div>
                        {selectedPerfil === perfil.id && (
                          <FaCheck className="text-amarillo text-xl mx-auto mb-2" />
                        )}
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{perfil.titulo}</h3>
                        <p className="text-gray-600 text-sm">{perfil.descripcion}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mensaje final */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-amarillo/10 to-amarillo/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-amarillo/20"
        >
          <FaHeart className="text-4xl text-amarillo mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            La vivienda es más que un bien
          </h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Es un pilar en la vida de cada persona. Y estamos aquí para entender tu situación 
            y crear el plan perfecto para ti.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amarillo text-black font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center text-lg"
            >
              🏠 Valorador Gratuito - ¡Conoce el valor real de tu propiedad!
              <FaArrowRight className="ml-2" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Eslogan;
