"use client";
import { useState, useEffect } from "react";
import CountryPrefix from "./CountryPrefix";

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [asunto, setAsunto] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const inputs = document.querySelectorAll('input');
      const handleInput = (event) => {
        if (event.target.value.trim() !== '') {
          event.target.style.borderColor = 'gray';
        }
      };
    
      inputs.forEach(input => {
        input.addEventListener('input', handleInput);
      });
    
      // Cleanup para evitar fugas de memoria
      return () => {
        inputs.forEach(input => {
          input.removeEventListener('input', handleInput);
        });
      };
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const shakeAnimation = `
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .shake {
          animation: shake 0.5s;
        }
      `;

      const styleSheet = document.createElement("style");
      styleSheet.innerText = shakeAnimation;
      document.head.appendChild(styleSheet);

      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('animationend', () => {
          input.classList.remove('shake');
        });
      });
    }
  }, []);

  const validateForm = () => {
    const inputs = document.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        input.classList.add('shake');
        input.style.borderColor = 'red';
        isValid = false;
      } else {
        input.classList.remove('shake');
        input.style.borderColor = 'gray';
      }
    });

    return isValid;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMessage('Por favor corrige los campos marcados en rojo.');
      return;
    }
    setErrorMessage('');
  };

  return (
    <main>
      <div className="grid justify-items-center grid-cols-2 mt-[-15%] ml-48 mb-[5%] min-h-fit">
        <form className="rounded-lg space-y-6 border-2 p-14 border-gray-300 w-[60%]" onSubmit={onSubmit} style={{ paddingLeft: '10%', paddingRight: '10%' }}>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="text-left">
            <h2 className="text-2xl font-bold">Contáctenos</h2>
          </div>
          <div className="flex flex-row items-center space-x-8">
            <div className="w-1/3" style={{ marginLeft: '10%' }}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre:</label>
              <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none
                focus:ring-amarillo focus:border-amarillo sm:text-sm" />
            </div>
            <div className="w-1/3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
              <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
                className="mt-1 block w-full px-4 py-3 border border-gray-300
                rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm" />
            </div>
          </div>
          <div>
            <div className="flex flex-row space-x-8">
              <div className="w-66" style={{ marginTop: '5%' }}>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">País:</label>
                <CountryPrefix />
              </div>
              <div style={{ marginTop: '5%' }}>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Número de teléfono:</label>
                <input type="tel" id="phone" name="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none
                  focus:ring-amarillo focus:border-amarillo sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="text-left">
            <label className="" htmlFor="asunto">
              ¿En qué podemos ayudarte?:
            </label>
            <textarea name="asunto" id="asunto" value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Escríbenos..."
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none
              focus:ring-amarillo focus:border-amarillo sm:text-sm"></textarea>
            <div className="flex justify-center" style={{ marginTop: '10%' }}>
              <button type="submit"
                className="mt-4 w-1/4 inline-flex justify-center py-1 px-2 border border-transparent 
                shadow-sm text-sm font-medium rounded-md text-black bg-amarillo hover:text-amarillo hover:bg-black transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-2">Send</button>
            </div>
          </div>
        </form>
        <div className="flex justify-items-center mt-8 mr-48">
          <img src="/formFoto.jpeg" alt="Form Image" className="rounded-full shadow-md" />
        </div>
      </div>
    </main>
  );
};

export default Form;
