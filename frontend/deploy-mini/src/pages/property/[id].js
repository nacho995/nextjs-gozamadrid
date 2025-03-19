import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';
import { API_URL } from '@/pages/api';

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

  let url;
  
  // Construir la URL correcta según la fuente - MODIFICADO para acceso directo a APIs externas
  if (source === 'mongodb') {
    // Para MongoDB, usamos la ruta directa a la API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    url = `${baseUrl}/property/${id}`;
    console.log(`[fetchProperty] URL para MongoDB: ${url}`);
  } else {
    // Para WooCommerce, usamos la ruta directa a la API
    const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    url = `${WC_API_URL}/products/${id}?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
    console.log(`[fetchProperty] URL para WooCommerce: ${url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')}`);
  }
  
  try {
    console.log(`[fetchProperty] Intentando obtener propiedad desde: ${url.includes('consumer_key') ? url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&') : url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
    
    const fetchOptions = {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      },
      // Usar mode: 'cors' para solicitudes directas a APIs externas
      mode: 'cors'
    };
    
    const response = await fetch(url, fetchOptions).finally(() => clearTimeout(timeoutId));
    
    if (response.status === 503 && retries > 0) {
      console.log(`[fetchProperty] Servicio no disponible (503), reintentando en 3 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return fetchProperty(id, source, isServer, retries - 1);
    }
    
    if (!response.ok) {
      console.error(`[fetchProperty] Error al obtener la propiedad: ${response.status} ${response.statusText}`);
      
      // Intentar leer el cuerpo del error para diagnóstico
      try {
        const errorText = await response.text();
        console.error(`[fetchProperty] Detalle del error: ${errorText.slice(0, 200)}...`);
      } catch (e) {
        console.error(`[fetchProperty] No se pudo leer el detalle del error:`, e);
      }
      
      throw new Error(`Error al obtener la propiedad: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('La respuesta es null o undefined');
    }
    
    console.log(`[fetchProperty] Propiedad obtenida:`, 
      JSON.stringify({
        id: data._id || data.id,
        title: data.title || data.name,
        source: data.source || source
      })
    );
    
    // Agregar el origen de la propiedad si no está presente
    if (!data.source) {
      data.source = source;
    }
    
    // Post-procesar el resultado según el tipo de fuente
    let processedData = data;
    
    if (source === 'mongodb') {
      // Asegurarse de que las URLs de imágenes son absolutas
      if (data.images && Array.isArray(data.images)) {
        processedData.images = data.images.map(img => {
          if (typeof img === 'string' && !img.startsWith('http')) {
            return `${process.env.NEXT_PUBLIC_API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
          }
          return img;
        });
      }
    }
    
    return { property: processedData, error: null };
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    
    if ((error.name === 'AbortError' || error.name === 'TypeError') && retries > 0) {
      console.log(`[fetchProperty] Error de timeout o red, reintentando en 3 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return fetchProperty(id, source, isServer, retries - 1);
    }
    
    return { property: null, error: error.message };
  }
};

// Añadir getStaticPaths para manejar rutas dinámicas
export async function getStaticPaths() {
  // Para SSG, necesitamos pre-renderizar todas las rutas posibles
  console.log('Generando rutas estáticas para propiedades...');
  
  const paths = [];
  
  try {
    // Obtener propiedades de WooCommerce (hasta 3 páginas)
    for (let page = 1; page <= 3; page++) {
      try {
        // Para WooCommerce, usamos la ruta directa a la API
        const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
        const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
        const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
        const proxyUrl = `${WC_API_URL}/products?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}&per_page=100&page=${page}`;
        
        console.log(`[getStaticPaths] Obteniendo propiedades de WooCommerce, página ${page}`);
        
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const products = await response.json();
          
          if (Array.isArray(products) && products.length > 0) {
            console.log(`[getStaticPaths] Se encontraron ${products.length} propiedades de WooCommerce en página ${page}`);
            products.forEach(product => {
              paths.push({
                params: { id: product.id.toString() }
              });
            });
          }
          
          if (products.length < 100) {
            break;
          }
        } else {
          console.error(`[getStaticPaths] Error al obtener productos de WooCommerce: ${response.status} ${response.statusText}`);
          break;
        }
      } catch (pageError) {
        console.error(`[getStaticPaths] Error durante la obtención de productos de WooCommerce:`, pageError);
        break;
      }
    }
    
    // Intentar obtener propiedades de MongoDB usando la URL directa
    try {
      console.log('[getStaticPaths] Intentando obtener propiedades de MongoDB para rutas estáticas...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
      
      // Corregir la URL para asegurar que sea válida y no tenga "/api/properties/" al inicio
      const mongoUrl = `${API_URL}/property`;
      console.log(`[getStaticPaths] URL de MongoDB: ${mongoUrl}`);
      
      // Utilizar un timeout para la petición a MongoDB
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const mongoResponse = await fetch(mongoUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'User-Agent': 'GozaMadrid-Frontend/1.0'
        }
      }).finally(() => clearTimeout(timeoutId));
      
      if (mongoResponse.ok) {
        const mongoProperties = await mongoResponse.json();
        
        if (Array.isArray(mongoProperties) && mongoProperties.length > 0) {
          console.log(`[getStaticPaths] Encontradas ${mongoProperties.length} propiedades de MongoDB para rutas estáticas`);
          
          mongoProperties.forEach(property => {
            if (property._id) {
              paths.push({
                params: { id: property._id.toString() }
              });
              console.log(`[getStaticPaths] Añadida ruta para propiedad MongoDB con ID: ${property._id}`);
            }
          });
        } else {
          console.error('[getStaticPaths] No se encontraron propiedades de MongoDB o el formato no es válido');
        }
      } else {
        console.error(`[getStaticPaths] Error al obtener propiedades de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
        try {
          const errorText = await mongoResponse.text();
          console.error('[getStaticPaths] Detalle del error:', errorText.substring(0, 200));
        } catch (e) {
          console.error('[getStaticPaths] No se pudo leer el detalle del error');
        }
      }
    } catch (mongoError) {
      console.error('[getStaticPaths] Error al obtener propiedades de MongoDB para rutas estáticas:', mongoError);
    }
    
  } catch (error) {
    console.error('[getStaticPaths] Error general al generar rutas estáticas:', error);
  }
  
  // Si no pudimos obtener propiedades, incluir algunos IDs comunes
  if (paths.length === 0) {
    console.log('[getStaticPaths] No se obtuvieron propiedades, usando IDs comunes predefinidos');
    
    // IDs comunes de WooCommerce
    const commonWooCommerceIds = ['3945', '3895', '3772', '3313', '3291', '3268', '3157', '2844', '2829', '2763'];
    commonWooCommerceIds.forEach(id => {
      paths.push({ params: { id } });
    });
    
    // IDs de ejemplo para MongoDB (si los tienes)
    const commonMongoDBIds = ['65a6c0b9d89e1e3b84f1ed8c', '659da5dd7ad6c0b8c42f5e03'];
    commonMongoDBIds.forEach(id => {
      paths.push({ params: { id } });
    });
  }
  
  console.log(`[getStaticPaths] Generadas ${paths.length} rutas estáticas para propiedades`);
  
  return {
    paths,
    fallback: 'blocking' // 'blocking' en vez de true para mejorar SEO
  };
}

// Añadir getStaticProps para pre-renderizar la página
export async function getStaticProps({ params }) {
  const { id } = params;
  
  // Determinar si es una propiedad de MongoDB o WooCommerce
  const source = detectSourceFromId(id);
  
  try {
    const { property, error } = await fetchProperty(id, source, true);
    
    if (property) {
      return {
        props: {
          preloadedId: id,
          error: null,
          preloadedProperty: property,
          source
        }
      };
    }
    
    return {
      props: {
        preloadedId: id,
        error: null,
        preloadedProperty: null,
        source
      }
    };
    
  } catch (error) {
    return {
      props: {
        preloadedId: id,
        error: null,
        preloadedProperty: null,
        source
      }
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
        const { property: propertyData, error: fetchError } = await fetchProperty(propertyId, source, false);
        
        if (fetchError) {
          throw new Error(fetchError);
        }
        
        if (!propertyData) {
          throw new Error('No se pudo obtener la información de la propiedad');
        }
        
        setProperty(propertyData);
      } catch (err) {
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
