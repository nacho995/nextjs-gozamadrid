"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaComments } from 'react-icons/fa';
import { sendEmail } from '../pages/api';
import { toast } from 'react-hot-toast';

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crear una copia del formData para el envío
    const formDataToSend = {
      ...formData,
      // Asegurarse de que el teléfono incluya el prefijo
      fullPhone: `${formData.prefix}${formData.phone}`,
    };
    
    // Mostrar un indicador de carga
    setIsSubmitting(true);
    
    try {
      const response = await sendEmail(formDataToSend);
      
      if (response.success) {
        // Mostrar mensaje de éxito
        toast.success('¡Mensaje enviado correctamente!');
        
        // Limpiar el formulario después del envío exitoso
        setFormData({
          name: '',
          email: '',
          prefix: '+34',
          phone: '',
          message: ''
        });
      } else {
        // Mostrar mensaje de error
        toast.error('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
        console.error('Error del servidor:', response.error);
      }
    } catch (error) {
      // Manejar errores de red o cualquier otro error
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      console.error('Error de envío:', error);
    } finally {
      // Desactivar el indicador de carga, independientemente del resultado
      setIsSubmitting(false);
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
        <div className="container mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-5 md:p-8 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-center text-black mb-4 md:mb-6">Contacta con nosotros</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full p-2.5 md:p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300 text-sm md:text-base"
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
                      <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-amarillo" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full p-2.5 md:p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300 text-sm md:text-base"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                      Teléfono
                    </label>
                    <div className="relative flex flex-col sm:flex-row gap-2">
                      <CountryPrefix
                        value={formData.prefix}
                        onChange={(value) => setFormData(prev => ({ ...prev, prefix: value }))}
                        className="w-full sm:w-1/3 md:w-1/4 mb-2 sm:mb-0"
                      />
                      <div className="relative flex-1">
                        <FaPhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-amarillo" />
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 p-2.5 md:p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 
                            focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300 text-sm md:text-base"
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
                    <div className="relative">
                      <FaComments className="absolute top-4 left-3 transform -translate-y-1/2 text-amarillo" />
                      <textarea
                        name="message"
                        id="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className="pl-10 w-full p-2.5 md:p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-300 text-sm md:text-base"
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

          {/* Imagen a la derecha - también visible en tablets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden sm:block w-full max-w-xl h-full"
          >
            <div 
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                    Contacta con nosotros
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base md:text-lg">
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
