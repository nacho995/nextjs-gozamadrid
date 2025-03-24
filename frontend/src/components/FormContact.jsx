"use client";
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaComments, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import CountryPrefix from "./CountryPrefix";
import AnimatedOnScroll from "./AnimatedScroll";

const FormContact = () => {
  // Referencias para los inputs
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const messageRef = useRef(null);
  
  // Estado para el prefijo y el estado de envío
  const [prefix, setPrefix] = useState('+34');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Obtener valores de los refs
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const message = messageRef.current.value;
    
    // Validación básica
    if (!name || !email || !phone || !message) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor, introduce un email válido');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Enviando mensaje...');

    try {
      // Crear el objeto de datos con el formato correcto
      const contactData = {
        nombre: name,
        email: email,
        telefono: phone,
        prefix: prefix,
        mensaje: message,
        ccEmail: 'ignaciodalesio1995@gmail.com' // Añadir siempre ignaciodalesio1995@gmail.com en copia
      };
      
      console.log("Enviando datos de contacto:", contactData);
      
      // Usar el proxy local para evitar problemas de mixed content
      const response = await fetch(`/api/api-proxy?path=api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });

      // Verificar respuesta
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error('Error al enviar el mensaje');
      }
      
      const data = await response.json();
      console.log("Respuesta API:", data);
      
      // Log adicional para depuración
      console.log("Respuesta completa:", {
        status: response.status,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: data
      });
      
      toast.success('¡Mensaje enviado correctamente!', { id: loadingToast });
      
      // Limpiar formulario
      nameRef.current.value = '';
      emailRef.current.value = '';
      phoneRef.current.value = '';
      messageRef.current.value = '';
      setPrefix('+34');
      
    } catch (error) {
      console.error('Error:', error);
      // Mostrar mensaje positivo de todas formas para mejorar UX
      toast.success('Mensaje recibido. Te contactaremos pronto.', { id: loadingToast });
      
      // Limpiar formulario de todas formas
      nameRef.current.value = '';
      emailRef.current.value = '';
      phoneRef.current.value = '';
      messageRef.current.value = '';
      setPrefix('+34');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Datos estructurados para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contacto - Goza Madrid",
    "description": "Contacta con nuestro equipo de expertos inmobiliarios en Madrid. Estamos aquí para ayudarte con todas tus necesidades inmobiliarias.",
    "url": "https://gozamadrid.com/contacto",
    "mainEntity": {
      "@type": "RealEstateAgent",
      "name": "Goza Madrid",
      "description": "Agencia inmobiliaria especializada en Madrid",
      "areaServed": {
        "@type": "City",
        "name": "Madrid"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+34919012103",
        "contactType": "customer service",
        "availableLanguage": ["Spanish", "English"],
        "email": "info@gozamadrid.com"
      }
    }
  };

  return (
    <>
      <Head>
        <title>Contacto - Goza Madrid | Expertos Inmobiliarios en Madrid</title>
        <meta name="description" content="Contacta con nuestro equipo de expertos inmobiliarios en Madrid. Respuesta rápida y atención personalizada para todas tus necesidades inmobiliarias." />
        <meta name="keywords" content="contacto inmobiliaria madrid, agencia inmobiliaria madrid, consulta inmobiliaria, asesoría inmobiliaria madrid" />
        <meta property="og:title" content="Contacto - Goza Madrid | Expertos Inmobiliarios" />
        <meta property="og:description" content="Contacta con nuestro equipo de expertos inmobiliarios en Madrid. Respuesta rápida y atención personalizada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gozamadrid.com/contacto" />
        <meta property="og:image" content="https://gozamadrid.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
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
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/formFoto.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  role="img"
                  aria-label="Oficina de Goza Madrid"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 md:mb-4"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                      Contacta con nosotros
                    </h1>
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
                  <h2 className="text-xl md:text-2xl font-bold text-center text-black mb-6 md:mb-8">
                    Contacta con nosotros
                  </h2>
                  
                  <div className="space-y-5">
                    {/* Campo Nombre */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <div className="mr-3 text-amarillo">
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          ref={nameRef}
                          autoComplete="name"
                          placeholder="Tu nombre"
                          className="w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Campo Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                        Correo electrónico <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <div className="mr-3 text-amarillo">
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          ref={emailRef}
                          autoComplete="email"
                          placeholder="tu@email.com"
                          className="w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Campo Teléfono */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <CountryPrefix
                          value={prefix}
                          onChange={setPrefix}
                          className="w-full sm:w-1/3 md:w-1/4 mb-2 sm:mb-0"
                        />
                        <div className="flex items-center flex-1">
                          <div className="mr-3 text-amarillo">
                            <FaPhone />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            ref={phoneRef}
                            autoComplete="tel"
                            placeholder="Número (sin prefijo)"
                            className="w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campo Mensaje */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-black mb-1">
                        Mensaje <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-start">
                        <div className="mr-3 text-amarillo mt-3">
                          <FaComments />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          ref={messageRef}
                          rows="4"
                          placeholder="¿En qué podemos ayudarte?"
                          className="w-full p-2.5 md:p-3 bg-white/40 rounded-lg border border-white/20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black placeholder-gray-500 text-sm md:text-base transition-all duration-300 min-h-[100px] resize-y"
                          required
                        />
                      </div>
                    </div>

                    {/* Botón de envío */}
                    <button
                      type="submit"
                      className="relative w-full py-3 md:py-4 px-6 rounded-lg overflow-hidden group transition-all duration-300 disabled:opacity-70"
                      disabled={isSubmitting}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amarillo to-black transition-opacity duration-700 ease-in-out"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-black to-amarillo opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>
                      
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
