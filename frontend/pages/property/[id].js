import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';
import axios from 'axios'; // Necesario para getServerSideProps

// Función auxiliar simplificada para detectar el tipo de propiedad por ID
const detectSourceFromId = (id) => {
  if (!id) {
    return 'mongodb'; // valor por defecto cambiado a mongodb
  }
  
  const idStr = String(id);
  
  // MongoDB IDs son ObjectId con 24 caracteres hexadecimales
  if (/^[a-f\d]{24}$/i.test(idStr)) {
    console.log(`[detectSourceFromId] ID ${idStr} detectado como MongoDB`);
    return 'mongodb';
  }
  
  // Verificar el campo source de la URL si existe
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get('source');
    if (sourceParam) {
      console.log(`[detectSourceFromId] Fuente detectada por parámetro URL: ${sourceParam}`);
      return sourceParam;
    }
  }
  
  // Valor por defecto cambiado a mongodb
  console.log(`[detectSourceFromId] Usando valor por defecto 'mongodb' para ID ${idStr}`);
  return 'mongodb';
};

// Función para normalizar datos de MongoDB
const normalizeMongoData = (mongoProperty) => {
    if (!mongoProperty) return null;
    
    return {
        id: mongoProperty._id,
        title: mongoProperty.title || mongoProperty.name,
        description: mongoProperty.description,
        price: mongoProperty.price,
        images: mongoProperty.images || [],
        source: 'mongodb',
        features: {
            bedrooms: mongoProperty.bedrooms || 0,
            bathrooms: mongoProperty.bathrooms || 0,
            area: mongoProperty.area || mongoProperty.size || mongoProperty.m2 || 0,
            floor: mongoProperty.floor || mongoProperty.piso || null,
        },
        location: mongoProperty.address || mongoProperty.location,
        // otros campos necesarios
    };
};

