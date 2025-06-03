/**
 * Datos estructurados para eXp Realty
 */

// Datos de la organización eXp Realty
export const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "eXp Realty",
  "description": "Red global de agentes inmobiliarios con presencia en 25 países",
  "url": "https://realestategozamadrid.com/exp-realty",
  "logo": {
    "@type": "ImageObject",
    "url": "https://realestategozamadrid.com/logo.png",
    "width": 180,
    "height": 60
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 95000,
    "unitText": "agentes"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES",
    "addressLocality": "Madrid"
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "España"
    },
    {
      "@type": "Country",
      "name": "Estados Unidos"
    },
    {
      "@type": "Country",
      "name": "Portugal"
    },
    {
      "@type": "Country",
      "name": "Francia"
    },
    {
      "@type": "Country",
      "name": "Italia"
    }
  ],
  "parentOrganization": {
    "@type": "Organization",
    "name": "eXp World Holdings",
    "url": "https://expworldholdings.com"
  },
  "subOrganization": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "url": "https://realestategozamadrid.com"
  }
};

// Datos del video de eXp Realty
export const videoData = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Goza Madrid",
  "description": "Descubre las ventajas de unirte a eXp España, una de las agencias inmobiliarias de mayor crecimiento mundial. Aprende sobre nuevas formas de facturación y desarrollo profesional.",
  "uploadDate": "2024-01-01",
  "thumbnailUrl": "https://img.youtube.com/vi/UHx6yIrI5UY/maxresdefault.jpg",
  "contentUrl": "https://www.youtube.com/watch?v=UHx6yIrI5UY",
  "embedUrl": "https://www.youtube.com/embed/UHx6yIrI5UY",
  "duration": "PT2M30S",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": {"@type": "WatchAction"},
    "userInteractionCount": 5000
  },
  "regionsAllowed": "ES",
  "publisher": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.gozamadrid.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "potentialAction": {
    "@type": "WatchAction",
    "target": "https://www.youtube.com/watch?v=UHx6yIrI5UY"
  }
};

// Datos de oferta de trabajo como agente inmobiliario
export const jobPostingData = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Agente Inmobiliario - eXp Realty Madrid",
  "description": "Únete a la red inmobiliaria más innovadora. Ofrecemos tecnología de vanguardia, formación continua y un modelo de comisiones competitivo.",
  "datePosted": "2024-01-01T00:00:00.000Z",
  "validThrough": "2025-01-01T00:00:00.000Z",
  "employmentType": "CONTRACTOR",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "eXp Realty Madrid",
    "sameAs": "https://realestategozamadrid.com/exp-realty"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madrid",
      "addressRegion": "Madrid",
      "addressCountry": "ES"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "description": "Comisiones competitivas y múltiples fuentes de ingresos"
  },
  "qualifications": "Licencia de agente inmobiliario, experiencia en ventas, habilidades de comunicación",
  "skills": "Ventas inmobiliarias, negociación, marketing digital, gestión de clientes"
};

// Datos de la agencia inmobiliaria
export const agencyData = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgency",
  "name": "eXp Realty España",
  "description": "eXp Realty es una inmobiliaria digital líder mundial con más de 90.000 agentes en todo el mundo.",
  "url": "https://www.gozamadrid.com/exp-realty",
  "image": "https://www.gozamadrid.com/exprealty.png",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.gozamadrid.com/exprealty.png",
    "width": 180,
    "height": 60
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES",
    "addressLocality": "Madrid"
  },
  "telephone": "+34 919 012 103",
  "email": "marta@gozamadrid.com",
  "slogan": "Propiedades Sin Fronteras",
  "parentOrganization": {
    "@type": "Organization",
    "name": "eXp World Holdings",
    "url": "https://expworldholdings.com"
  }
};

// Datos de migas de pan para navegación
export const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://realestategozamadrid.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "eXp Realty",
      "item": "https://realestategozamadrid.com/exp-realty"
    }
  ]
};

// Exportar todos los datos para su uso en componentes
export default {
  organizationData,
  videoData,
  jobPostingData,
  agencyData,
  breadcrumbData
}; 