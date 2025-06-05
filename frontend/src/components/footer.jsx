"use client";
import React from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import Head from "next/head";
import { 
  FaTwitter,
  FaFacebookSquare,
  FaInstagram,
  FaLinkedin,
  FaYoutube 
} from "react-icons/fa";
import LogoFooter from "./LogoFooter";

// Schema estructurado para SEO
const SCHEMA_DATA = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Goza Madrid",
  "image": "https://realestategozamadrid.com/logo.png",
  "url": "https://realestategozamadrid.com",
  "description": "Agencia inmobiliaria especializada en Madrid. Servicios profesionales de compra, venta y alquiler de propiedades.",
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
    "https://www.twitter.com/gozamadrid",
    "https://www.linkedin.com/in/marta-l%C3%B3pez-55516099/",
    "https://www.youtube.com/@martalopez1039"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "40.423399",
      "longitude": "-3.676840"
    },
    "geoRadius": "50000"
  },
  "serviceArea": {
    "@type": "Place",
    "name": "Madrid",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.423399",
      "longitude": "-3.676840"
    }
  }
};

// Mover footerData fuera del componente para evitar recreación
const footerData = {
  logo: {
    url: "/",
    src: "/logonuevo.png",
    alt: "Goza Madrid - Agencia Inmobiliaria en Madrid",
    width: 100,
    height: 100
  },
  contact: {
    address: {
      label: "Dirección",
      street: "Nueva España",
      city: "28009 Madrid",
      mapUrl: "https://goo.gl/maps/tuDirección"
    },
    info: {
      label: "Contacto",
      phone: {
        display: "+34 919 012 103",
        link: "+34919012103"
      },
      email: "marta@gozamadrid.com"
    }
  },
  navigation: [
    {
      title: "Servicios Principales",
      links: [
        { title: "Inicio", url: "/", ariaLabel: "Ir a la página principal" },
        { title: "Propiedades", url: "/vender/comprar", ariaLabel: "Ver listado de propiedades" },
        { title: "Servicios", url: "/servicios", ariaLabel: "Conocer nuestros servicios" },
        { title: "Reformas", url: "/reformas", ariaLabel: "Servicios de reformas" },
        { title: "Blog", url: "/blog", ariaLabel: "Visitar nuestro blog" },
      ]
    },
    {
      title: "Servicios Especializados",
      links: [
        { title: "Vender", url: "/vender", ariaLabel: "Servicios de venta" },
        { title: "Contacto", url: "/contacto", ariaLabel: "Contactar con nosotros" },
        { title: "Guía de Compra", url: "/servicios/residentes-espana/guia-compra", ariaLabel: "Ver guía de compra" },
        { title: "Alquiler Turístico", url: "/servicios/residentes-espana/alquiler", ariaLabel: "Información sobre alquiler turístico" },
      ]
    }
  ],
  social: [
    { 
      name: "Facebook",
      url: "https://www.facebook.com/MBLP66/", 
      icon: <FaFacebookSquare className="size-6" />,
      ariaLabel: "Visitar nuestro Facebook"
    },
    { 
      name: "Instagram",
      url: "https://www.instagram.com/gozamadrid54/", 
      icon: <FaInstagram className="size-6" />,
      ariaLabel: "Seguirnos en Instagram"
    },
    { 
      name: "Twitter",
      url: "https://www.twitter.com/gozamadrid", 
      icon: <FaTwitter className="size-6 p-0.5" />,
      ariaLabel: "Seguirnos en X/Twitter"
    },
    { 
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/marta-l%C3%B3pez-55516099/", 
      icon: <FaLinkedin className="size-6" />,
      ariaLabel: "Conectar en LinkedIn"
    },
    { 
      name: "YouTube",
      url: "https://www.youtube.com/@martalopez1039", 
      icon: <FaYoutube className="size-6" />,
      ariaLabel: "Ver nuestro canal de YouTube"
    }
  ],
  legal: {
    copyright: "© 2024 Goza Madrid. Todos los derechos reservados.",
    links: [
      { title: "Política de Privacidad", url: "/privacidad", ariaLabel: "Ver política de privacidad" },
      { title: "Términos y Condiciones", url: "/terminos", ariaLabel: "Ver términos y condiciones" },
      { title: "Aviso Legal", url: "/aviso-legal", ariaLabel: "Ver aviso legal" },
      { title: "Política de Cookies", url: "/cookies", ariaLabel: "Ver política de cookies" }
    ]
  }
};

const Footer = () => {
  return (
    <>
      <Head>
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SCHEMA_DATA)
          }}
        />
      </Head>

      <footer 
        className="relative z-50 bg-gradient-to-r from-black via-gray-900 to-amarillo dark:from-black dark:via-gray-900 dark:to-amarillo"
        aria-label="Pie de página"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Columna de información principal */}
            <div className="lg:col-span-5">
              <div className="space-y-8">
                {/* Logo */}
                <Link 
                  href={footerData.logo.url}
                  className="inline-block transition-transform hover:scale-105"
                  aria-label="Ir a la página principal"
                >
                  <LogoFooter 
                    src={footerData.logo.src}
                    alt={footerData.logo.alt}
                  />
                </Link>

                {/* Información de contacto */}
                <div className="space-y-6 text-white">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider">
                      {footerData.contact.address.label}
                    </h2>
                    <Link
                      href={footerData.contact.address.mapUrl}
                      className="mt-2 block hover:text-amarillo transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver ubicación en el mapa"
                    >
                      <p>{footerData.contact.address.street}</p>
                      <p>{footerData.contact.address.city}</p>
                    </Link>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider">
                      {footerData.contact.info.label}
                    </h2>
                    <div className="mt-2 space-y-2">
                      <Link
                        href={`tel:${footerData.contact.info.phone.link}`}
                        className="block hover:text-amarillo transition-colors duration-300"
                        aria-label="Llamar por teléfono"
                      >
                        {footerData.contact.info.phone.display}
                      </Link>
                      <Link
                        href={`mailto:${footerData.contact.info.email}`}
                        className="block hover:text-amarillo transition-colors duration-300"
                        aria-label="Enviar email"
                      >
                        {footerData.contact.info.email}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Redes sociales */}
                <div className="flex space-x-4">
                  {footerData.social.map((social, index) => (
                    <Link
                      key={index}
                      href={social.url}
                      className="text-white hover:text-amarillo transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Columnas de navegación */}
            <nav className="lg:col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-2" aria-label="Navegación del pie de página">
              {footerData.navigation.map((column, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                    {column.title}
                  </h2>
                  <ul className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.url}
                          className="text-white hover:text-amarillo transition-colors duration-300"
                          aria-label={link.ariaLabel}
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Separador y sección legal */}
          <div className="mt-12 border-t border-amarillo pt-8">
            <div className="flex flex-col items-center justify-between lg:flex-row">
              <p className="text-white text-sm">
                {footerData.legal.copyright}
              </p>
              <nav className="mt-4 lg:mt-0" aria-label="Enlaces legales">
                <ul className="flex flex-col items-center space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                  {footerData.legal.links.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.url}
                        className="text-white hover:text-amarillo transition-colors duration-300 text-sm"
                        aria-label={link.ariaLabel}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
