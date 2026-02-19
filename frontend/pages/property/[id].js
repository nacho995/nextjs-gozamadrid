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
export async function getServerSideProps(context) {
  const { id } = context.params;
  const sourceQuery = context.query.source; // Obtener source de la query si existe

  // Determinar la fuente (si no viene en query, intentar detectarla o default a mongodb)
  const source = sourceQuery || detectSourceFromId(id) || 'mongodb';

  console.log(`[getServerSideProps] Obteniendo propiedad ID: ${id}, Fuente: ${source}`);

  // Importando directamente la conexión a MongoDB para acceso directo en caso de fallo de la API
  // Nota: Estos módulos solo se cargan en el servidor
  const { getPropertiesCollection } = require('../../lib/mongodb');
  const { ObjectId } = require('mongodb');
  
  // Función para intentar obtener la propiedad directamente desde MongoDB
  const getPropertyDirectlyFromDb = async (id) => {
    try {
      console.log(`[getServerSideProps] Intentando acceso directo a MongoDB para ID: ${id}`);
      const collection = await getPropertiesCollection();
      
      let property = null;
      
      // Intentar varias estrategias de búsqueda
      if (ObjectId.isValid(id)) {
        property = await collection.findOne({ _id: new ObjectId(id) });
        if (property) {
          console.log(`[getServerSideProps] Propiedad encontrada por ObjectId: ${property.title || 'Sin título'}`);
        }
      }
      
      // Si no se encuentra por ObjectId, buscar por campo id
      if (!property) {
        property = await collection.findOne({ id: id });
        if (property) {
          console.log(`[getServerSideProps] Propiedad encontrada por campo id: ${property.title || 'Sin título'}`);
        }
      }
      
      // Si todavía no se encuentra, buscar por slug
      if (!property) {
        property = await collection.findOne({ slug: id });
        if (property) {
          console.log(`[getServerSideProps] Propiedad encontrada por slug: ${property.title || 'Sin título'}`);
        }
      }
      
      return property;
    } catch (error) {
      console.error(`[getServerSideProps] Error al acceder directamente a MongoDB:`, error.message);
      return null;
    }
  };
  
  // Función para crear datos mínimos de la propiedad cuando hay error
  const createFallbackProperty = (id) => {
    return {
      _id: id,
      id: id,
      title: 'Propiedad en Madrid',
      description: 'Detalles completos de esta propiedad no disponibles en este momento. Por favor, contacta con nosotros para más información.',
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
    };
  };

  // Obtener la URL base correcta para el entorno actual
  const isProduction = process.env.NODE_ENV === 'production';
  let API_BASE_URL;
  
  if (isProduction) {
    // En producción intentamos ambas opciones
    // 1. URL base fija conocida
    API_BASE_URL = 'https://www.realestategozamadrid.com';
    
    // 2. URL basada en el encabezado host (como respaldo)
    const host = context.req?.headers?.host;
    if (host) {
      const protocol = 'https';
      const hostApiUrl = `${protocol}://${host}`;
      console.log(`[getServerSideProps] URL alternativa disponible: ${hostApiUrl}`);
    }
  } else {
    // En desarrollo, usar localhost
    API_BASE_URL = 'http://localhost:3000';
  }
  
  const TIMEOUT = 15000;
  
  console.log(`[getServerSideProps] Usando API base: ${API_BASE_URL}`);

  // Función para intentar obtener datos de la API
  const fetchFromApi = async (baseUrl) => {
    const apiUrl = `${baseUrl}/api/properties/${id}`;
    console.log(`[getServerSideProps] Intentando obtener datos desde: ${apiUrl}`);
    
    try {
      const response = await axios.get(apiUrl, {
        timeout: TIMEOUT,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status === 200 && response.data.success && response.data.property) {
        console.log(`[getServerSideProps] Datos obtenidos correctamente de: ${apiUrl}`);
        return {
          success: true,
          data: response.data.property
        };
      }
      
      console.log(`[getServerSideProps] Respuesta inválida de: ${apiUrl}`, response.status);
      return { success: false };
    } catch (error) {
      console.error(`[getServerSideProps] Error al obtener datos de: ${apiUrl}`, error.message);
      return { success: false };
    }
  };

  // Intentar obtener datos de la API principal
  const primaryResult = await fetchFromApi(API_BASE_URL);
  
  // Si tuvimos éxito con la API principal
  if (primaryResult.success) {
    return {
      props: {
        propertyData: primaryResult.data,
        error: null,
        source: source,
      },
    };
  }
  
  // Si la API principal falló y estamos en producción, intentar con una URL alternativa
  if (isProduction) {
    const host = context.req?.headers?.host;
    if (host) {
      const alternativeUrl = `https://${host}`;
      console.log(`[getServerSideProps] Intentando URL alternativa: ${alternativeUrl}`);
      
      const alternativeResult = await fetchFromApi(alternativeUrl);
      
      if (alternativeResult.success) {
        return {
          props: {
            propertyData: alternativeResult.data,
            error: null,
            source: source,
          },
        };
      }
    }
  }
  
  // Si las APIs fallaron, intentar acceso directo a la base de datos
  console.log('[getServerSideProps] Las APIs fallaron, intentando acceso directo a MongoDB');
  
  try {
    const dbProperty = await getPropertyDirectlyFromDb(id);
    
    if (dbProperty) {
      console.log(`[getServerSideProps] Propiedad recuperada directamente de MongoDB: ${dbProperty.title || 'Sin título'}`);
      
      // Procesar el precio para evitar problemas de formato
      let propertyPrice = dbProperty.price;
      let priceNumeric = null;
      
      // Intentar extraer valor numérico del precio
      if (propertyPrice !== undefined && propertyPrice !== null) {
        // Si ya es un número, guardarlo directamente
        if (typeof propertyPrice === 'number') {
          priceNumeric = propertyPrice;
          propertyPrice = String(propertyPrice); // Convertir a string para consistencia
        } 
        // Si es string, intentar extraer el valor numérico
        else if (typeof propertyPrice === 'string') {
          // Limpiar el string de precio de caracteres no numéricos
          const cleanPrice = propertyPrice.replace(/[^\d.-]/g, '');
          if (cleanPrice) {
            priceNumeric = parseFloat(cleanPrice);
          }
        }
      }
      
      console.log(`[getServerSideProps] Precio procesado: original=${dbProperty.price}, numérico=${priceNumeric}`);
      
      // Normalizar los datos según el formato que espera la aplicación
      const normalizedProperty = {
        _id: dbProperty._id?.toString() || id,
        id: dbProperty._id?.toString() || dbProperty.id || id,
        title: dbProperty.title || dbProperty.name || 'Propiedad sin título',
        description: dbProperty.description || '',
        price: propertyPrice || 'Consultar',
        priceNumeric: priceNumeric, // Añadir el precio numérico para facilitar el formato correcto
        location: dbProperty.location || dbProperty.address || 'Madrid',
        address: dbProperty.address || dbProperty.location || 'Madrid',
        coordinates: dbProperty.coordinates || null,
        bedrooms: dbProperty.bedrooms || dbProperty.rooms || '0',
        bathrooms: dbProperty.bathrooms || dbProperty.wc || '0',
        area: dbProperty.area || dbProperty.m2 || '0',
        propertyType: dbProperty.propertyType || dbProperty.typeProperty || 'Propiedad',
        status: dbProperty.status || 'Disponible',
        images: Array.isArray(dbProperty.images) ? 
          dbProperty.images.map((img, index) => {
            if (typeof img === 'string') {
              return { url: img, src: img, alt: `${dbProperty.title || 'Propiedad'} - Imagen ${index + 1}` };
            } else if (typeof img === 'object') {
              return { 
                url: img.url || img.src || '', 
                src: img.url || img.src || '',
                alt: img.alt || `${dbProperty.title || 'Propiedad'} - Imagen ${index + 1}`
              };
            }
            return null;
          }).filter(Boolean) : [],
        source: 'mongodb_direct',
        createdAt: dbProperty.createdAt || new Date().toISOString(),
        updatedAt: dbProperty.updatedAt || new Date().toISOString()
      };
      
      return {
        props: {
          propertyData: normalizedProperty,
          error: null,
          source: 'mongodb_direct',
        },
      };
    }
  } catch (error) {
    console.error('[getServerSideProps] Error al acceder directamente a MongoDB:', error);
  }
  
  // Si todo lo anterior falla, usar datos de respaldo
  console.warn(`[getServerSideProps] Todos los intentos fallaron, usando datos de respaldo`);
  
  return {
    props: {
      propertyData: createFallbackProperty(id),
      error: "La información completa de esta propiedad no está disponible en este momento.",
      source: 'fallback',
    },
  };
}
