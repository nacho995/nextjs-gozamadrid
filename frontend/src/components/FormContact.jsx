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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-white mb-6">Contacta con nosotros</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
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
                      className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-white placeholder-gray-300"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
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
                      className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-white placeholder-gray-300"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                    Teléfono
                  </label>
                  <div className="relative flex gap-2">
                    <CountryPrefix
                      value={formData.prefix}
                      onChange={(value) => setFormData(prev => ({ ...prev, prefix: value }))}
                      className="p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 
                        focus:border-amarillo focus:ring-2 focus:ring-amarillo text-white text-sm"
                    />
                    <div className="relative flex-1">
                      <FaPhone className="absolute top-1/2 left-4 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 
                          focus:border-amarillo focus:ring-2 focus:ring-amarillo text-white placeholder-gray-300"
                        placeholder="Número de teléfono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
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
                      className="pl-12 w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-white placeholder-gray-300"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amarillo text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition duration-300"
                >
                  Enviar mensaje
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatedOnScroll>
  );
};

export default RegisterForm;
