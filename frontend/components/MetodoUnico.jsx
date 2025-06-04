import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaHandshake, FaHeart, FaUsers, FaBaby, FaUser, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';

const MetodoUnico = () => {
  const [activeTab, setActiveTab] = useState('vender');
  const [selectedMotivo, setSelectedMotivo] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState(null);

  const motivosVenta = [
    {
      id: 'divorcio',
      icon: <FaHome className="text-2xl" />,
      titulo: 'Divorcio o cambio de ciudad',
      descripcion: 'Situaciones de vida que requieren una transición inmobiliaria'
    },
    {
      id: 'tamaño',
      icon: <FaUsers className="text-2xl" />,
      titulo: 'Casa demasiado grande',
      descripcion: 'Ya no se ajusta a tu estilo de vida actual'
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
      titulo: 'Para recibir familia y amigos',
      descripcion: 'Un hogar acogedor para compartir momentos especiales'
    },
    {
      id: 'hijos',
      icon: <FaBaby className="text-2xl" />,
      titulo: 'Crecer con tus hijos',
      descripcion: 'Un espacio donde tu familia pueda desarrollarse'
    },
    {
      id: 'soltero',
      icon: <FaUser className="text-2xl" />,
      titulo: 'Espacio personal especial',
      descripcion: 'Tu refugio perfecto diseñado para ti'
    },
    {
      id: 'inversion',
      icon: <FaChartLine className="text-2xl" />,
      titulo: 'Inversión inmobiliaria',
      descripcion: 'Alquilar, reformar, vender o asegurar patrimonio'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cada propiedad, cada historia,
            <span className="text-amarillo block">un método único</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Si estás heredando una vivienda, un local o cualquier activo inmobiliario, 
            cada operación requiere un enfoque diferente.
          </p>
        </motion.div>

        {/* Filosofía de trabajo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="bg-amarillo/20 p-3 rounded-full mr-4">
              <FaHandshake className="text-2xl text-amarillo" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Nuestro compromiso</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ No captamos sin más</h4>
              <p className="text-red-700">Muchas veces es mejor decir NO</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Cuando aceptamos</h4>
              <p className="text-green-700">Tenemos claro que la vamos a vender</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs para Vender/Comprar */}
        <div className="mb-8">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-full">
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
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  Los motivos para vender son diversos:
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {motivosVenta.map((motivo) => (
                    <motion.div
                      key={motivo.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMotivo(selectedMotivo === motivo.id ? null : motivo.id)}
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
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
                      <h4 className="font-bold text-lg mb-2 text-gray-900">{motivo.titulo}</h4>
                      <p className="text-gray-600">{motivo.descripcion}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <p className="text-lg text-gray-700 mb-4">
                    <strong>Cada situación es única</strong> y debe tratarse con el método adecuado.
                  </p>
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
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <FaHandshake className="text-2xl text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-blue-900">Trabajamos bajo un principio clave: confianza</h3>
                  </div>
                  <p className="text-blue-800">
                    No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar 
                    la propiedad que realmente encaje contigo.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  ¿Cuál es tu perfil?
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {perfilesCompra.map((perfil) => (
                    <motion.div
                      key={perfil.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPerfil(selectedPerfil === perfil.id ? null : perfil.id)}
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 ${
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
                        <h4 className="font-bold text-lg mb-2 text-gray-900">{perfil.titulo}</h4>
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
          className="bg-gradient-to-r from-amarillo/10 to-amarillo/5 rounded-2xl p-8 text-center"
        >
          <FaHeart className="text-4xl text-amarillo mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            La vivienda es más que un bien
          </h3>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Es un pilar en la vida de cada persona. Estamos aquí para entender tu situación 
            y crear el plan perfecto para ti.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amarillo text-black font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
          >
            Hablemos y encontremos la mejor solución
            <FaArrowRight className="ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default MetodoUnico; 