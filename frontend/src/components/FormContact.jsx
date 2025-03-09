"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaComments, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import CountryPrefix from "./CountryPrefix";
import AnimatedOnScroll from "./AnimatedScroll";

// Configuración y constantes
const SCHEMA_DATA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Formulario de Contacto - Goza Madrid",
  "description": "Contacta con nuestro equipo de expertos inmobiliarios en Madrid",
  "url": "https://gozamadrid.com/contacto",
  "mainEntity": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34919012103",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"]
    }
  }
};

const FORM_FIELDS = {
  name: {
    id: 'name',
    label: 'Nombre completo',
    type: 'text',
    placeholder: 'Tu nombre',
    icon: <FaUser />,
    required: true,
    errorMessage: 'Por favor, introduce tu nombre'
  },
  email: {
    id: 'email',
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'tu@email.com',
    icon: <FaEnvelope />,
    required: true,
    errorMessage: 'Por favor, introduce un email válido'
  },
  phone: {
    id: 'phone',
    label: 'Teléfono',
    type: 'tel',
    placeholder: 'Número (sin prefijo)',
    icon: <FaPhone />,
    required: true,
    errorMessage: 'Por favor, introduce un teléfono válido'
  },
  message: {
    id: 'message',
    label: 'Mensaje',
    type: 'textarea',
    placeholder: '¿En qué podemos ayudarte?',
    icon: <FaComments />,
    required: true,
    errorMessage: 'Por favor, escribe tu mensaje'
  }
};

const FormContact = () => {
  // Estados
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prefix: '+34',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    Object.entries(FORM_FIELDS).forEach(([key, field]) => {
      if (field.required && !formData[key]) {
        newErrors[key] = field.errorMessage;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = FORM_FIELDS.email.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }
    
    setIsSubmitting(true);
    toast.loading('Enviando mensaje...', { id: 'contactForm' });
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const formattedData = {
        nombre: formData.name,
        email: formData.email,
        prefix: formData.prefix,
        telefono: formData.phone,
        asunto: formData.message
      };
      
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) throw new Error('Error en el envío');
      
      toast.success('¡Mensaje enviado correctamente!', { id: 'contactForm' });
      
      setFormData({
        name: '',
        email: '',
        prefix: '+34',
        phone: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.', { id: 'contactForm' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de campo de formulario
  const FormField = ({ field, value, onChange }) => {
    const baseInputClasses = "w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300";
    
    return (
      <div>
        <label htmlFor={field.id} className="block text-sm font-medium text-black mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center">
          <div className="mr-3 text-amarillo transition-colors duration-300">
            {field.icon}
          </div>
          {field.type === 'textarea' ? (
            <textarea
              id={field.id}
              name={field.id}
              value={value}
              onChange={onChange}
              rows="4"
              className={`${baseInputClasses} min-h-[100px] resize-y`}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={errors[field.id] ? "true" : "false"}
            />
          ) : (
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              value={value}
              onChange={onChange}
              className={baseInputClasses}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={errors[field.id] ? "true" : "false"}
            />
          )}
        </div>
        {errors[field.id] && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(SCHEMA_DATA)}
        </script>
      </Head>

      <AnimatedOnScroll>
        <section className="flex justify-center items-center min-h-screen bg-transparent py-8 px-4 md:py-12">
          <div className="container mx-auto flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-6 md:gap-12 lg:gap-16">
            
            {/* Imagen y texto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-xl md:order-last"
            >
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                {/* Imagen con efecto hover */}
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/formFoto.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  role="img"
                  aria-label="Imagen de contacto de Goza Madrid"
                />
                
                {/* Overlay con texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                    <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 md:mb-4"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                      Contacta con nosotros
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm md:text-lg">
                      Estamos aquí para ayudarte en todo lo que necesites
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md md:order-first"
            >
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 md:p-8 shadow-lg">
                  <h1 className="text-xl md:text-2xl font-bold text-center text-black mb-6 md:mb-8">
                    Contacta con nosotros
                  </h1>
                  
                  <div className="space-y-5">
                    {/* Campos normales */}
                    {Object.entries(FORM_FIELDS).map(([key, field]) => {
                      if (key !== 'phone') {
                        return (
                          <FormField
                            key={key}
                            field={field}
                            value={formData[key]}
                            onChange={handleChange}
                          />
                        );
                      }
                      return null;
                    })}

                    {/* Campo de teléfono con prefijo */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                        {FORM_FIELDS.phone.label} {FORM_FIELDS.phone.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <CountryPrefix
                          value={formData.prefix}
                          onChange={(value) => setFormData(prev => ({ ...prev, prefix: value }))}
                          className="w-full sm:w-1/3 md:w-1/4 mb-2 sm:mb-0"
                        />
                        <div className="flex items-center flex-1">
                          <div className="mr-3 text-amarillo">
                            {FORM_FIELDS.phone.icon}
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300"
                            placeholder={FORM_FIELDS.phone.placeholder}
                            required={FORM_FIELDS.phone.required}
                            aria-invalid={errors.phone ? "true" : "false"}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Botón de envío */}
                    <button
                      type="submit"
                      className="relative w-full py-3 md:py-4 px-6 rounded-lg overflow-hidden group transition-all duration-300 disabled:opacity-70"
                      disabled={isSubmitting}
                    >
                      {/* Fondos */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amarillo to-black transition-opacity duration-700 ease-in-out"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-black to-amarillo opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>
                      
                      {/* Texto y loader */}
                      <span className="relative text-white font-medium z-10 flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
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
        </section>
      </AnimatedOnScroll>
    </>
  );
};

export default FormContact;
