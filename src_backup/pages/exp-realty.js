import Head from "next/head";
import ExpPage from "@/components/exp/expPage";
import { getCleanJsonLd } from "@/utils/structuredDataHelper";
import { 
  organizationData, 
  videoData, 
  jobPostingData, 
  breadcrumbData 
} from "@/data/expRealtyStructuredData";

// Preparar datos limpios
const cleanOrgData = getCleanJsonLd(organizationData);
const cleanVideoData = getCleanJsonLd(videoData);
const cleanJobData = getCleanJsonLd(jobPostingData);
const cleanBreadcrumbData = getCleanJsonLd(breadcrumbData);

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

        {/* Datos estructurados - Usando JSON-LD directo sin entidades HTML */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanOrgData }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJobData }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanVideoData }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanBreadcrumbData }} />

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




