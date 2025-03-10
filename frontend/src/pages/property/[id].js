import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';

// Función para obtener una propiedad por ID
const fetchProperty = async (id, source, isServer = false) => {
  console.log(`Intentando obtener propiedad con ID: ${id}, Source: ${source}, IsServer: ${isServer}`);
  
  // Determinar la URL correcta según el origen de la propiedad
  let url;
  
  if (source === 'mongodb') {
    // Si es una propiedad de MongoDB
    url = `https://goza-madrid.onrender.com/property/${id}`;
  } else {
    // Si es una propiedad de WooCommerce
    if (isServer) {
      // En el servidor necesitamos URL absoluta
      url = `https://realestategozamadrid.com/wp-json/wc/v3/products/${id}?consumer_key=ck_75c5940bfae6a9dd63f1489da71e43b576999633&consumer_secret=cs_f194d11b41ca92cdd356145705fede711cd233e5`;
    } else {
      // En el cliente podemos usar URL relativa
      url = `/api/wordpress-proxy?path=products/${id}`;
    }
  }
  
  console.log('Usando URL:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al obtener la propiedad: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { property: data, error: null };
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    return { property: null, error: error.message };
  }
};

// Añadir getStaticPaths para manejar rutas dinámicas
export async function getStaticPaths() {
  return {
    paths: [], // No pre-renderizar ninguna ruta
    fallback: 'blocking' // Generar nuevas páginas en el servidor según sea necesario
  };
}

// Necesario junto con getStaticPaths
export async function getStaticProps({ params }) {
  try {
    const id = params.id;
    
    // Intentar determinar el origen basado en el formato del ID
    // Si contiene letras y tiene más de 10 caracteres, probablemente es de MongoDB
    const source = /[a-zA-Z]/.test(id) && id.length > 10 ? 'mongodb' : 'woocommerce';
    
    // Obtener la propiedad, indicando que estamos en el servidor
    const { property, error } = await fetchProperty(id, source, true);
    
    if (error) {
      console.error(`Error al obtener la propiedad con ID ${id}:`, error);
      return {
        props: {
          id,
          error: `No se pudo cargar la propiedad: ${error}`,
          source
        },
        revalidate: 60 // Reintentar después de 60 segundos
      };
    }
    
    if (!property) {
      return {
        props: {
          id,
          error: 'No se encontró la propiedad',
          source
        },
        revalidate: 60 // Reintentar después de 60 segundos
      };
    }
    
    // Devolver los datos procesados
    return {
      props: {
        id,
        preloadedProperty: {
          ...property,
          id: property.id || property._id,
          title: property.title || property.name || 'Propiedad sin título',
          source
        }
      },
      revalidate: 3600 // Revalidar cada hora
    };
  } catch (error) {
    console.error(`Error en getStaticProps:`, error);
    return {
      props: {
        id: params.id,
        error: `No se pudo cargar la propiedad: ${error.message}`,
        source: 'unknown'
      },
      revalidate: 60 // Reintentar después de 60 segundos
    };
  }
}

