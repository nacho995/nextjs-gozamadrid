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

  // Obtener la URL base correcta para el entorno actual
  const isProduction = process.env.NODE_ENV === 'production';
  let API_BASE_URL;
  
  if (isProduction) {
    // En producción, siempre usar HTTPS y el dominio principal
    API_BASE_URL = 'https://www.realestategozamadrid.com';
    
    // Alternativa usando el host de la solicitud actual
    // const host = context.req.headers.host || 'realestategozamadrid.com';
    // const protocol = 'https'; // Forzar HTTPS en producción
    // API_BASE_URL = `${protocol}://${host}`;
  } else {
    // En desarrollo, usar localhost
    API_BASE_URL = 'http://localhost:3000';
  }
  
  const TIMEOUT = 15000;
  
  console.log(`[getServerSideProps] Usando API base: ${API_BASE_URL}`);


  let apiUrl = '';
  let headers = { 'Accept': 'application/json' };
  let params = {};

  if (source === 'mongodb') {
      console.log('[getServerSideProps] Usando API MongoDB local');

      // Usar URL absoluta completa con la base correcta
      apiUrl = `${API_BASE_URL}/api/properties/${id}`;
      console.log(`[getServerSideProps] Intentando fetch a MongoDB API: ${apiUrl}`);
  } else {
      console.error(`[getServerSideProps] Fuente desconocida: ${source}`);
      return { props: { propertyData: null, error: 'Fuente de datos no válida', source } };
  }

  console.log(`[getServerSideProps] URL final: ${apiUrl}`);
  // console.log('[getServerSideProps] Params:', params); // No loguear el secret

  try {
      console.log(`[getServerSideProps] Intentando obtener datos con axios desde: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
          params: params,
          headers: headers,
          timeout: TIMEOUT,
      });

      if (response.status !== 200) {
          console.error(`[getServerSideProps] API devolvió estado ${response.status}`);
          throw new Error(`API devolvió estado ${response.status}`);
      }

      // Extraer los datos de la propiedad de la respuesta de la API
      const responseData = response.data;
      console.log(`[getServerSideProps] Respuesta recibida:`, JSON.stringify(responseData).substring(0, 200) + '...');
      
      if (!responseData.success || !responseData.property) {
          console.error(`[getServerSideProps] Datos inválidos en respuesta:`, responseData);
          throw new Error('No se encontraron datos de la propiedad en la respuesta');
      }
      
      const propertyData = responseData.property;
      console.log(`[getServerSideProps] Propiedad cargada: ${propertyData.title || 'Sin título'}`);

      return {
          props: {
              propertyData: propertyData,
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
