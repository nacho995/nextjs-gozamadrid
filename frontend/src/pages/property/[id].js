import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';

// Función para obtener una propiedad por ID con reintentos
const fetchProperty = async (id, source, isServer = false, retries = 5) => {
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
      url = `${process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3'}/products/${id}?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85'}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e'}`;
    } else {
      // En el cliente podemos usar URL relativa
      url = `/api/wordpress-proxy?path=products/${id}`;
    }
  }
  
  console.log('Usando URL:', url);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Si obtenemos un error 503, intentar de nuevo después de un retraso
    if (response.status === 503 && retries > 0) {
      console.log(`Error 503 al obtener propiedad ${id}. Reintentando en 5 segundos... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return fetchProperty(id, source, isServer, retries - 1);
    }
    
    if (!response.ok) {
      throw new Error(`Error al obtener la propiedad: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { property: data, error: null };
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    
    // Si es un error de timeout o de red y aún tenemos reintentos, intentar de nuevo
    if ((error.name === 'AbortError' || error.name === 'TypeError') && retries > 0) {
      console.log(`Error de red al obtener propiedad ${id}. Reintentando en 5 segundos... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      return fetchProperty(id, source, isServer, retries - 1);
    }
    
    return { property: null, error: error.message };
  }
};

// Añadir getStaticPaths para manejar rutas dinámicas
export async function getStaticPaths() {
  try {
    // Intentar obtener todas las propiedades para pre-renderizar
    // Primero, intentar obtener propiedades de MongoDB
    let mongodbIds = [];
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
      const mongoResponse = await fetch(`${apiUrl}/property`);
      if (mongoResponse.ok) {
        const mongoProperties = await mongoResponse.json();
        mongodbIds = mongoProperties.map(prop => prop._id.toString());
      }
    } catch (error) {
      console.error('Error al obtener propiedades de MongoDB:', error);
    }

    // Luego, intentar obtener propiedades de WooCommerce
    let woocommerceIds = [];
    try {
      const wooCommerceUrl = `${process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3'}/products?consumer_key=${process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85'}&consumer_secret=${process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e'}`;
      const wooResponse = await fetch(wooCommerceUrl);
      if (wooResponse.ok) {
        const wooProducts = await wooResponse.json();
        woocommerceIds = wooProducts.map(prod => prod.id.toString());
      }
    } catch (error) {
      console.error('Error al obtener propiedades de WooCommerce:', error);
    }

    // Combinar todos los IDs
    const allIds = [...mongodbIds, ...woocommerceIds];
    
    // Generar las rutas para todos los IDs conocidos
    return {
      paths: allIds.map(id => ({ params: { id } })),
      fallback: 'blocking' // Para IDs que no conocemos aún
    };
  } catch (error) {
    console.error('Error en getStaticPaths:', error);
    // En caso de error, no pre-renderizar ninguna ruta
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Añadir getStaticProps para pre-renderizar la página
export async function getStaticProps({ params }) {
  const { id } = params;
  
  // Determinar si es una propiedad de MongoDB o WooCommerce
  const source = id && /[a-zA-Z]/.test(id) && id.length > 10 ? 'mongodb' : 'woocommerce';
  
  try {
    // Intentar obtener la propiedad
    const { property, error } = await fetchProperty(id, source, true);
    
    // Si hay un error 503, devolver una página con revalidación rápida
    if (error && error.includes('503')) {
      console.log(`Error 503 al obtener la propiedad con ID ${id}. Configurando revalidación rápida.`);
      return {
        props: {
          preloadedId: id,
          error: null,
          preloadedProperty: null,
          source
        },
        revalidate: 60 // Revalidar después de 60 segundos
      };
    }
    
    // Si hay otro tipo de error, registrarlo
    if (error) {
      console.log(`Error al obtener la propiedad con ID ${id}: ${error}`);
      return {
        props: {
          preloadedId: id,
          error,
          preloadedProperty: null,
          source
        },
        revalidate: 300 // Revalidar después de 5 minutos
      };
    }
    
    // Si todo va bien, devolver la propiedad
    return {
      props: {
        preloadedId: id,
        error: null,
        preloadedProperty: property,
        source
      },
      revalidate: 3600 // Revalidar después de 1 hora
    };
  } catch (error) {
    console.error(`Error en getStaticProps para propiedad ${id}:`, error);
    return {
      props: {
        preloadedId: id,
        error: error.message,
        preloadedProperty: null,
        source
      },
      revalidate: 300 // Revalidar después de 5 minutos
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
  const isProduction = process.env.NODE_ENV === 'production';

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
        // En producción, mantenemos el loading un poco más para asegurar que todo se cargue
        if (isProduction) {
          setTimeout(() => setLoading(false), 1000);
        } else {
          setLoading(false);
        }
      }
    };
    
    loadProperty();
  }, [router.isReady, propertyId, source, preloadedProperty, preloadedError, isProduction]);

  // Función para generar la descripción meta
  const generateMetaDescription = (property) => {
    if (!property) return '';
    return `${property.type || 'Propiedad'} en ${property.location || 'Madrid'}. ${property.bedrooms || 0} habitaciones, ${property.bathrooms || 0} baños. ${property.description?.substring(0, 100) || ''}`
  };

  if (loading && isProduction) {
    return <LoadingScreen />;
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