export default function PropertyDetail({ 
  id: preloadedId, 
  error: preloadedError,
  preloadedProperty,
  source: initialSource
}) {
  const router = useRouter();
  const { id: routerId, source: routerSource } = router.query;
  
  const [loading, setLoading] = useState(!preloadedProperty);
  const [property, setProperty] = useState(preloadedProperty || null);
  const [error, setError] = useState(preloadedError || null);
  
  const propertyId = preloadedId || routerId;
  const source = routerSource || initialSource || (propertyId && /[a-zA-Z]/.test(propertyId) && propertyId.length > 10 ? 'mongodb' : 'woocommerce');

  useEffect(() => {
    // Si ya tenemos la propiedad precargada y no hay error, no cargar de nuevo
    if (preloadedProperty && !preloadedError) {
      console.log("Usando propiedad precargada:", preloadedProperty);
      setProperty(preloadedProperty);
      setLoading(false);
      return;
    }
    
    // Si router no está listo o no tenemos ID, no hacer nada
    if (!router.isReady || !propertyId) return;
    
    const loadProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Cargando propiedad con ID: ${propertyId}, Source: ${source}`);
        
        // Llamar a fetchProperty indicando que estamos en el cliente (isServer = false)
        const { property: propertyData, error: fetchError } = await fetchProperty(propertyId, source, false);
        
        if (fetchError) {
          throw new Error(fetchError);
        }
        
        if (!propertyData) {
          throw new Error('No se pudo obtener la información de la propiedad');
        }
        
        console.log("Propiedad cargada correctamente:", propertyData);
        setProperty(propertyData);
      } catch (err) {
        console.error("Error al cargar la propiedad:", err);
        setError(err.message || 'Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };
    
    loadProperty();
  }, [router.isReady, propertyId, source, preloadedProperty, preloadedError]);

  // Función para generar la descripción meta
  const generateMetaDescription = (property) => {
    if (!property) return '';
    return `${property.type || 'Propiedad'} en ${property.location || 'Madrid'}. ${property.bedrooms || 0} habitaciones, ${property.bathrooms || 0} baños. ${property.description?.substring(0, 100) || ''}`
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando Propiedad | Goza Madrid Inmobiliaria</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto py-12 flex flex-col justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-lg text-gray-600">Cargando información de la propiedad...</p>
        </div>
        </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error | Goza Madrid Inmobiliaria</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-lg">{error}</p>
          <div className="mt-6">
            <button 
              onClick={() => router.reload()}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg mr-4"
            >
              Reintentar
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-6 rounded-lg"
            >
              Volver a inicio
            </button>
          </div>
        </div>
        </>
    );
  }

  if (!property) {
    return (
      <>
        <Head>
          <title>Propiedad no encontrada | Goza Madrid Inmobiliaria</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto py-12 text-center">
          <p className="text-lg">No se encontró la propiedad</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg"
          >
            Volver a inicio
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${property.type || 'Propiedad'} en ${property.location || 'Madrid'} | Goza Madrid`}</title>
        <meta name="description" content={generateMetaDescription(property)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://gozamadrid.com/property/${propertyId}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`} />
        <meta property="og:description" content={generateMetaDescription(property)} />
        <meta property="og:image" content={property.images?.[0] || '/img/default-property-image.jpg'} />
        <meta property="og:url" content={`https://gozamadrid.com/property/${propertyId}`} />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`} />
        <meta name="twitter:description" content={generateMetaDescription(property)} />
        <meta name="twitter:image" content={property.images?.[0] || '/img/default-property-image.jpg'} />

        {/* Schema.org RealEstateListing */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": `${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`,
            "description": property.description,
            "url": `https://gozamadrid.com/property/${propertyId}`,
            "datePosted": property.createdAt,
            "image": property.images || ['/img/default-property.jpg'],
            "price": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": property.price
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": property.location || "Madrid",
              "addressRegion": "Madrid",
              "addressCountry": "ES"
            },
            "numberOfRooms": property.bedrooms,
            "numberOfBathroomsTotal": property.bathrooms,
            "floorSize": {
              "@type": "QuantitativeValue",
              "value": property.size,
              "unitCode": "MTK"
            },
            "amenityFeature": property.features || [],
            "broker": {
              "@type": "RealEstateAgent",
              "name": "Goza Madrid Inmobiliaria",
              "image": "https://gozamadrid.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Madrid",
                "addressRegion": "Madrid",
                "addressCountry": "ES"
              }
            }
          })}
        </script>

        {/* Metadatos adicionales */}
        <meta name="keywords" content={`${property.type || ''}, ${property.location || 'Madrid'}, inmobiliaria, venta, alquiler, propiedad, real estate`} />
        <meta property="article:modified_time" content={property.updatedAt || property.createdAt} />
        <meta name="geo.region" content="ES-M" />
        <meta name="geo.placename" content={property.location || "Madrid"} />
      </Head>

      <DefaultPropertyContent property={property} />
      </>
  );
}
