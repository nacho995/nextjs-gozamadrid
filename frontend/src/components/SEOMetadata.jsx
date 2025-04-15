import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * Componente reutilizable para metadatos SEO
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la página
 * @param {string} props.description - Descripción para meta description
 * @param {string} props.keywords - Palabras clave separadas por comas
 * @param {string} props.ogType - Tipo Open Graph (website, article, etc.)
 * @param {string} props.ogImage - URL de la imagen para compartir en redes sociales
 * @param {string} props.ogImageAlt - Texto alternativo para la imagen OG
 * @param {string} props.canonical - URL canónica (opcional, por defecto usa la URL actual)
 * @param {Object} props.structuredData - Datos estructurados JSON-LD
 * @param {string} props.author - Autor del contenido (opcional)
 * @param {string} props.publishedTime - Fecha de publicación (para artículos)
 * @param {string} props.modifiedTime - Fecha de modificación (para artículos)
 * @param {boolean} props.noIndex - Si true, indica a los buscadores que no indexen la página
 * @returns {JSX.Element} Componente Head con metadatos SEO
 */
const SEOMetadata = ({
  title,
  description,
  keywords = '',
  ogType = 'website',
  ogImage = 'https://realestategozamadrid.com/og-image.jpg',
  ogImageAlt = '',
  canonical,
  structuredData,
  author = 'Goza Madrid',
  publishedTime,
  modifiedTime,
  noIndex = false
}) => {
  const router = useRouter();
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : `https://realestategozamadrid.com${router.asPath}`);
  const siteName = 'Goza Madrid';
  
  // Asegurarse de que las descripciones no excedan los 160 caracteres
  const safeDescription = description && description.length > 160 
    ? `${description.substring(0, 157)}...` 
    : description;
  
  return (
    <Head>
      {/* Metadatos básicos */}
      <title>{title}</title>
      <meta name="description" content={safeDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />
      
      {/* Control de indexación */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:locale" content="es_ES" />
      
      {/* Metadatos adicionales para artículos */}
      {ogType === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@gozamadrid" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={ogImage} />
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
      
      {/* Datos estructurados JSON-LD */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: (() => {
              try {
                return JSON.stringify(structuredData);
              } catch (e) {
                console.error("Error serializando structuredData:", e);
                return JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebPage"
                });
              }
            })()
          }}
        />
      )}
      
      {/* Metadatos adicionales */}
      <meta name="author" content={author} />
      <meta name="publisher" content={siteName} />
    </Head>
  );
};

export default SEOMetadata; 