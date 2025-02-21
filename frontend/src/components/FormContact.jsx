import { useState, useEffect } from "react";



import CountryPrefix from "./CountryPrefix";
import AnimatedOnScroll from "./AnimatedScroll";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefix, setPrefix] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  

  // Estado para manejar errores de validación y animación
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
  });

  // Estado para manejar la animación de shake
  const [shake, setShake] = useState({
    name: false,
    email: false,
    phone: false,
  });

  // Agregar el prefijo al número de teléfono automáticamente
  useEffect(() => {
    if (prefix) {
      setPhone(prevPhone => prevPhone.replace(prefix, "")); // quitar el prefijo anterior
    }
  }, [prefix]);

  const completePhone = prefix + phone;

  // Validación del formulario usando useState con shake
  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      email: !email.trim(),
      phone: !phone.trim(),
    };

    setErrors(newErrors);

    // Aplicar animación de shake a los campos con error
    setShake(newErrors);

    // Quitar la clase de shake después de la animación
    setTimeout(() => {
      setShake({
        name: false,
        email: false,
        phone: false,
      });
    }, 500); // Duración de la animación

    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Por favor corrige los campos marcados en rojo.');
      return;
    }

    try {
      const newUser = {
        name,
        email,
        phone: completePhone,
      };

      const userData = await createUser(newUser); // Enviar a la API
      console.log("Usuario creado:", userData);

      setErrorMessage('');
      

    } catch (err) {
      console.error('Error al registrar al usuario', err);
      setErrorMessage('Hubo un problema al registrar al usuario. Intenta de nuevo más tarde.');
    }
  };

  return (
    <AnimatedOnScroll>
    <main>
      <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen">
        {/* Formulario */}
        <div className="w-full flex justify-center items-center order-1 lg:order-1">
          <form className="space-y-4 sm:space-y-6 border-2 p-6 sm:p-8 lg:p-14 border-gray-400 w-full max-w-xl" onSubmit={handleSubmit}>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold">Contáctenos</h2>
            </div>

            {/* Grid de 5 columnas para móvil y tablet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre - 2 columnas */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre"
                  className={`mt-1 block w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm ${shake.name ? 'shake' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm">El nombre es obligatorio</p>}
              </div>

              {/* Email - 2 columnas */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`mt-1 block w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm ${shake.email ? 'shake' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm">El email es obligatorio</p>}
              </div>

              {/* País - 1 columna */}
              <div className="sm:col-span-1">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">País:</label>
                <CountryPrefix onChange={prefix => setPrefix(prefix)} />
              </div>

              {/* Teléfono - 1 columna */}
              <div className="sm:col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Teléfono"
                  className={`mt-1 block w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm ${shake.phone ? 'shake' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-sm">El teléfono es obligatorio</p>}
              </div>

              {/* Asunto - 2 columnas */}
              <div className="sm:col-span-2">
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700">Asunto:</label>
                <textarea
                  id="asunto"
                  name="asunto"
                  placeholder="Escríbenos tus inquietudes"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm"
                  rows={4}
                />
              </div>
            </div>

            {/* Botón centrado */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
                    px-4 sm:px-6 lg:px-8 
                    py-2 sm:py-2.5 lg:py-3 
                    transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
                    max-w-[90%] sm:max-w-[80%] lg:max-w-none"
              >
                <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                    Enviar
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
              </button>
            </div>
          </form>
        </div>

        {/* Imagen */}
        <div className="w-full flex justify-center items-center p-4 sm:p-6 order-2 lg:order-2">
          <img 
            src="/formFoto.jpeg" 
            alt="Form Image" 
            className="rounded-full shadow-md w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Estilos para la animación de shake */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
          .shake {
            animation: shake 0.3s ease-in-out;
          }
        `}
      </style>
    </main>
    </AnimatedOnScroll>
  );
};

export default RegisterForm;
