export const expRealtyStructuredData = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "eXp Realty - Goza Madrid",
  "image": "https://realestategozamadrid.com/logo.png",
  "url": "https://realestategozamadrid.com/exp-realty",
  "description": "Agente inmobiliario certificado de eXp Realty especializado en propiedades de lujo en Madrid. Servicios profesionales de compra, venta y consultoría inmobiliaria.",
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
  "memberOf": {
    "@type": "Organization",
    "name": "eXp Realty",
    "url": "https://www.exprealty.com",
    "description": "Brokerage inmobiliario líder mundial con tecnología innovadora"
  },
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Agente Inmobiliario Certificado eXp Realty",
      "credentialCategory": "Real Estate License"
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
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Servicios de Compra de Propiedades",
        "description": "Asesoramiento profesional para la compra de propiedades de lujo en Madrid"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Servicios de Venta de Propiedades",
        "description": "Marketing y venta profesional de propiedades exclusivas"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Valoración de Propiedades",
        "description": "Análisis de mercado y valoración profesional gratuita"
      }
    }
  ],
  "sameAs": [
    "https://www.facebook.com/GozaMadridAI",
    "https://instagram.com/Gozamadrid54",
    "https://x.com/Marta12857571",
    "https://www.linkedin.com/in/marta-lópez-55516099/",
    "https://www.youtube.com/@gozamadrid2410"
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
  ]
};

export default expRealtyStructuredData; 