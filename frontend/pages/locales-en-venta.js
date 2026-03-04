import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEOMetadata from '../components/SEOMetadata';

// ─── Datos de los locales extraidos de las fichas PDF ───────────────────────
const locales = [
  {
    id: 'jorge-juan',
    nombre: 'Local Calle Jorge Juan',
    direccion: 'Calle Jorge Juan, Madrid',
    zona: 'Salamanca',
    tipo: 'Traspaso',
    precio: 'A convenir',
    alquiler: '9.000 €/mes',
    superficie: '240 m²',
    superficieDetalle: '157 m² planta calle + 75 m² sotano',
    aforo: '72 personas',
    licencia: 'Bar/Hosteleria (6am a 2am)',
    terraza: 'Si, 5 mesas',
    salidaHumos: null,
    descripcion:
      'Local en la Calle Jorge Juan, a una cuadra de la Calle Goya y a una cuadra de la Calle Alcala. Cuenta con salon, cocina en planta calle y banos y oficina en sotano. Terraza para 5 mesas. Ubicacion premium en el barrio de Salamanca.',
    destacados: ['Barrio Salamanca', 'Terraza', 'Licencia hosteleria', '240 m²'],
    imagen: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dr-fleming',
    nombre: 'Local Calle Dr. Fleming 51',
    direccion: 'Calle Dr. Fleming 51, Chamartin, Madrid',
    zona: 'Chamartin',
    tipo: 'Traspaso',
    precio: '150.000 €',
    alquiler: '4.000 €/mes',
    superficie: '110 m²',
    superficieDetalle: '110 m² en planta',
    aforo: '48 pax sala + 30 pax terraza',
    licencia: 'Bar Restaurante',
    terraza: 'Si',
    salidaHumos: 'Si',
    descripcion:
      'Local en traspaso en Chamartin con terraza y salida de humos. Licencia de Bar Restaurante. Zona residencial con gran afluencia. Interior reformado con ambiente moderno y acogedor.',
    destacados: ['Chamartin', 'Salida de humos', 'Terraza 30 pax', '110 m²'],
    imagen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'el-segoviano',
    nombre: 'Restaurante El Segoviano',
    direccion: 'Av. de la Ciudad de Barcelona, 108, Retiro, 28007 Madrid',
    zona: 'Retiro',
    tipo: 'Venta / Traspaso',
    precio: '2.000.000 € (Venta) / 280.000 € (Traspaso)',
    alquiler: '9.000 €/mes',
    superficie: '553,75 m²',
    superficieDetalle: '394,24 m² planta calle + 159,51 m² entreplanta',
    aforo: '164 personas',
    licencia: 'Bar-Restaurante',
    terraza: null,
    salidaHumos: 'Si',
    descripcion:
      'Restaurante en venta con ubicacion ideal, a 400 metros de la estacion de Atocha. Zona con alta actividad turistica y gastronomica. 3 puertas de acceso. Oportunidad unica por tamano y ubicacion.',
    destacados: ['Junto a Atocha', '553 m²', 'Aforo 164', 'Salida de humos'],
    imagen: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'perretxico',
    nombre: 'Local Calle Poeta Joan Maragall 16',
    direccion: 'Calle Poeta Joan Maragall 16, Madrid',
    zona: 'Chamartin',
    tipo: 'Traspaso',
    precio: '200.000 €',
    alquiler: '6.500 €/mes',
    superficie: '254 m²',
    superficieDetalle: '254 m² en planta',
    aforo: '50 personas',
    licencia: 'Hosteleria',
    terraza: 'Si, 6 mesas',
    salidaHumos: 'Si',
    descripcion:
      'Amplio local de 254 m² en planta con terraza de 6 mesas y salida de humos. Ideal para restaurante o negocio de hosteleria. Zona residencial de alto poder adquisitivo con buena afluencia peatonal.',
    destacados: ['254 m²', 'Terraza 6 mesas', 'Salida de humos', 'Aforo 50'],
    imagen: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kasanova',
    nombre: 'Restaurante Kasanova',
    direccion: 'Alcalde Sainz de Baranda 44, 28009 Madrid',
    zona: 'Retiro',
    tipo: 'Traspaso',
    precio: '175.000 €',
    alquiler: '4.500 €/mes',
    superficie: '130 m²',
    superficieDetalle: '130 m² planta calle',
    aforo: '43 pax + 56 pax terraza cerrada + 12 pax terraza abierta',
    licencia: 'Bar-Restaurante (desde 2007)',
    terraza: 'Si, 14 mesas cerrada + 4 mesas abierta',
    salidaHumos: 'Si',
    descripcion:
      'Local en traspaso proximo al parque del Buen Retiro y al Hospital Gregorio Maranon. Zona con alta actividad turistica y de ocio gastronomico. Contrato de alquiler de 10 anos. Terraza cerrada y abierta.',
    destacados: ['Junto al Retiro', 'Terraza cerrada', 'Contrato 10 anos', 'Salida de humos'],
    imagen: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  },
];