// -------- COMPONENTE PRINCIPAL --------
export default function PropertyDetail({ propertyData, error, source }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!propertyData && !error); // Inicia cargando solo si no hay datos ni error inicial

  // Si el router no está listo o estamos en fallback, mostrar carga
  if (router.isFallback || loading) {
    return <LoadingScreen />;
  }

  // Si hubo un error al obtener los datos en el servidor
  if (error) {
      console.error("Error al cargar la propiedad (desde getServerSideProps):", error);
      return <PropertyNotFound message={`Error al cargar la propiedad: ${error}`} />;
  }

  // Si no se encontró la propiedad
  if (!propertyData) {
    return <PropertyNotFound message="Propiedad no encontrada." />;
  }

  // Normalizar los datos (esto podría hacerse en getServerSideProps también)
  // const normalizedProperty = source === 'mongodb'
  //     ? normalizeMongoData(propertyData)
  //     : normalizeWooCommerceData(propertyData);
  // O simplemente pasar propertyData si la estructura ya es la esperada por DefaultPropertyContent
  const normalizedProperty = propertyData;


  if (!normalizedProperty) {
       console.error("Error al normalizar los datos de la propiedad:", propertyData);
       return <PropertyNotFound message="Error al procesar los datos de la propiedad." />;
  }


  // Función para generar la meta descripción
  const generateMetaDescription = (prop) => {
    if (!prop) return 'Detalles de la propiedad.';
    const desc = prop.short_description || prop.description || '';
    // Limpiar HTML y truncar
    const cleanDesc = desc.replace(/<[^>]*>?/gm, '').substring(0, 155);
    return `${prop.title || 'Propiedad'} en ${prop.location || 'Madrid'}. ${cleanDesc}...`;
  };

  const metaDescription = generateMetaDescription(normalizedProperty);
  const metaTitle = `${normalizedProperty.title || 'Propiedad'} | GozaMadrid`;
  const imageUrl = normalizedProperty.images?.[0]?.src || '/img/default-property-image.jpg';


  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://www.realestategozamadrid.com/property/${normalizedProperty.id}?source=${source}`} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://www.realestategozamadrid.com/property/${normalizedProperty.id}?source=${source}`} />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={imageUrl} />
        {/* Schema.org para Productos */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "${normalizedProperty.title || 'Propiedad'}",
              "image": "${imageUrl}",
              "description": "${metaDescription}",
              "sku": "${normalizedProperty.id}",
              "offers": {
                "@type": "Offer",
                "url": "https://www.realestategozamadrid.com/property/${normalizedProperty.id}?source=${source}",
                "priceCurrency": "EUR",
                "price": "${normalizedProperty.price || '0'}",
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/UsedCondition"
              }
            }
          `}
        </script>
      </Head>
      <DefaultPropertyContent property={normalizedProperty} source={source} />
    </>
  );
}

// Componente simple para mostrar errores o propiedad no encontrada
const PropertyNotFound = ({ message = "Propiedad no encontrada o error al cargar." }) => (
  <div className="container mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Error</h1>
    <p className="text-gray-600 mb-8">{message}</p>
    <Link href="/propiedades" className="text-blue-600 hover:underline">
      Volver a la lista de propiedades
    </Link>
  </div>
);


// --- getServerSideProps ---
export async function getServerSideProps(context) {
  const { id } = context.params;
  const sourceQuery = context.query.source; // Obtener source de la query si existe

  // Determinar la fuente (si no viene en query, intentar detectarla o default a mongodb)
  const source = sourceQuery || detectSourceFromId(id) || 'mongodb';

  console.log(`[getServerSideProps] Obteniendo propiedad ID: ${id}, Fuente: ${source}`);

  const MONGO_API_URL =
    process.env.MONGO_PROPERTY_API_URL ||
    process.env.NEXT_PUBLIC_API_PROPERTIES_URL ||
    process.env.NEXT_PUBLIC_API_URL;
  const TIMEOUT = parseInt(process.env.API_TIMEOUT || process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');


  let apiUrl = '';
  let headers = { 'Accept': 'application/json' };
  let params = {};

  if (source === 'mongodb') {
      if (!MONGO_API_URL) {
            console.error('[getServerSideProps] Falta variable de entorno para API MongoDB (MONGO_PROPERTY_API_URL, NEXT_PUBLIC_API_PROPERTIES_URL o NEXT_PUBLIC_API_URL)');
            return { props: { propertyData: null, error: 'Error de configuración del servidor (MongoDB)', source } };
       }
       // Log qué variable se está usando finalmente
       if (process.env.MONGO_PROPERTY_API_URL) console.log('[getServerSideProps] Usando MONGO_PROPERTY_API_URL');
       else if (process.env.NEXT_PUBLIC_API_PROPERTIES_URL) console.log('[getServerSideProps] Usando NEXT_PUBLIC_API_PROPERTIES_URL');
       else console.log('[getServerSideProps] Usando NEXT_PUBLIC_API_URL como fallback final');

      // La ruta correcta para obtener una propiedad por ID (sea cual sea la fuente) es /api/properties/:id
      apiUrl = `${MONGO_API_URL}/api/properties/${id}`;
      console.log(`[getServerSideProps] Intentando fetch a MongoDB API: ${apiUrl}`); // Log de la URL final
  } else {
      console.error(`[getServerSideProps] Fuente desconocida: ${source}`);
      return { props: { propertyData: null, error: 'Fuente de datos no válida', source } };
  }

  console.log(`[getServerSideProps] URL final: ${apiUrl}`);
  // console.log('[getServerSideProps] Params:', params); // No loguear el secret

  try {
      const response = await axios.get(apiUrl, {
          params: params,
          headers: headers,
          timeout: TIMEOUT,
      });

      if (response.status !== 200) {
          throw new Error(`API devolvió estado ${response.status}`);
      }

      // Aquí podrías normalizar los datos si es necesario antes de pasarlos como props
      const propertyData = response.data;

      // ¡Importante! Asegúrate de que la estructura de propertyData
      // sea la que espera tu componente DefaultPropertyContent.
      // Si no, aplica normalizeMongoData aquí.

      return {
          props: {
              propertyData: propertyData, // O pasa normalizedData si lo usas
              error: null,
              source: source,
          },
      };

  } catch (error) {
      console.error(`[getServerSideProps] Error al obtener datos de ${source} para ID ${id}:`, error.response?.data || error.message);
      // Devuelve un error genérico al cliente por seguridad
      return {
          props: {
              propertyData: null,
              error: `No se pudo cargar la propiedad (${error.response?.status || 'Network Error'}). Inténtalo más tarde.`,
              source: source,
          },
      };
  }
}
