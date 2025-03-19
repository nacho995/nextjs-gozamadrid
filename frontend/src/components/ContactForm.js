import React, { useState } from 'react';
import { sendEmail } from '../pages/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import CountrySelect from './CountrySelect';

const ContactForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    prefix: '+34',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePrefixChange = (prefix) => {
    setFormData(prev => ({
      ...prev,
      prefix
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Usar la configuración global para la URL de la API
      const apiUrl = window.appConfig?.apiUrl || 'https://gozamadrid-env.eba-dwhnvgbt.eu-west-3.elasticbeanstalk.com';
      const url = `${apiUrl}/api/contact`;
      
      console.log('Enviando formulario a:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo enviar el formulario'}`);
      }
      
      // Intentar parsear la respuesta como JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Respuesta no JSON:', text);
        data = { message: 'Formulario enviado correctamente' };
      }
      
      // Resetear el formulario y mostrar mensaje de éxito
      setFormData({
        name: '',
        email: '',
        phone: '',
        prefix: '+34',
        message: ''
      });
      setSuccess(data.message || 'Mensaje enviado correctamente');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error al enviar el formulario:', err);
      setError(err.message || 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
          required
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono *
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <CountrySelect 
            selectedPrefix={formData.prefix} 
            onPrefixChange={handlePrefixChange} 
          />
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
            required
          />
        </div>
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm; 