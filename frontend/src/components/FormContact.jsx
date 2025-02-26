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
    prefix: '+34',
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
      <div className="flex justify-center items-center min-h-screen bg-transparent py-12">
        <div className="container mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-black mb-6">Contacta con nosotros</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                      Teléfono
                    </label>
                    <div className="relative flex gap-2">
                      <CountryPrefix
                        value={formData.prefix}
                        onChange={(value) => setFormData(prev => ({ ...prev, prefix: value }))}
                        className="w-1/4 p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black text-sm"
                      />
                      <div className="relative flex-1">
                        <FaPhone className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-[15vw] pl-12 p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 
                            focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300"
                          placeholder="Número de teléfono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-1">
                      Mensaje
                    </label>
                    <div className="relative">
                      <FaComments className="absolute top-4 left-4 transform -translate-y-1/2 text-amarillo" />
                      <textarea
                        name="message"
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300"
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="relative w-full py-3 px-6 rounded-lg overflow-hidden group"
                  >
                    {/* Fondo base */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amarillo to-black transition-opacity duration-700 ease-in-out"></div>
                    
                    {/* Fondo hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black to-amarillo opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>
                    
                    {/* Texto */}
                    <span className="relative text-white font-medium z-10">
                      Enviar mensaje
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Imagen a la derecha */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block w-full max-w-xl h-full"
          >
            <div 
              className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl group"
            >
              {/* Contenedor de la imagen con efecto hover */}
              <div
                className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110"
                style={{
                  backgroundImage: "url('/formFoto.jpeg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-bold text-white mb-4"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                    Contacta con nosotros
                  </h3>
                  <p className="text-white/90 text-lg">
                    Estamos aquí para ayudarte en todo lo que necesites
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedOnScroll>
  );
};

export default RegisterForm;
