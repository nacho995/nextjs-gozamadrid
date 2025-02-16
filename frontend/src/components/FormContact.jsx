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
      <div className="grid grid-cols-2 min-h-screen">
        <div className="col-span-1 flex justify-center items-center">
          <form className="space-y-6 border-2 p-14 border-gray-400 w-full max-w-md" onSubmit={handleSubmit}>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <div className="text-left">
              <h2 className="text-sm sm:text-md lg:text-2xl font-bold">Contáctenos</h2>
            </div>
            <div className="flex flex-col space-y-4">
              <div>
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`mt-1 block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm ${shake.email ? 'shake' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm">El email es obligatorio</p>}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">País:</label>
                <CountryPrefix onChange={prefix => setPrefix(prefix)} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Número de teléfono:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Teléfono"
                  className={`mt-1 block w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amarillo-500 focus:border-amarillo-500 sm:text-sm ${shake.phone ? 'shake' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-sm">El teléfono es obligatorio</p>}
              </div>
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700">Asunto:</label>
                <textarea
                  id="asunto"
                  name="asunto"
                  placeholder="Escríbenos tus inquietudes"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-1/2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-amarillo hover:bg-black hover:text-white  transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
        <div className="col-span-1 flex justify-start items-center">
          <img src="/formFoto.jpeg" alt="Form Image" className="rounded-full shadow-md" />
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
