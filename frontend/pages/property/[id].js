import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';
// axios ya no es necesario - acceso directo a MongoDB

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
  const normalizedProperty = {
    ...propertyData,
    // Asegurar que id siempre esté definido
    id: propertyData.id || propertyData._id || router.query.id,
  };


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
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": normalizedProperty.title || 'Propiedad',
              "image": imageUrl,
              "description": metaDescription,
              "sku": normalizedProperty.id,
              "offers": {
                "@type": "Offer",
                "url": `https://www.realestategozamadrid.com/property/${normalizedProperty.id}?source=${source}`,
                "priceCurrency": "EUR",
                "price": normalizedProperty.price || '0',
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/UsedCondition"
              }
            })
          }}
        />
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
// OPTIMIZADO: Acceso directo a MongoDB sin self-calls HTTP para evitar
// deadlocks y timeouts en Vercel serverless functions (límite 10s en free tier)
export async function getServerSideProps(context) {
  const { id } = context.params;
  const sourceQuery = context.query.source;
  const source = sourceQuery || detectSourceFromId(id) || 'mongodb';

  console.log(`[getServerSideProps] Obteniendo propiedad ID: ${id}, Fuente: ${source}`);

  const { getPropertiesCollection } = require('../../lib/mongodb');
  const { ObjectId } = require('mongodb');

  // Función para serializar un documento MongoDB (convertir ObjectId a string, etc.)
  const serializeProperty = (doc) => {
    if (!doc) return null;
    const serialized = { ...doc };
    // Convertir _id de ObjectId a string
    if (serialized._id) {
      serialized._id = serialized._id.toString();
    }
    // Asegurar que id esté definido
    serialized.id = serialized._id || id;
    // Convertir dates a ISO strings
    if (serialized.createdAt instanceof Date) serialized.createdAt = serialized.createdAt.toISOString();
    if (serialized.updatedAt instanceof Date) serialized.updatedAt = serialized.updatedAt.toISOString();
    // Serializar _id dentro de imágenes si existe
    if (Array.isArray(serialized.images)) {
      serialized.images = serialized.images.map(img => {
        if (typeof img === 'string') return { src: img, url: img, alt: '' };
        if (typeof img === 'object' && img !== null) {
          const clean = { ...img };
          if (clean._id) clean._id = clean._id.toString();
          // Asegurar que src esté definido
          clean.src = clean.src || clean.url || '';
          clean.url = clean.url || clean.src || '';
          return clean;
        }
        return null;
      }).filter(Boolean);
    }
    return serialized;
  };

  try {
    // ACCESO DIRECTO a MongoDB - sin HTTP self-calls
    const collection = await getPropertiesCollection();
    let property = null;

    // Buscar por ObjectId
    if (ObjectId.isValid(id)) {
      property = await collection.findOne({ _id: new ObjectId(id) });
    }
    // Buscar por campo id
    if (!property) {
      property = await collection.findOne({ id: id });
    }
    // Buscar por slug
    if (!property) {
      property = await collection.findOne({ slug: id });
    }

    if (property) {
      console.log(`[getServerSideProps] Propiedad encontrada: ${property.title || 'Sin título'}`);
      const serialized = serializeProperty(property);

      return {
        props: {
          propertyData: serialized,
          error: null,
          source: source,
        },
      };
    }

    // No se encontró la propiedad
    console.warn(`[getServerSideProps] Propiedad no encontrada: ${id}`);
    return {
      props: {
        propertyData: null,
        error: 'Propiedad no encontrada',
        source: source,
      },
    };

  } catch (error) {
    console.error('[getServerSideProps] Error al acceder a MongoDB:', error.message);

    // Devolver datos de fallback en caso de error de conexión
    return {
      props: {
        propertyData: {
          _id: id,
          id: id,
          title: 'Propiedad en Madrid',
          description: 'Detalles no disponibles temporalmente. Contacta con nosotros para más información.',
          price: 'Contactar',
          location: 'Madrid',
          address: 'Madrid',
          bedrooms: '0',
          bathrooms: '0',
          area: '0',
          propertyType: 'Propiedad',
          status: 'Disponible',
          images: [],
          source: 'fallback',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        error: 'Error temporal al cargar la propiedad. Inténtalo de nuevo.',
        source: 'fallback',
      },
    };
  }
}
