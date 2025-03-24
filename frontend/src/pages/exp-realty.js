import Head from "next/head";
import ExpPage from "@/components/exp/expPage";

export default function ExpRealtyPage() {
  const pageTitle = "eXp Realty Madrid | Únete a Nuestra Red Inmobiliaria | Goza Madrid";
  const pageDescription = "Descubre las ventajas de unirte a eXp Realty en Madrid. Tecnología innovadora, comisiones competitivas y oportunidades de crecimiento para agentes inmobiliarios.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://realestategozamadrid.com/exp-realty" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://realestategozamadrid.com/img/exp-realty-header.jpg" />
        <meta property="og:url" content="https://realestategozamadrid.com/exp-realty" />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://realestategozamadrid.com/img/exp-realty-header.jpg" />

        {/* Schema.org Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "eXp Realty Madrid",
            "description": pageDescription,
            "url": "https://realestategozamadrid.com/exp-realty",
            "logo": "https://realestategozamadrid.com/logo.png",
            "sameAs": [
              "https://www.facebook.com/gozamadrid",
              "https://www.instagram.com/gozamadrid",
              "https://www.linkedin.com/company/exp-realty"
            ],
            "memberOf": {
              "@type": "Organization",
              "name": "eXp World Holdings",
              "url": "https://expworldholdings.com"
            },
            "offers": {
              "@type": "Offer",
              "description": "Oportunidades para agentes inmobiliarios en eXp Realty Madrid",
              "category": "Real Estate Career"
            }
          })}
        </script>

        {/* Schema.org JobPosting */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Agente Inmobiliario - eXp Realty Madrid",
            "description": "Únete a la red inmobiliaria más innovadora. Ofrecemos tecnología de vanguardia, formación continua y un modelo de comisiones competitivo.",
            "datePosted": new Date().toISOString(),
            "validThrough": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
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
          })}
        </script>

        {/* Schema.org BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>

        {/* Metadatos adicionales */}
        <meta name="keywords" content="exp realty madrid, agente inmobiliario madrid, carrera inmobiliaria, oportunidades inmobiliarias, comisiones inmobiliarias" />
        <meta name="author" content="Goza Madrid Inmobiliaria" />
        <meta property="og:locale" content="es_ES" />
        <meta name="application-name" content="eXp Realty Madrid" />
      </Head>

      <ExpPage />
    </>
  );
}




