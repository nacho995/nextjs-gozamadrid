import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';
import config from '@/config/config';

// Función auxiliar simplificada para detectar el tipo de propiedad por ID
const detectSourceFromId = (id) => {
  if (!id) {
    return 'woocommerce'; // valor por defecto
  }
  
  const idStr = String(id);
  
  // MongoDB IDs son ObjectId con 24 caracteres hexadecimales
  if (/^[a-f\d]{24}$/i.test(idStr)) {
    console.log(`[detectSourceFromId] ID ${idStr} detectado como MongoDB`);
    return 'mongodb';
  }
  
  // WooCommerce IDs son típicamente numéricos
  if (/^\d+$/.test(idStr)) {
    console.log(`[detectSourceFromId] ID ${idStr} detectado como WooCommerce`);
    return 'woocommerce';
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
  
  // Valor por defecto
  console.log(`[detectSourceFromId] Usando valor por defecto 'woocommerce' para ID ${idStr}`);
  return 'woocommerce';
};

// Función para obtener una propiedad por ID con reintentos
const fetchProperty = async (id, source, isServer = false, retries = 3) => {
  if (!id) {
    return { property: null, error: 'ID de propiedad no proporcionado' };
  }

  // Construir la URL base según el entorno
  const baseUrl = isServer 
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://www.realestategozamadrid.com')
    : '';

  // Construir la URL según la fuente
  let url;
  if (source === 'mongodb') {
    url = `${baseUrl}/api/properties/sources/mongodb/${id}`;
  } else {
    url = `${baseUrl}/api/properties/sources/woocommerce/${id}`;
  }

  console.log(`[fetchProperty] Intentando obtener propiedad de ${url}`);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return { property: data, error: null };
    } catch (error) {
      console.error(`[fetchProperty] Intento ${attempt + 1} fallido:`, error);
      if (attempt === retries - 1) {
        return { property: null, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Añadir getStaticPaths para manejar rutas dinámicas
export async function getStaticPaths() {
  console.log('[getStaticPaths] Generando rutas estáticas para propiedades...');
  
  try {
    console.log('[getStaticPaths] Intentando obtener propiedades de MongoDB...');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.realestategozamadrid.com';
    const mongodbUrl = `${baseUrl}/api/properties/sources/mongodb`;
    
    console.log('[getStaticPaths] URL de MongoDB:', mongodbUrl);
    
    const response = await fetch(mongodbUrl);
    const properties = await response.json();
    
    // Generar paths para cada propiedad
    const paths = properties.map((property) => ({
      params: { id: property._id.toString() }
    }));

    return {
      paths,
      fallback: true // Permitir generación bajo demanda
    };
  } catch (error) {
    console.log('[getStaticPaths] Error al generar rutas:', error);
    
    // En caso de error, devolver paths vacío pero permitir fallback
    return {
      paths: [],
      fallback: true
    };
  }
}

// Añadir getStaticProps para pre-renderizar la página
export async function getStaticProps({ params }) {
  const { id } = params;
  
  // Determinar si es una propiedad de MongoDB o WooCommerce
  const source = detectSourceFromId(id);
  console.log(`[getStaticProps] ID: ${id}, Fuente detectada: ${source}`);
  
  try {
    const { property, error } = await fetchProperty(id, source, true);
    
    if (error) {
      console.error(`[getStaticProps] Error al obtener propiedad:`, error);
      return {
        props: {
          preloadedId: id,
          error: error,
          preloadedProperty: null,
          source
        },
        revalidate: 60 // Revalidar cada minuto si hay error
      };
    }
    
    if (!property) {
      console.log(`[getStaticProps] No se encontró la propiedad con ID ${id}`);
      return {
        props: {
          preloadedId: id,
          error: "Propiedad no encontrada",
          preloadedProperty: null,
          source
        },
        revalidate: 60
      };
    }

    console.log(`[getStaticProps] Propiedad obtenida correctamente:`, {
      id: property._id || property.id,
      source: property.source,
      title: property.title || property.name
    });
    
    return {
      props: {
        preloadedId: id,
        error: null,
        preloadedProperty: property,
        source
      },
      revalidate: 300 // Revalidar cada 5 minutos si todo está bien
    };
  } catch (error) {
    console.error(`[getStaticProps] Error inesperado:`, error);
    return {
      props: {
        preloadedId: id,
        error: error.message,
        preloadedProperty: null,
        source
      },
      revalidate: 60
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
  const source = routerSource || initialSource || detectSourceFromId(propertyId);
  
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Si ya tenemos la propiedad precargada y no hay error, no cargar de nuevo
    if (preloadedProperty && !preloadedError) {
      console.log('[PropertyDetail] Usando propiedad precargada:', {
        id: preloadedProperty._id || preloadedProperty.id,
        source: preloadedProperty.source
      });
      setProperty(preloadedProperty);
      setLoading(false);
      return;
    }
    
    // Si no tenemos ID o el router no está listo, no hacer nada
    if (!propertyId || !router.isReady) {
      return;
    }
    
    const loadProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`[PropertyDetail] Cargando propiedad ID: ${propertyId}, Fuente: ${source}`);
        const { property: propertyData, error: fetchError } = await fetchProperty(propertyId, source, false);
        
        if (fetchError) {
          console.error('[PropertyDetail] Error al cargar:', fetchError);
          throw new Error(fetchError);
        }
        
        if (!propertyData) {
          console.error('[PropertyDetail] No se recibieron datos de la propiedad');
          throw new Error('No se pudo obtener la información de la propiedad');
        }
        
        console.log('[PropertyDetail] Propiedad cargada:', {
          id: propertyData._id || propertyData.id,
          source: propertyData.source,
          title: propertyData.title || propertyData.name
        });
        
        setProperty(propertyData);
      } catch (err) {
        console.error('[PropertyDetail] Error en loadProperty:', err);
        setError(err.message || 'Error al cargar la propiedad');
      } finally {
        if (isProduction) {
          setTimeout(() => setLoading(false), 500);
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

        {/* Schema.org */}
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
            }
          })}
        </script>
      </Head>

      <DefaultPropertyContent property={property} />
    </>
  );
}
