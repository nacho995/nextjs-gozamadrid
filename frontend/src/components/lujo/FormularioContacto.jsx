import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';

function FormularioContacto() {
  // Estado para el wizard
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Opciones para los selectores interactivos
  const tiposPropiedades = ['Piso', 'Chalet', 'Ático', 'Villa', 'Dúplex', 'Otro'];
  const rangosPrecios = ['Menos de 500.000€', '500.000€ - 800.000€', '800.000€ - 1.200.000€', '1.200.000€ - 2.000.000€', 'Más de 2.000.000€'];
  const zonasMadrid = ['Salamanca', 'Chamberí', 'Retiro', 'Chamartín', 'Centro', 'Arturo Soria', 'La Moraleja', 'Pozuelo', 'Otra'];
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipoPropiedad: '',
    zonaPropiedad: '',
    rangoValor: '',
    mensaje: '',
    aceptaTerminos: false
  });
  
  // Manejador para cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Manejador para opciones seleccionables
  const handleOptionSelect = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Manejadores para el wizard
  const nextStep = () => {
    if (step === 1 && !formData.tipoPropiedad) {
      toast.error('Por favor, seleccione un tipo de propiedad');
      return;
    }
    if (step === 2 && !formData.zonaPropiedad) {
      toast.error('Por favor, seleccione una zona');
      return;
    }
    if (step === 3 && !formData.rangoValor) {
      toast.error('Por favor, seleccione un rango de valor');
      return;
    }
    
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.aceptaTerminos) {
      toast.error('Debe aceptar la política de privacidad para continuar');
      return;
    }
    
    try {
      setLoading(true);
      
      // Enviar los datos al endpoint de API
      const response = await fetch('/api/enviar-contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el formulario');
      }
      
      toast.success('¡Solicitud enviada con éxito! Marta se pondrá en contacto con usted a la mayor brevedad.');
      
      // Resetear el formulario y volver al paso 1
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        tipoPropiedad: '',
        zonaPropiedad: '',
        rangoValor: '',
        mensaje: '',
        aceptaTerminos: false
      });
      
      setStep(6); // Paso de éxito
      
    } catch (error) {
      toast.error('Ha ocurrido un error al enviar su solicitud. Por favor, inténtelo de nuevo.');
      console.error('Error al enviar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Variantes para animaciones
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-xl relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-yellow-500/10 to-transparent z-0"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-500/10 to-transparent z-0"></div>
          
          <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="font-serif text-3xl font-bold text-black md:text-4xl mb-4">
                Valoración Personalizada
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 md:mx-0 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-800 max-w-md">
                Complete estos sencillos pasos y Marta se pondrá en contacto con usted personalmente en menos de 24 horas
              </p>
            </div>
            
            <div className="relative rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-xl">
              <Image 
                src="/marta.jpeg" 
                alt="Marta Goza - Asesora Inmobiliaria Premium" 
                width={180} 
                height={180}
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Indicador de pasos */}
          <div className="relative z-10 flex justify-center mb-8">
            <div className="flex items-center w-full max-w-3xl">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className="relative flex items-center justify-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= stepNumber ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {stepNumber}
                    </div>
                    {step > stepNumber && (
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  {stepNumber < 5 && (
                    <div 
                      className={`flex-1 h-1 mx-2 transition-all duration-300 ${step > stepNumber ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' : 'bg-gray-200'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <form className="relative z-10">
            <AnimatePresence mode="wait">
              {/* Paso 1: Seleccionar tipo de propiedad */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¿Qué tipo de propiedad desea valorar?</h3>
                    <p className="text-gray-600">Seleccione el tipo de inmueble que mejor describe su propiedad</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tiposPropiedades.map((tipo) => (
                      <div 
                        key={tipo} 
                        onClick={() => handleOptionSelect('tipoPropiedad', tipo)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-32 ${formData.tipoPropiedad === tipo ? 'border-yellow-600 bg-yellow-50 shadow-md' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'}`}
                      >
                        <div className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center ${formData.tipoPropiedad === tipo ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' : 'bg-gray-100'}`}>
                          {tipo === 'Piso' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {tipo === 'Chalet' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {tipo === 'Ático' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
                            </svg>
                          )}
                          {tipo === 'Villa' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {tipo === 'Dúplex' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {tipo === 'Otro' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium ${formData.tipoPropiedad === tipo ? 'text-yellow-800' : 'text-gray-800'}`}>{tipo}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Paso 2: Seleccionar zona */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¿En qué zona está ubicada su propiedad?</h3>
                    <p className="text-gray-600">Seleccione la ubicación para obtener una valoración más precisa</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {zonasMadrid.map((zona) => (
                      <div 
                        key={zona} 
                        onClick={() => handleOptionSelect('zonaPropiedad', zona)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-32 ${formData.zonaPropiedad === zona ? 'border-yellow-600 bg-yellow-50 shadow-md' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'}`}
                      >
                        <div className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center ${formData.zonaPropiedad === zona ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' : 'bg-gray-100'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className={`font-medium ${formData.zonaPropiedad === zona ? 'text-yellow-800' : 'text-gray-800'}`}>{zona}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Paso 3: Seleccionar rango de valor */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¿En qué rango de precio estima su propiedad?</h3>
                    <p className="text-gray-600">Seleccione el rango que considere más cercano al valor de su inmueble</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rangosPrecios.map((rango) => (
                      <div 
                        key={rango} 
                        onClick={() => handleOptionSelect('rangoValor', rango)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-24 ${formData.rangoValor === rango ? 'border-yellow-600 bg-yellow-50 shadow-md' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'}`}
                      >
                        <div className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center ${formData.rangoValor === rango ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' : 'bg-gray-100'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className={`font-medium ${formData.rangoValor === rango ? 'text-yellow-800' : 'text-gray-800'}`}>{rango}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Paso 4: Datos de contacto */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Datos de contacto</h3>
                    <p className="text-gray-600">Para que Marta pueda ponerse en contacto con usted personalmente</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-yellow-600"
                        placeholder="Introduzca su nombre"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-900">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-yellow-600"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-yellow-600"
                      placeholder="su.email@ejemplo.com"
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Paso 5: Mensaje y Términos */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Detalles adicionales</h3>
                    <p className="text-gray-600">Cualquier información extra que pueda ser útil para la valoración</p>
                  </div>
                  
                  <div>
                    <label htmlFor="mensaje" className="mb-2 block text-sm font-medium text-gray-900">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-yellow-600"
                      placeholder="Detalles adicionales sobre su propiedad..."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="aceptaTerminos"
                        name="aceptaTerminos"
                        type="checkbox"
                        checked={formData.aceptaTerminos}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="aceptaTerminos" className="font-medium text-gray-900">
                        Acepto la <a href="/privacidad" className="text-yellow-600 hover:underline">política de privacidad</a> *
                      </label>
                      <p className="text-gray-700">
                        Sus datos serán tratados con la máxima confidencialidad según la legislación vigente.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Paso 6: Éxito */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  variants={fadeInUp}
                  className="space-y-6 text-center py-8"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900">¡Solicitud enviada con éxito!</h3>
                  
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-600 mb-6">
                      Marta se pondrá en contacto con usted personalmente en menos de 24 horas para ofrecerle una valoración precisa de su propiedad.
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 mt-8">
                      <Image 
                        src="/marta.jpeg" 
                        alt="Marta Goza - Asesora Inmobiliaria Premium" 
                        width={80} 
                        height={80}
                        className="rounded-full object-cover border-4 border-yellow-500/30"
                      />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Marta Goza</p>
                        <p className="text-gray-600 text-sm">Asesora Inmobiliaria Premium</p>
                        <p className="text-yellow-700 text-sm">+34 919 012 103</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setStep(1)}
                      className="mt-8 px-6 py-2 rounded-md border border-yellow-600 text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </motion.div>
              )}
            
            </AnimatePresence>
            
            {/* Navegación del wizard */}
            {step < 6 && (
              <div className="flex justify-between items-center mt-10">
                {step > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </motion.button>
                ) : <div></div>}
                
                {step < 5 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-700 text-black shadow-md hover:from-yellow-600 hover:to-yellow-800 transition-colors flex items-center"
                  >
                    Siguiente
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !formData.aceptaTerminos}
                    className="px-8 py-3 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-700 text-black shadow-lg transition duration-300 hover:from-yellow-500 hover:to-yellow-800 disabled:cursor-not-allowed disabled:opacity-70 flex items-center"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="mr-2 h-5 w-5 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <>
                        Solicitar Valoración
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default FormularioContacto;
