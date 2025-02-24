"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaComments } from 'react-icons/fa';

import CountryPrefix from "./CountryPrefix";
import AnimatedOnScroll from "./AnimatedScroll";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de envío del formulario
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AnimatedOnScroll>
      <main className="min-h-screen flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            {/* Columna del Formulario */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-black via-amarillo to-black">
                  Contacta con Nosotros
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Campo Nombre */}
                    <div className="relative">
                      <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre completo"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/5 border border-gray-200 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo/20 transition-all duration-300
                          placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {/* Campo Email */}
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Correo electrónico"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/5 border border-gray-200 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo/20 transition-all duration-300
                          placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {/* Campo Teléfono */}
                    <div className="relative">
                      <FaPhone className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Número de teléfono"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/5 border border-gray-200 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo/20 transition-all duration-300
                          placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {/* Campo Mensaje */}
                    <div className="relative">
                      <FaComments className="absolute top-4 left-4 text-amarillo" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="¿En qué podemos ayudarte?"
                        rows="4"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/5 border border-gray-200 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo/20 transition-all duration-300
                          placeholder:text-gray-400 resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Botón de envío */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-black via-amarillo to-black text-white py-4 
                      rounded-lg font-semibold shadow-lg hover:shadow-xl 
                      transition-all duration-700 ease-in-out
                      hover:from-amarillo hover:via-black hover:to-amarillo
                      bg-[size:100%] hover:bg-[size:200%] bg-left hover:bg-right"
                  >
                    Enviar Mensaje
                  </motion.button>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    Nos pondremos en contacto contigo lo antes posible
                  </p>
                </form>
              </motion.div>
            </div>

            {/* Columna de la Imagen */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-[600px] rounded-2xl overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/formFoto.jpeg')",
                    
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">¿Necesitas ayuda?</h3>
                    <p className="text-lg">
                      Nuestro equipo de expertos está aquí para ayudarte en cada paso
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </AnimatedOnScroll>
  );
};

export default RegisterForm;
