import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import AnimatedOnScroll from "./AnimatedScroll";
import Head from 'next/head';
import Image from "next/legacy/image";
import { 
  FaChevronDown, 
  FaExternalLinkAlt, 
  FaHandshake, 
  FaUsers, 
  FaAward,
  FaStar,
  FaShieldAlt,
  FaCertificate,
  FaRocket,
  FaGem,
  FaInfinity
} from "react-icons/fa";

// Hook personalizado para parallax
const useParallax = (value, distance) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

// Hook para animaciones de entrada escalonadas
const useStaggeredAnimation = (delay = 0) => {
  return {
    initial: { opacity: 0, y: 60, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };
};

// Componente para datos estructurados de la organización
const OrganizationStructuredData = () => {
  try {
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgency",
      "name": "Goza Madrid",
      "image": "https://realestategozamadrid.com/logo.png",
      "url": "https://realestategozamadrid.com",
      "description": "Agencia inmobiliaria especializada en Madrid, ofreciendo servicios de compra, venta y alquiler de propiedades",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Nueva España",
        "addressLocality": "Madrid",
        "postalCode": "28009",
        "addressCountry": "ES"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "40.423399",
        "longitude": "-3.676840"
      },
      "telephone": "+34 919 012 103",
      "email": "marta@gozamadrid.com",
      "sameAs": [
        "https://www.facebook.com/MBLP66/",
        "https://www.instagram.com/gozamadrid54/",
        "https://x.com/Marta12857571",
        "https://www.linkedin.com/in/marta-l%C3%B3pez-55516099/",
        "https://www.youtube.com/@martalopez1039"
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
    );
  } catch (error) {
    console.error("Error generando datos estructurados para la organización:", error);
    return null;
  }
};

// Componente para datos estructurados de la red de colaboradores
const PartnersStructuredData = ({ partners }) => {
  try {
    const limitedPartners = partners.slice(0, 5);
    
    const partnersData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GozaMadrid - Acuerdos y Convenios",
      "description": "Red de colaboradores estratégicos en el sector inmobiliario y servicios relacionados",
      "url": "https://realestategozamadrid.com/acuerdos",
      "image": "https://realestategozamadrid.com/acuerdosyconvenios.jpg",
      "member": limitedPartners.map(partner => ({
        "@type": "Organization",
        "name": partner.name,
        "image": `https://realestategozamadrid.com${partner.logo}`,
        "description": partner.shortDescription
      })),
      "areaServed": [
        {
          "@type": "City",
          "name": "Madrid"
        }
      ],
      "knowsAbout": [
        "Servicios inmobiliarios",
        "Hipotecas",
        "Reformas",
        "Eficiencia energética",
        "Garantía de alquiler"
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(partnersData)
        }}
      />
    );
  } catch (error) {
    console.error("Error generando datos estructurados para colaboradores:", error);
    return null;
  }
};

