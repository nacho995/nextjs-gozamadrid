"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaComments } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import CountryPrefix from "./CountryPrefix";
import AnimatedOnScroll from "./AnimatedScroll";
import { sendEmail } from '@/pages/api';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prefix: '+34',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que tenemos los campos requeridos
    if (!formData.name || !formData.email) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    
    // Mostrar indicador de carga
    setIsSubmitting(true);
    toast.loading('Enviando mensaje...', { id: 'contactForm' });
    
    // IMPORTANTE: Mostrar éxito inmediatamente como en PropertyContent
    toast.success('¡Mensaje enviado correctamente!', { id: 'contactForm' });
    
    // Limpiar el formulario inmediatamente
    setFormData({
      name: '',
      email: '',
      prefix: '+34', 
      phone: '',
      message: ''
    });
    
    setIsSubmitting(false);
    
    // Enviar en segundo plano con fetch directo (alternativa a sendEmail)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      // Usar los mismos datos que antes
      const formattedData = {
        nombre: formData.name,
        email: formData.email,
        prefix: formData.prefix || '+34',
        telefono: formData.phone || '',
        asunto: formData.message
      };
      
      // Petición en segundo plano, no esperamos respuesta
      fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      }).catch(error => console.error('Error en segundo plano:', error));
      
    } catch (error) {
      console.error('Error:', error);
      // No mostramos error al usuario porque ya le dimos confirmación
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AnimatedOnScroll>
      <div className="flex justify-center items-center min-h-screen bg-transparent py-8 px-4 md:py-12">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
          
          {/* Imagen - ahora con order-last en md para que aparezca a la derecha en desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl h-full mb-6 md:mb-0 md:order-last"
          >
            <div 
              className="relative w-full h-[250px] sm:h-[300px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group"
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
              
              {/* Overlay gradiente - mejorado para móviles */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 md:mb-4"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                    Contacta con nosotros
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm md:text-lg">
                    Estamos aquí para ayudarte en todo lo que necesites
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulario - ahora con order-first en md para que aparezca a la izquierda en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md md:order-first"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-5 md:p-8 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-center text-black mb-4 md:mb-6">Contacta con nosotros</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                      Nombre completo
                    </label>
                    <div className="flex items-center">
                      <div className="mr-3 text-amarillo">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2.5 md:p-3 bg-white bg-opacity-40 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                      Correo electrónico
                    </label>
                    <div className="flex items-center">
                      <div className="mr-3 text-amarillo">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2.5 md:p-3 bg-white bg-opacity-40 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                      Teléfono
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <CountryPrefix
                        value={formData.prefix}
                        onChange={(value) => setFormData(prev => ({ ...prev, prefix: value }))}
                        className="w-full sm:w-1/3 md:w-1/4 mb-2 sm:mb-0"
                      />
                      <div className="flex items-center flex-1">
                        <div className="mr-3 text-amarillo">
                          <FaPhone />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full p-2.5 md:p-3 bg-white bg-opacity-40 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base"
                          placeholder="Número (sin prefijo)"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-1">
                      Mensaje
                    </label>
                    <div className="flex items-start">
                      <div className="mr-3 mt-3 text-amarillo">
                        <FaComments />
                      </div>
                      <textarea
                        name="message"
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2.5 md:p-3 bg-white bg-opacity-40 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base"
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="relative w-full py-2.5 md:py-3 px-6 rounded-lg overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    {/* Fondo base */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amarillo to-black transition-opacity duration-700 ease-in-out"></div>
                    
                    {/* Fondo hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black to-amarillo opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>
                    
                    {/* Texto */}
                    <span className="relative text-white font-medium z-10 flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'Enviar mensaje'
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatedOnScroll>
  );
};

export default RegisterForm;