// ─── Componente de tarjeta de local ─────────────────────────────────────────
function LocalCard({ local, index, onContactar }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
    >
      {/* Imagen */}
      <div className="relative h-56 sm:h-64 overflow-hidden group">
        <img
          src={local.imagen}
          alt={local.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge zona */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          {local.zona}
        </div>
        {/* Badge tipo */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black text-xs font-bold px-3 py-1.5 rounded-full">
          {local.tipo}
        </div>
        {/* Overlay gradiente */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
        {/* Precio sobre imagen */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg max-w-[60%]">{local.nombre}</h3>
          <span className="text-yellow-400 font-bold text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg whitespace-nowrap">
            {local.precio}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        {/* Direccion */}
        <div className="flex items-start gap-2 mb-3 text-gray-600 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{local.direccion}</span>
        </div>

        {/* Datos principales en grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Superficie</p>
            <p className="text-sm font-bold text-gray-900">{local.superficie}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Aforo</p>
            <p className="text-sm font-bold text-gray-900">{local.aforo.split('+')[0].trim()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Alquiler</p>
            <p className="text-sm font-bold text-gray-900">{local.alquiler}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Licencia</p>
            <p className="text-sm font-bold text-gray-900 truncate" title={local.licencia}>{local.licencia.split('(')[0].trim()}</p>
          </div>
        </div>

        {/* Tags destacados */}
        <div className="flex flex-wrap gap-2 mb-4">
          {local.destacados.map((tag, i) => (
            <span key={i} className="bg-yellow-50 text-yellow-800 text-xs px-2.5 py-1 rounded-full border border-yellow-200 font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Descripcion expandible */}
        <div className="mb-4 flex-1">
          <p className={`text-gray-600 text-sm leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
            {local.descripcion}
          </p>
          {local.descripcion.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-yellow-700 text-xs font-semibold mt-1 hover:underline"
            >
              {expanded ? 'Ver menos' : 'Ver mas...'}
            </button>
          )}
        </div>

        {/* Detalles adicionales si esta expandido */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 space-y-2 text-sm"
          >
            {local.superficieDetalle && (
              <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
                <span>Distribucion:</span>
                <span className="font-medium text-gray-900">{local.superficieDetalle}</span>
              </div>
            )}
            {local.terraza && (
              <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
                <span>Terraza:</span>
                <span className="font-medium text-gray-900">{local.terraza}</span>
              </div>
            )}
            {local.salidaHumos && (
              <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
                <span>Salida de humos:</span>
                <span className="font-medium text-green-700">{local.salidaHumos}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Boton de contacto */}
        <button
          onClick={() => onContactar(local)}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] mt-auto"
        >
          Me interesa este local
        </button>
      </div>
    </motion.div>
  );
}

// ─── Formulario de contacto ─────────────────────────────────────────────────
function FormularioLocales({ localSeleccionado, onClearLocal }) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    localInteres: '',
    mensaje: '',
    aceptaTerminos: false,
  });

  // Actualizar local seleccionado en el form
  useEffect(() => {
    if (localSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        localInteres: localSeleccionado.nombre,
        mensaje: `Hola, estoy interesado/a en el local "${localSeleccionado.nombre}" ubicado en ${localSeleccionado.direccion}. Me gustaria recibir mas informacion y concertar una visita.`,
      }));
    }
  }, [localSeleccionado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.telefono || !formData.email) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }
    if (!formData.aceptaTerminos) {
      toast.error('Debe aceptar la politica de privacidad');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/contacto-locales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al enviar');
      toast.success('Solicitud enviada. Marta Lopez se pondra en contacto con usted.');
      setEnviado(true);
    } catch (error) {
      toast.error('Error al enviar. Intentelo de nuevo o llamenos directamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Solicitud enviada con exito</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Marta Lopez se pondra en contacto con usted en las proximas 24 horas para informarle sobre el local seleccionado.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <img
            src="/marta.jpeg"
            alt="Marta Lopez - Asesora Inmobiliaria"
            width={80}
            height={80}
            className="rounded-full object-cover border-4 border-yellow-500/30"
          />
          <div className="text-left">
            <p className="font-bold text-gray-900">Marta Lopez</p>
            <p className="text-gray-600 text-sm">Asesora Inmobiliaria</p>
            <a href="tel:+34608136529" className="text-yellow-700 text-sm font-semibold">+34 608 136 529</a>
          </div>
        </div>
        <button
          onClick={() => { setEnviado(false); setFormData({ nombre: '', telefono: '', email: '', localInteres: '', mensaje: '', aceptaTerminos: false }); onClearLocal(); }}
          className="px-6 py-2 rounded-full border border-yellow-600 text-yellow-700 hover:bg-yellow-50 transition-colors"
        >
          Consultar otro local
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Local seleccionado */}
      {localSeleccionado && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-yellow-700 font-medium uppercase tracking-wider">Local seleccionado</p>
            <p className="font-bold text-gray-900">{localSeleccionado.nombre}</p>
            <p className="text-sm text-gray-600">{localSeleccionado.direccion}</p>
          </div>
          <button
            type="button"
            onClick={() => { onClearLocal(); setFormData({ ...formData, localInteres: '', mensaje: '' }); }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Si no hay local seleccionado, selector */}
      {!localSeleccionado && (
        <div>
          <label htmlFor="localInteres" className="mb-2 block text-sm font-medium text-gray-900">
            Local que le interesa
          </label>
          <select
            id="localInteres"
            name="localInteres"
            value={formData.localInteres}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
          >
            <option value="">Seleccione un local...</option>
            {locales.map((l) => (
              <option key={l.id} value={l.nombre}>{l.nombre} - {l.direccion}</option>
            ))}
            <option value="Todos">Me interesan varios / Quiero informacion general</option>
          </select>
        </div>
      )}

      {/* Datos personales */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">Nombre completo *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
            placeholder="Su nombre"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-900">Telefono *</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
          placeholder="su.email@ejemplo.com"
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-2 block text-sm font-medium text-gray-900">Mensaje</label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
          placeholder="Cuentenos que busca..."
        />
      </div>

      {/* Terminos */}
      <div className="flex items-start">
        <input
          id="aceptaTerminos"
          name="aceptaTerminos"
          type="checkbox"
          checked={formData.aceptaTerminos}
          onChange={handleChange}
          className="h-4 w-4 mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
        />
        <label htmlFor="aceptaTerminos" className="ml-3 text-sm text-gray-700">
          Acepto la{' '}
          <Link href="/politica-privacidad" className="text-yellow-700 hover:underline">politica de privacidad</Link>. 
          Sus datos seran tratados con total confidencialidad. *
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : (
          'Solicitar informacion'
        )}
      </button>

      {/* CTA llamar */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">O si prefiere, llamenos directamente:</p>
        <a
          href="tel:+34608136529"
          className="inline-flex items-center gap-2 text-yellow-700 font-bold text-lg hover:text-yellow-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          +34 608 136 529
        </a>
      </div>
    </form>
  );
}

// ─── Pagina principal ───────────────────────────────────────────────────────
const LocalesEnVenta = () => {
  const [localSeleccionado, setLocalSeleccionado] = useState(null);
  const formRef = useRef(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactar = (local) => {
    setLocalSeleccionado(local);
    // Scroll al formulario
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <SEOMetadata
        title="Locales en Venta y Traspaso en Madrid | Goza Madrid Real Estate"
        description="Descubre los mejores locales comerciales en venta y traspaso en Madrid. Barrio de Salamanca, Chamartin, Retiro. Locales con licencia de hosteleria, terraza y salida de humos. Contacta con Marta Lopez."
        keywords="locales en venta Madrid, traspaso local Madrid, local hosteleria Madrid, restaurante en venta Madrid, Marta Lopez inmobiliaria"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
        ogImageAlt="Locales en venta en Madrid - Goza Madrid Real Estate"
        author="Marta Lopez - Goza Madrid"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* ═══ HEADER ═══ */}
        <header className="w-full">
          {/* Barra superior */}
          <div className="bg-gradient-to-r from-black via-black to-amarillo backdrop-blur-md py-3 px-4 shadow-xl border-b border-yellow-600/30">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="relative z-10">
                <div className="flex items-center" style={{ maxHeight: '8rem' }}>
                  <img
                    src="/logonuevo.png"
                    alt="Real Estate Goza Madrid"
                    width={150}
                    height={200}
                    style={{ maxHeight: '200px', width: 'auto' }}
                    loading="eager"
                  />
                </div>
              </Link>
              <a
                href="tel:+34608136529"
                className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">+34 608 136 529</span>
              </a>
            </div>
          </div>

          {/* Hero Banner */}
          <div
            className="relative flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[80vh] px-4 text-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1770&q=80)',
              backgroundAttachment: 'fixed',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

            {/* Decorativos */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-20 md:w-40 md:h-40 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 md:w-40 md:h-40 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl"></div>
            </div>

            <motion.div
              className="relative z-10 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-700/20 backdrop-blur-sm border border-yellow-500/40 rounded-full"
              >
                <span className="text-yellow-400 font-medium uppercase tracking-wider text-sm md:text-base">
                  Oportunidades Exclusivas
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block">Locales en</span>
                <span className="block">
                  <span className="text-yellow-500">Venta</span> y{' '}
                  <span className="text-yellow-500">Traspaso</span>
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2">en Madrid</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Seleccion de locales comerciales con licencia de hosteleria en las mejores zonas de Madrid.
                Salamanca, Chamartin, Retiro y mas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="#locales"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 px-8 py-4 text-lg font-bold text-black shadow-xl transition duration-300 hover:from-yellow-600 hover:to-yellow-800 border-2 border-yellow-400/30"
                >
                  Ver Locales Disponibles
                </motion.a>
                <motion.a
                  href="tel:+34608136529"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white border border-yellow-600/30 shadow-lg hover:bg-black transition duration-300"
                >
                  Llamar a Marta Lopez
                </motion.a>
              </div>
            </motion.div>

            {/* Flecha scroll */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </header>

        {/* ═══ SECCION: Por que invertir ═══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="py-16 px-4"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que invertir en <span className="text-yellow-600">locales en Madrid</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Madrid es una de las ciudades con mayor crecimiento gastronomico y turistico de Europa.
                Estos locales representan oportunidades unicas de inversion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  titulo: 'Ubicaciones Premium',
                  texto: 'Locales en Salamanca, Chamartin y Retiro. Las zonas con mayor demanda y afluencia de Madrid.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  titulo: 'Licencias en Regla',
                  texto: 'Todos los locales cuentan con licencia de actividad de hosteleria vigente. Salida de humos y terraza.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  titulo: 'Rentabilidad Asegurada',
                  texto: 'Locales con historial de facturacion y en zonas de alto transito. Inversiones desde 150.000 euros.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 flex items-center justify-center text-black">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.titulo}</h3>
                  <p className="text-gray-600">{item.texto}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══ SECCION: Locales ═══ */}
        <section id="locales" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Locales <span className="text-yellow-600">Disponibles</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Seleccione el local que mas le interese y contactenos para recibir toda la informacion detallada y concertar una visita.
              </p>
            </motion.div>

            {/* Grid de locales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locales.map((local, index) => (
                <LocalCard key={local.id} local={local} index={index} onContactar={handleContactar} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA Banner ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 py-10 px-4 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white"></div>
          </div>
          <div className="container mx-auto relative z-10">
            <h3 className="text-black text-2xl md:text-3xl font-bold mb-4">
              No encuentra lo que busca? Tenemos mas opciones
            </h3>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">
              Llame a Marta Lopez y cuentele que tipo de local necesita. Tenemos acceso a locales que no estan publicados.
            </p>
            <a
              href="tel:+34608136529"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Llamar ahora: +34 608 136 529
            </a>
          </div>
        </motion.div>

        {/* ═══ SECCION: Formulario de contacto ═══ */}
        <section ref={formRef} id="contacto" className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              {/* Decoracion fondo */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-yellow-500/10 to-transparent z-0"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-500/10 to-transparent z-0"></div>

              <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Contacte con Nosotros
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 md:mx-0 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600 max-w-md">
                    Marta Lopez le atendera personalmente para resolver todas sus dudas sobre los locales disponibles.
                  </p>
                </div>
                <div className="relative rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-xl flex-shrink-0">
                  <img
                    src="/marta.jpeg"
                    alt="Marta Lopez - Asesora Inmobiliaria"
                    width={150}
                    height={150}
                    className="object-cover w-[150px] h-[150px]"
                  />
                </div>
              </div>

              <div className="relative z-10">
                <FormularioLocales
                  localSeleccionado={localSeleccionado}
                  onClearLocal={() => setLocalSeleccionado(null)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECCION: Sobre Marta ═══ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="py-16 px-4 bg-gray-50"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-yellow-500/20 shadow-xl">
                    <img
                      src="/marta.jpeg"
                      alt="Marta Lopez - Asesora Inmobiliaria Goza Madrid"
                      width={200}
                      height={200}
                      className="object-cover w-[200px] h-[200px]"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Marta Lopez</h2>
                  <p className="text-yellow-700 font-semibold mb-4">Asesora Inmobiliaria | Goza Madrid Real Estate</p>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Con amplia experiencia en el sector inmobiliario de Madrid, Marta le acompanara en todo el proceso de adquisicion de su local.
                    Desde la primera visita hasta la firma, le asesorara para que tome la mejor decision de inversion.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="tel:+34608136529"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-600 hover:to-yellow-800 transition-all shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llamar ahora
                    </a>
                    <a
                      href="mailto:marta@gozamadrid.com"
                      className="inline-flex items-center gap-2 border-2 border-yellow-600 text-yellow-700 font-bold px-6 py-3 rounded-full hover:bg-yellow-50 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══ CTA Final ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 px-4 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black z-0"></div>
          <div className="absolute inset-0 opacity-5 z-0">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
          </div>

          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="inline-block mb-6 px-4 py-1 border border-yellow-600/30 rounded-full">
              <span className="text-yellow-500 font-medium uppercase tracking-wider text-sm">Asesoramiento Personalizado</span>
            </div>
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Encuentre el local perfecto para su negocio en Madrid
            </h2>
            <p className="text-gray-300 mb-8 text-lg max-w-3xl mx-auto">
              Marta Lopez le acompanara en todo el proceso. Desde la busqueda hasta la firma del contrato.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contacto"
                className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-8 py-4 rounded-full font-bold hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105 text-lg"
              >
                Solicitar Informacion
              </a>
              <a
                href="tel:+34608136529"
                className="inline-block bg-transparent text-yellow-500 border border-yellow-600/30 px-8 py-4 rounded-full font-semibold hover:bg-yellow-600/10 transition-all duration-300 text-lg"
              >
                Llamar: +34 608 136 529
              </a>
            </div>
          </div>
        </motion.div>

        {/* ═══ FOOTER ═══ */}
        <footer className="bg-gradient-to-b from-black via-gray-900 to-amarillo text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-white-700 rounded-full"></div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="mb-6 md:mb-0 text-center md:text-left text-white">
                <Link href="/" className="relative z-10">
                  <div className="flex items-center justify-center md:justify-start" style={{ maxHeight: '8rem' }}>
                    <img
                      src="/logonuevo.png"
                      alt="Real Estate Goza Madrid"
                      width={150}
                      height={200}
                      style={{ maxHeight: '200px', width: 'auto' }}
                      loading="lazy"
                    />
                  </div>
                </Link>
                <p className="text-sm text-white max-w-md leading-relaxed mt-4">
                  Locales comerciales en venta y traspaso en las mejores zonas de Madrid. Asesoramiento profesional y personalizado con Marta Lopez.
                </p>
              </div>
              <div className="text-center md:text-right">
                <a
                  href="#contacto"
                  className="inline-block mb-6 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  Solicitar Informacion
                </a>
                <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
                  <Link href="/aviso-legal" className="text-sm text-white hover:text-gray-400 transition-colors">Aviso Legal</Link>
                  <Link href="/politica-privacidad" className="text-sm text-white hover:text-gray-400 transition-colors">Politica de Privacidad</Link>
                  <Link href="/politica-cookies" className="text-sm text-white hover:text-gray-400 transition-colors">Politica de Cookies</Link>
                </div>
                <p className="text-xs text-white">
                  &copy; {new Date().getFullYear()} Real Estate Goza Madrid. Todos los derechos reservados.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-yellow-700/30 text-center text-sm text-white">
              <p>Calle de Azulinas, 28036 Madrid | Email: marta@gozamadrid.com | Tel: +34 608 136 529</p>
            </div>
          </div>
        </footer>

        {/* ═══ Boton flotante ═══ */}
        <AnimatePresence>
          {showFloatingCTA && (
            <motion.a
              href="#contacto"
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-5 py-3 rounded-full shadow-xl flex items-center space-x-2 border-2 border-yellow-400/30"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-bold text-sm">Contactar</span>
            </motion.a>
          )}
        </AnimatePresence>

        {/* ═══ WhatsApp flotante ═══ */}
        <motion.a
          href="https://wa.me/34608136529?text=Hola%2C%20estoy%20interesado%2Fa%20en%20los%20locales%20en%20venta%20en%20Madrid.%20Me%20gustaria%20recibir%20mas%20informacion."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 left-8 z-40 bg-green-500 text-white p-3 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6" fill="white">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </motion.a>
      </div>
    </>
  );
};

// Layout personalizado sin header/footer global
LocalesEnVenta.getLayout = function getLayout(page) {
  return <>{page}</>;
};

export default LocalesEnVenta;