// Componente de partículas flotantes
const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (dimensions.width === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Componente de tarjeta premium con micro-interacciones
function PremiumPartnerCard({ partner, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 100, 
      rotateX: -15,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -20,
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Inmobiliaria": <FaRocket />,
      "Garantías": <FaShieldAlt />,
      "Gestoría": <FaCertificate />,
      "Inversión": <FaGem />,
      "Hipotecas": <FaInfinity />,
      "Energía": <FaStar />,
      "Seguros": <FaShieldAlt />,
      "Organización": <FaUsers />,
      "Reformas": <FaRocket />,
      "Decoración": <FaGem />,
      "Asistencia": <FaHandshake />
    };
    return icons[category] || <FaStar />;
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      "Inmobiliaria": "from-yellow-500 to-yellow-600",
      "Garantías": "from-yellow-600 to-amber-600",
      "Gestoría": "from-amber-500 to-yellow-500",
      "Inversión": "from-yellow-400 to-amber-500",
      "Hipotecas": "from-amber-600 to-yellow-600",
      "Energía": "from-yellow-500 to-orange-500",
      "Seguros": "from-yellow-600 to-amber-700",
      "Organización": "from-amber-500 to-orange-500",
      "Reformas": "from-yellow-400 to-yellow-500",
      "Decoración": "from-amber-400 to-yellow-400",
      "Asistencia": "from-yellow-500 to-amber-600"
    };
    return gradients[category] || "from-yellow-500 to-amber-600";
  };

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      className="group relative perspective-1000"
      itemScope
      itemType="https://schema.org/Organization"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        variants={hoverVariants}
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden border border-white/20 transform-gpu"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
        }}
      >
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Header con logo y efectos */}
        <div className={`relative h-40 bg-gradient-to-br ${getCategoryGradient(partner.category)} flex items-center justify-center p-6 overflow-hidden`}>
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 50%, white 2px, transparent 2px)`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          <motion.div 
            className="relative z-10"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
              <Image
                src={partner.logo}
                alt={partner.alt}
                layout="fill"
                objectFit="contain"
                className="transition-transform duration-300 p-2"
                itemProp="logo"
              />
            </div>
          </motion.div>
          
          {/* Badge de categoría con icono */}
          <motion.div 
            className="absolute top-4 right-4"
            whileHover={{ scale: 1.1 }}
          >
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center space-x-2">
              <span className="text-sm">{getCategoryIcon(partner.category)}</span>
              <span>{partner.category}</span>
            </div>
          </motion.div>

          {/* Rating visual */}
          <div className="absolute bottom-4 left-4">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                >
                  <FaStar className="text-yellow-300 text-sm drop-shadow-lg" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-8">
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-4 text-center"
            itemProp="name"
            whileHover={{ scale: 1.05 }}
          >
            {partner.name}
          </motion.h3>
          
          <p 
            className="text-gray-600 text-sm leading-relaxed mb-6 text-center"
            itemProp="description"
          >
            {partner.shortDescription}
          </p>

          {/* Indicadores de calidad */}
          <div className="flex justify-center space-x-4 mb-6">
            <motion.div 
              className="flex items-center space-x-1 text-xs text-gray-500"
              whileHover={{ scale: 1.1 }}
            >
              <FaCertificate className="text-green-500" />
              <span>Certificado</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-xs text-gray-500"
              whileHover={{ scale: 1.1 }}
            >
              <FaShieldAlt className="text-blue-500" />
              <span>Confiable</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-xs text-gray-500"
              whileHover={{ scale: 1.1 }}
            >
              <FaAward className="text-yellow-500" />
              <span>Premium</span>
            </motion.div>
          </div>

          {/* Botón expandir mejorado */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full flex items-center justify-center space-x-3 bg-gradient-to-r ${getCategoryGradient(partner.category)} hover:shadow-2xl text-white font-bold py-4 px-6 rounded-2xl transition-all duration-500 shadow-xl relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">{isExpanded ? 'Ocultar detalles' : 'Descubrir más'}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative z-10"
            >
              <FaChevronDown className="w-5 h-5" />
            </motion.div>
            
            {/* Efecto de ondas */}
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 1 }}
              whileTap={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>

          {/* Panel expandible premium */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="pt-8 mt-6 border-t border-gray-100">
                  <motion.p 
                    className="text-gray-700 text-sm leading-relaxed mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {partner.fullDescription}
                  </motion.p>
                  
                  {/* Servicios destacados premium */}
                  {partner.services && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaAward className="text-yellow-500 mr-3 text-xl" />
                        Servicios Especializados
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {partner.services.map((service, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 + 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 text-xs font-medium px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center border border-gray-200"
                          >
                            {service}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.article>
  );
}

// Componente principal mejorado
export default function Agreements() {
  const { scrollYProgress } = useScroll();
  const y = useParallax(scrollYProgress, 300);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  const partners = [
    {
      name: "eXp Realty",
      logo: "/exprealty.png",
      category: "Inmobiliaria",
      shortDescription: "Red inmobiliaria internacional con más de 89.000 agentes y tecnología de vanguardia.",
      fullDescription: "eXp Realty es una innovadora inmobiliaria internacional que revoluciona el sector inmobiliario. Como parte de esta red global, ofrecemos servicios integrales de compra, venta y alquiler de propiedades, respaldados por tecnología de vanguardia y un equipo de más de 89.000 agentes en todo el mundo. Nuestra plataforma virtual única permite brindar un servicio personalizado y eficiente, garantizando las mejores oportunidades inmobiliarias para nuestros clientes.",
      services: ["Compra-venta", "Alquiler", "Tecnología inmobiliaria", "Red global"],
      alt: "Logo de eXp Realty - Inmobiliaria Internacional"
    },
    {
      name: "Advancing",
      logo: "/advan.png",
      category: "Garantías",
      shortDescription: "Garantía de renta para propietarios con pago asegurado el día 6 de cada mes.",
      fullDescription: "Somos la principal opción de garantía de renta para propietarios de viviendas en alquiler. Te ofrecemos tranquilidad absoluta en el alquiler de tu inmueble, ya que te garantizamos el pago de tu renta el día 6 de cada mes pase lo que pase. Realizamos la gestión de cobro, retrasos e impagos hasta el desahucio.",
      services: ["Garantía de renta", "Gestión de cobros", "Protección impagos", "Desahucios"],
      alt: "Logo de Advancing - Garantía de Alquiler"
    },
    {
      name: "Abarca",
      logo: "/abarca.png",
      category: "Gestoría",
      shortDescription: "Gestoría especializada en servicios administrativos para empresas y autónomos.",
      fullDescription: "Empresa de gestoría especializada en ofrecer servicios integrales de administración tanto para empresas como para autónomos. Nos dedicamos a facilitar la gestión administrativa de tu negocio, brindando soluciones efectivas y personalizadas para satisfacer las necesidades específicas de cada cliente.",
      services: ["Gestión fiscal", "Contabilidad", "Nóminas", "Asesoría laboral"],
      alt: "Logo de Abarca - Gestoría Integral"
    },
    {
      name: "Ares Capital",
      logo: "/arescapital.png",
      category: "Inversión",
      shortDescription: "Especialistas en inversión inmobiliaria y locales comerciales a nivel nacional.",
      fullDescription: "El mercado de Inversión y el sector de locales comerciales es nuestra especialidad a nivel nacional con un enfoque adaptado a perfiles institucionales y privados. GozaMadrid va de la mano trabajando con Ares Capital desarrollando principalmente en dos líneas de negocio; dar servicio a Inversores, Family Office, Propietarios y Empresas en operaciones de compra-venta y representar a las firmas más exclusivas del sector Retail.",
      services: ["Inversión inmobiliaria", "Locales comerciales", "Family Office", "Retail"],
      alt: "Logo de Ares Capital - Inversión Inmobiliaria"
    },
    {
      name: "Duplo",
      logo: "/duplo.png",
      category: "Hipotecas",
      shortDescription: "Facilitamos la obtención de hipotecas con transparencia y servicio humano.",
      fullDescription: "En nuestra empresa, nos esforzamos por facilitar la obtención de tu hipoteca, comprendiendo que este proceso puede generar nerviosismo y tensión. Por ello, nuestro enfoque principal es garantizar tu tranquilidad en todo momento. Valoramos la transparencia y la empatía en nuestra labor, buscando siempre brindarte un servicio humano y cercano.",
      services: ["Hipotecas", "Asesoramiento financiero", "Gestión bancaria", "Transparencia"],
      alt: "Logo de Duplo - Servicios Hipotecarios"
    },
    {
      name: "Electry",
      logo: "/electry.png",
      category: "Energía",
      shortDescription: "Análisis energético y certificados para optimizar el consumo de tu propiedad.",
      fullDescription: "Ofrecemos una amplia gama de servicios diseñados para analizar detalladamente los consumos energéticos de nuestros clientes, negociar con proveedores de energía para obtener tarifas más competitivas, asesorar en la selección de tecnologías y soluciones energéticas eficientes, llevar a cabo la implementación de medidas de ahorro energético y el trámite de certificados energéticos.",
      services: ["Certificados energéticos", "Ahorro energético", "Tarifas competitivas", "Tecnología eficiente"],
      alt: "Logo de Electry - Eficiencia Energética"
    },
    {
      name: "Mutua",
      logo: "/mutua.png",
      category: "Seguros",
      shortDescription: "Tarifas competitivas para gestión de impagos en alquileres.",
      fullDescription: "Hemos establecido un acuerdo exclusivo para nuestros asociados, que les permite acceder a tarifas altamente competitivas para ofrecer servicios de gestión de impagos a los propietarios que alquilan sus viviendas.",
      services: ["Gestión impagos", "Seguros alquiler", "Tarifas exclusivas", "Protección propietarios"],
      alt: "Logo de Mutua - Servicios de Seguros"
    },
    {
      name: "Orden Nails",
      logo: "/ordennails.png",
      category: "Organización",
      shortDescription: "Organización profesional para mejorar la funcionalidad de tu hogar.",
      fullDescription: "Nuestro servicio de Organización Profesional ofrece una amplia gama de soluciones para mejorar la funcionalidad y el orden en tu hogar o lugar de trabajo. Desde la organización general hasta la planificación de rutinas familiares, pasando por la preparación de espacios específicos como la habitación del bebé o el trastero.",
      services: ["Organización hogar", "Rutinas familiares", "Espacios específicos", "Funcionalidad"],
      alt: "Logo de Orden Nails - Organización Profesional"
    },
    {
      name: "ReformaTek",
      logo: "/reformatek.png",
      category: "Reformas",
      shortDescription: "Expertos en reformas integrales, diseño y construcción personalizada.",
      fullDescription: "Nuestro equipo de expertos en arquitectura, diseño y construcción trabaja en estrecha colaboración con cada cliente para entender sus objetivos y convertir sus ideas en realidad. Ya sea una reforma completa de una vivienda, la renovación de un espacio comercial o la rehabilitación de un edificio histórico.",
      services: ["Reformas integrales", "Diseño arquitectónico", "Construcción", "Rehabilitación"],
      alt: "Logo de ReformaTek - Reformas y Construcción"
    },
    {
      name: "Suelos y Paredes",
      logo: "/suelosyparedes.png",
      category: "Decoración",
      shortDescription: "Soluciones integrales para decoración y renovación de interiores.",
      fullDescription: "Nos especializamos en ofrecer soluciones integrales para la decoración y renovación de interiores. Desde suelos hasta paredes, contamos con una amplia gama de productos y servicios para satisfacer las necesidades de nuestros clientes.",
      services: ["Suelos", "Paredes", "Decoración interior", "Renovación"],
      alt: "Logo de Suelos y Paredes - Decoración Interior"
    },
    {
      name: "Coocun",
      logo: "/coocun.jpg",
      category: "Asistencia",
      shortDescription: "Servicio especializado de apoyo para la tercera edad en procesos de venta.",
      fullDescription: "¿Necesitas vender tu casa pero te preocupa la complejidad del proceso, especialmente si eres una persona de la tercera edad? Ofrecemos un servicio especializado de apoyo para la tercera edad, brindando asistencia y orientación en cada paso del proceso de venta.",
      services: ["Apoyo tercera edad", "Asistencia venta", "Orientación", "Acompañamiento"],
      alt: "Logo de Coocun - Servicios para la Tercera Edad"
    }
  ];

      return (
      <main 
        className="w-full min-h-screen relative"
        itemScope 
        itemType="https://schema.org/Organization"
      >
        <Head>
          <title>Red de Colaboradores Premium | Alianzas Estratégicas Inmobiliarias</title>
          <meta 
            name="description" 
            content="Descubre nuestra exclusiva red de colaboradores premium en el sector inmobiliario. Servicios integrales de máxima calidad desde hipotecas hasta reformas de lujo." 
          />
          <meta 
            name="keywords" 
            content="colaboradores premium, alianzas inmobiliarias, servicios exclusivos, reformas lujo Madrid, hipotecas premium, eficiencia energética" 
          />
          <meta property="og:title" content="Red Premium de Colaboradores Inmobiliarios" />
          <meta property="og:description" content="Alianzas estratégicas con las empresas más exclusivas del sector inmobiliario y servicios de lujo." />
          <meta property="og:image" content="/acuerdosyconvenios.jpg" />
          <link rel="canonical" href="https://realestategozamadrid.com/acuerdos" />

          <OrganizationStructuredData />
          <PartnersStructuredData partners={partners} />
        </Head>

              <AnimatedOnScroll>
          {/* Hero Section con Parallax Premium */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Imagen de fondo con parallax */}
          <motion.div 
            className="absolute inset-0 scale-110"
            style={{ y, scale, opacity }}
          >
            <Image
              src="/acuerdosyconvenios.jpg"
              alt="Acuerdos y convenios estratégicos premium"
              layout="fill"
              objectFit="cover"
              priority
              quality={100}
            />
            {/* Overlays múltiples para efecto cinematográfico */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-yellow-900/40 to-black/80"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/20 to-transparent"></div>
          </motion.div>

          {/* Partículas flotantes */}
          <FloatingParticles />

          {/* Contenido del hero */}
          <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Badge premium */}
                             <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.5, duration: 0.6 }}
                 className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-full px-6 py-3 mb-8"
               >
                 <FaGem className="text-yellow-400 text-xl" />
                 <span className="text-yellow-300 font-semibold text-lg">Red Premium de Colaboradores</span>
               </motion.div>

              {/* Título principal */}
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight"
                itemProp="name"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Alianzas
                                 <motion.span 
                   className="block bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 1, duration: 0.8 }}
                 >
                   Estratégicas
                 </motion.span>
              </motion.h1>

              {/* Subtítulo */}
              <motion.p 
                className="text-xl md:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Conectamos con los mejores profesionales para ofrecerte una experiencia inmobiliaria 
                <span className="text-yellow-400 font-semibold"> excepcional e integral</span>
              </motion.p>
              
              {/* Estadísticas premium */}
              <motion.div 
                className="flex flex-wrap justify-center gap-12 text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                {[
                  { number: "11+", label: "Colaboradores Elite", icon: <FaUsers /> },
                  { number: "7", label: "Sectores Especializados", icon: <FaAward /> },
                  { number: "100%", label: "Garantía de Calidad", icon: <FaShieldAlt /> }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-center group"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                                         <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
                       {stat.number}
                     </div>
                    <div className="text-sm md:text-base text-gray-300 flex items-center justify-center space-x-2">
                      <span className="text-yellow-400 text-lg">{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Indicador de scroll */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-center"
            >
              <div className="text-sm mb-2">Descubre más</div>
              <FaChevronDown className="mx-auto text-xl" />
            </motion.div>
          </motion.div>
        </section>

                 {/* Sección de colaboradores premium */}
         <section className="relative py-32 px-4 bg-white">
          <div className="max-w-8xl mx-auto">
            {/* Header de sección premium */}
            <motion.div
              {...useStaggeredAnimation(0)}
              className="text-center mb-20"
            >
                             <motion.div
                 initial={{ scale: 0 }}
                 whileInView={{ scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-full px-6 py-3 mb-8"
               >
                 <FaHandshake className="text-yellow-400 text-xl" />
                 <span className="text-yellow-700 font-semibold">Colaboradores Certificados</span>
               </motion.div>

                                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                 Nuestros <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Partners</span>
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Cada colaborador ha sido cuidadosamente seleccionado por su excelencia, 
                innovación y compromiso con la calidad excepcional.
              </p>
            </motion.div>

            {/* Grid de colaboradores premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
              {partners.map((partner, index) => (
                <PremiumPartnerCard key={index} partner={partner} index={index} />
              ))}
            </div>

            {/* CTA final premium */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-24"
            >
                                            <div className="relative bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl p-12 border border-yellow-200 overflow-hidden shadow-xl">
                 {/* Efectos de fondo */}
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 via-amber-100/50 to-yellow-100/50"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500"></div>
                 
                 <div className="relative z-10">
                   <motion.div
                     whileHover={{ scale: 1.1, rotate: 5 }}
                     className="inline-block mb-6"
                   >
                     <FaUsers className="text-6xl text-yellow-600" />
                   </motion.div>
                   
                   <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                     ¿Quieres unirte a nuestra <span className="text-yellow-600">red exclusiva</span>?
                   </h3>
                   <p className="text-gray-700 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                    Si representas una empresa que ofrece servicios premium complementarios al sector inmobiliario, 
                    nos encantaría evaluar una posible colaboración estratégica.
                  </p>
                  
                                     <motion.a
                     href="mailto:marta@gozamadrid.com"
                     className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-black font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 text-lg relative overflow-hidden group"
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                    <span className="relative z-10">Solicitar Partnership</span>
                    <FaExternalLinkAlt className="relative z-10" />
                    
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedOnScroll>
    </main>
  );
}
