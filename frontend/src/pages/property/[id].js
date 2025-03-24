import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import LoadingScreen from '@/components/LoadingScreen';
import wooConfig from '@/config/woocommerce';
import Link from 'next/link';

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
const fetchProperty = async (id, source, retries = 3) => {
  if (!id) {
    return { property: null, error: 'ID de propiedad no proporcionado' };
  }

  // Construir URL usando siempre el proxy API para evitar problemas de mixed content
  let url;
  if (source === 'mongodb') {
    // Usar proxy API para MongoDB
    url = `/api/proxy/backend/properties/sources/mongodb/${id}`;
  } else {
    // Usar proxy API para WooCommerce
    url = `/api/proxy/backend/properties/sources/woocommerce/${id}`;
  }

  console.log(`[fetchProperty] Intentando obtener propiedad de ${url}`);

  let fallbackMode = false;
  let lastResponse = null;
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Configurar timeout y opciones de fetch
      const controller = new AbortController();
      const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || 10000, 10);
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      console.log(`[fetchProperty] Intento ${attempt + 1}/${retries} con timeout de ${timeout}ms`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        redirect: 'follow', // Seguir redirecciones automáticamente
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      lastResponse = response;

      // Código 207 significa que tenemos datos de fallback
      if (response.status === 207) {
        const data = await response.json();
        fallbackMode = true;
        console.log(`[fetchProperty] Datos de fallback recibidos en intento ${attempt + 1}:`, data);
        return { property: data, error: null, fallbackMode: true };
      }

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return { property: data, error: null, fallbackMode: false };
    } catch (error) {
      lastError = error;
      console.error(`[fetchProperty] Intento ${attempt + 1} fallido:`, error);
      
      // Si es error de timeout o conexión, esperar antes de reintentar
      if (error.name === 'AbortError' || error.message.includes('fetch failed')) {
        console.log(`[fetchProperty] Error de timeout o conexión, esperando antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
      
      // Si es el último intento, probar con el proxy directo de WooCommerce
      if (attempt === retries - 1 && source === 'woocommerce') {
        console.log('[fetchProperty] Intentando acceder directamente a la API de WooCommerce');
        const { property: fallbackProperty, fallbackMode: isFallback } = await fetchDirectFromWooCommerce(id);
        
        if (fallbackProperty) {
          console.log('[fetchProperty] Éxito con el proxy directo a WooCommerce');
          return { 
            property: fallbackProperty, 
            error: null, 
            fallbackMode: isFallback || true 
          };
        }
      }
      
      // Si ya estamos en el último intento y tenemos una respuesta previa con fallback
      if (attempt === retries - 1) {
        if (lastResponse && lastResponse.status === 207) {
          try {
            const fallbackData = await lastResponse.json();
            return { property: fallbackData, error: null, fallbackMode: true };
          } catch (parseError) {
            // Si no podemos parsear la respuesta, seguimos con el error original
          }
        }
        
        return { property: null, error: lastError?.message || 'Error desconocido', fallbackMode: false };
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Esto no debería ejecutarse nunca si los reintentos funcionan correctamente
  return { property: null, error: 'Número máximo de intentos alcanzado', fallbackMode: false };
};

// Función para obtener directamente datos de WooCommerce
const fetchDirectFromWooCommerce = async (id) => {
  try {
    // Verificar si tenemos credenciales
    if (!wooConfig.hasCredentials()) {
      console.log('[fetchDirectFromWooCommerce] No hay credenciales de WooCommerce configuradas');
    }
    
    // Si estamos en Vercel, añadir un log adicional
    if (wooConfig.isVercel) {
      console.log(`[fetchDirectFromWooCommerce] Ejecutando en Vercel (${process.env.VERCEL_ENV})`);
    }
    
    // Determinar tiempos de espera
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10);
    console.log(`[fetchDirectFromWooCommerce] Usando timeout de ${timeout}ms`);
    
    // Intentar primero usando el endpoint específico para productos
    const proxyUrl = `/api/proxy/woocommerce-product/${id}`;
    console.log(`[fetchDirectFromWooCommerce] Intentando obtener datos desde: ${proxyUrl}`);
    
    // Crear controlador para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`[fetchDirectFromWooCommerce] Abortando por timeout después de ${timeout}ms`);
    }, timeout);
    
    let response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });
    
    // Log detallado de la respuesta
    console.log(`[fetchDirectFromWooCommerce] Respuesta inicial: ${response.status} ${response.statusText}`);
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[fetchDirectFromWooCommerce] Datos recibidos correctamente');
      
      // Verificar que tenemos los datos necesarios
      if (data && (data.id || data._id)) {
        return { property: data, fallbackMode: true };
      } else {
        console.error('[fetchDirectFromWooCommerce] Respuesta no contiene datos válidos de la propiedad');
      }
    } else {
      console.error(`[fetchDirectFromWooCommerce] Error HTTP: ${response.status}`);
    }
    
    // Si falló el primer intento, intentar con otro endpoint
    console.log('[fetchDirectFromWooCommerce] Intentando endpoint alternativo...');
    
    // Usar el proxy de backend como alternativa
    const backupUrl = `/api/proxy/backend/properties/sources/woocommerce/${id}`;
    console.log(`[fetchDirectFromWooCommerce] Intentando alternativa: ${backupUrl}`);
    
    const backupController = new AbortController();
    const backupTimeoutId = setTimeout(() => backupController.abort(), timeout);
    
    try {
      const backupResponse = await fetch(backupUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: backupController.signal
      });
      
      clearTimeout(backupTimeoutId);
      
      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        console.log('[fetchDirectFromWooCommerce] Datos recibidos de alternativa');
        return { property: backupData, fallbackMode: true };
      }
    } catch (backupError) {
      console.error('[fetchDirectFromWooCommerce] Error en endpoint alternativo:', backupError);
    }
    
    // Si todo falla, intentamos directamente via WooCommerce API
    console.log('[fetchDirectFromWooCommerce] Intentando como último recurso directamente a WooCommerce...');
    
    const apiController = new AbortController();
    const apiTimeoutId = setTimeout(() => apiController.abort(), timeout);
    
    try {
      // IMPORTANTE: Aquí usamos el proxy en vez de la llamada directa para evitar mixed content
      const apiUrl = `/api/proxy/woocommerce/products/${id}`;
      
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: apiController.signal
      });
      
      clearTimeout(apiTimeoutId);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('[fetchDirectFromWooCommerce] Datos recibidos directamente de WooCommerce API');
        return { property: apiData, fallbackMode: true };
      }
    } catch (apiError) {
      console.error('[fetchDirectFromWooCommerce] Error en llamada directa:', apiError);
    }
  } catch (error) {
    console.error('[fetchDirectFromWooCommerce] Error general:', error);
  }
  
  return { property: null, fallbackMode: false };
};

// Función para normalizar datos de WooCommerce al formato esperado
const normalizeWooCommerceData = (wooProduct) => {
  if (!wooProduct) return null;
  
  // Extraer categorías
  const categories = wooProduct.categories ? 
    wooProduct.categories.map(cat => cat.name).join(', ') : '';
  
  // Extraer metadatos para facilitar su uso
  const metaData = {};
  if (wooProduct.meta_data && Array.isArray(wooProduct.meta_data)) {
    wooProduct.meta_data.forEach(meta => {
      metaData[meta.key] = meta.value;
    });
  }
  
  // Verificar la existencia de los campos en meta_data para evitar undefined
  const livingArea = metaData['living_area'] || '0';
  const bedrooms = metaData['bedrooms'] || '0';
  const bathrooms = metaData['baños'] || '0';
  const floor = metaData['Planta'] || '0';
  const address = metaData['address'] || '';
  
  console.log('[normalizeWooCommerceData] Meta data extraído:', {
    livingArea,
    bedrooms,
    bathrooms,
    floor,
    address,
    metaCount: wooProduct.meta_data ? wooProduct.meta_data.length : 0
  });
  
  // Extraer atributos
  const attributes = {};
  if (wooProduct.attributes && Array.isArray(wooProduct.attributes)) {
    wooProduct.attributes.forEach(attr => {
      if (attr.name && attr.options && attr.options.length > 0) {
        // Convertir nombre de atributo a formato camelCase para nuestro uso
        const key = attr.name.toLowerCase()
          .replace(/pa_/, '') // Eliminar prefijo pa_
          .replace(/-(.)/g, (_, char) => char.toUpperCase()); // convertir a camelCase
        
        attributes[key] = attr.options[0]; // Tomar el primer valor
      }
    });
  }
  
  // Obtener la primera imagen manteniendo la estructura completa
  const featuredImage = wooProduct.images && wooProduct.images.length > 0 
    ? wooProduct.images[0]
    : null;
  
  // Obtener todas las imágenes manteniendo la estructura completa
  const images = wooProduct.images 
    ? wooProduct.images.map(img => ({
        id: img.id,
        src: img.src,
        name: img.name || '',
        alt: img.alt || wooProduct.name || 'Imagen de propiedad'
      }))
    : [];
  
  return {
    id: wooProduct.id,
    name: wooProduct.name,
    title: wooProduct.name,
    description: wooProduct.description,
    shortDescription: wooProduct.short_description,
    price: wooProduct.price,
    regularPrice: wooProduct.regular_price,
    salePrice: wooProduct.sale_price,
    onSale: wooProduct.on_sale,
    stockStatus: wooProduct.stock_status,
    images: images,
    featuredImage: featuredImage && featuredImage.src,
    permalink: wooProduct.permalink,
    categories: categories,
    // Mapear metadatos específicos de propiedades
    type: metaData.propertyType || attributes.type || attributes.tipoDePropiedad || '',
    location: metaData.location || address || attributes.ubicacion || attributes.location || '',
    bedrooms: bedrooms || attributes.habitaciones || attributes.bedrooms || '0',
    bathrooms: bathrooms || attributes.banos || attributes.bathrooms || '0',
    size: livingArea || metaData.superficie || attributes.superficie || attributes.size || '0',
    floor: floor || '0',
    // Incluir metadatos originales para referencia
    metaData: metaData,
    attributes: attributes,
    // Marcar como proveniente de WooCommerce
    source: 'woocommerce_direct',
    // Incluir datos extras para debugging si están disponibles
    debug: {
      id: wooProduct.id,
      hasMetaData: !!wooProduct.meta_data,
      metaDataCount: wooProduct.meta_data ? wooProduct.meta_data.length : 0,
      imageCount: wooProduct.images ? wooProduct.images.length : 0
    }
  };
};

export default function PropertyDetail() {
  const router = useRouter();
  const { id, source: routerSource } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  const source = routerSource || detectSourceFromId(id);
  const isProduction = process.env.NODE_ENV === 'production';

  // MUEVO ESTA CONDICIÓN DENTRO DEL USE EFFECT
  // if (!id || !router.isReady) {
  //  return <LoadingScreen />;
  // }

  useEffect(() => {
    // Si no hay ID o el router no está listo, no hacer nada
    if (!id || !router.isReady) {
      return;
    }
    
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      const detectedSource = detectSourceFromId(id);
      console.log(`[PropertyID] Fuente detectada para ID ${id}: ${detectedSource}`);
      
      // Si es una propiedad de MongoDB
      if (detectedSource === 'mongodb') {
        try {
          console.log(`[PropertyID] Obteniendo propiedad de MongoDB con ID ${id}`);
          // Construir la URL para obtener la propiedad de MongoDB
          const mongoDBUrl = `/api/properties/sources/mongodb/${id}`;
          
          const response = await fetch(mongoDBUrl);
          
          if (response.ok) {
            const propertyData = await response.json();
            
            if (propertyData) {
              console.log(`[PropertyID] Propiedad MongoDB encontrada: ${propertyData.title || 'Sin título'}`);
              setProperty({
                ...propertyData,
                source: 'mongodb'
              });
              setLoading(false);
              return;
            }
          } else {
            // Si falla, intentar con API alternativa
            const fallbackUrl = `/api/proxy/mongodb/${id}`;
            console.log(`[PropertyID] Intentando con API alternativa: ${fallbackUrl}`);
            
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setProperty({
                ...fallbackData,
                source: 'mongodb'
              });
              setLoading(false);
              return;
            }
            
            throw new Error(`No se pudo obtener la propiedad de MongoDB con ID ${id}`);
          }
        } catch (error) {
          console.error(`[PropertyID] Error al cargar propiedad de MongoDB:`, error);
          setError(`Error al cargar la propiedad: ${error.message}`);
          setLoading(false);
          return;
        }
      } 
      
      // Si es una propiedad de WooCommerce (o no se pudo determinar)
      try {
        // CORRECCIÓN: Usamos la URL directa a la API de WooCommerce para asegurar que todas las imágenes se obtienen
        const wooUrl = `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products/${id}?consumer_key=ck_d69e61427264a7beea70ca9ee543b45dd00cae85&consumer_secret=cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e`;
        console.log(`[PropertyID] Obteniendo propiedad con ID ${id} directamente de WooCommerce`);
        
        const response = await fetch(wooUrl);
        
        if (response.ok) {
          const propertyData = await response.json();
          
          if (propertyData) {
            console.log(`[PropertyID] Propiedad encontrada: ${propertyData.name || 'Sin nombre'}`);
            console.log(`[PropertyID] Imágenes encontradas: ${propertyData.images ? propertyData.images.length : 0}`);
            
            if (propertyData.images && propertyData.images.length > 0) {
              console.log('[PropertyID] Primera imagen:', propertyData.images[0]);
            }
            
            setProperty(normalizeWooCommerceData(propertyData));
            setLoading(false);
            return;
          }
        } else {
          // Si falla la conexión directa, intentamos con el proxy
          console.log('[PropertyID] No se pudo obtener la propiedad directamente, intentando con proxy...');
          const proxyUrl = `/api/proxy/woocommerce/products?include=${id}`;
          
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            
            // Verificar si hay resultados y procesar la propiedad correcta
            if (Array.isArray(data) && data.length > 0) {
              // Encontrar la propiedad específica por ID
              const propertyData = data.find(item => item.id.toString() === id.toString());
              
              if (propertyData) {
                console.log(`[PropertyID] Propiedad encontrada vía proxy: ${propertyData.name || 'Sin nombre'}`);
                console.log(`[PropertyID] Imágenes encontradas: ${propertyData.images ? propertyData.images.length : 0}`);
                setProperty(normalizeWooCommerceData(propertyData));
                setLoading(false);
                return;
              }
            }
          }
          
          // Si también falla el proxy, lanzamos un error
          throw new Error(`No se pudo obtener la propiedad con ID ${id}`);
        }
      } catch (err) {
        console.error(`[PropertyID] Error al cargar propiedad:`, err);
        setError(`Error al cargar la propiedad: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id, router.isReady]);

  // Función para generar la descripción meta
  const generateMetaDescription = (property) => {
    if (!property) return '';
    return `${property.type || 'Propiedad'} en ${property.location || 'Madrid'}. ${property.bedrooms || 0} habitaciones, ${property.bathrooms || 0} baños. ${property.description?.substring(0, 100) || ''}`
  };

  // Componente para mostrar cuando la propiedad no se encuentra
  const PropertyNotFound = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Propiedad no encontrada</h1>
        <p className="text-gray-700 mb-6">
          Lo sentimos, la propiedad con ID {id} no existe o ya no está disponible.
        </p>
        
        {error && error.suggestions && error.suggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">¿Quizás te interese?</h2>
            <div className="grid grid-cols-1 gap-4">
              {error.suggestions.map(suggestion => (
                <div 
                  key={suggestion.id} 
                  className="border border-gray-200 rounded p-3 hover:bg-blue-50 transition cursor-pointer text-left"
                  onClick={() => router.push(`/property/${suggestion.id}`)}
                >
                  <p className="font-medium">{suggestion.name}</p>
                  {suggestion.price && (
                    <p className="text-green-600">{Number(suggestion.price).toLocaleString('es-ES')} €</p>
                  )}
                  {suggestion.images && suggestion.images.length > 0 && (
                    <img 
                      src={suggestion.images[0]} 
                      alt={suggestion.name} 
                      className="w-full h-40 object-cover mt-2 rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <Link href="/properties" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Ver todas las propiedades
          </Link>
          <button 
            onClick={() => router.push('/api/proxy/woocommerce-product')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver propiedades disponibles
          </button>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );

  // Manejar los diferentes estados de renderizado
  // Si el router no está listo o no hay ID, mostrar pantalla de carga
  if (!id || !router.isReady) {
    return <LoadingScreen />;
  }

  if (loading && isProduction) {
    return <LoadingScreen />;
  }

  if (error === 'not_found' || (error && error.type === 'not_found')) {
    return <PropertyNotFound />;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error | Goza Madrid Inmobiliaria</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="container mx-auto py-12 text-center bg-white shadow-xl rounded-lg p-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Lo sentimos</h2>
            <p className="text-lg mb-2">Ha ocurrido un problema al cargar la propiedad.</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500 mb-8">Puede ser un problema temporal o que la propiedad ya no esté disponible.</p>
            <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
              <button 
                onClick={() => router.reload()}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded-lg mb-2 md:mb-0"
              >
                Reintentar
              </button>
              <button 
                onClick={() => router.push('/propiedades')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg mb-2 md:mb-0"
              >
                Ver otras propiedades
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 px-8 rounded-lg"
              >
                Volver a inicio
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Si no hay datos de propiedad pero tampoco hay error, seguimos en carga
  if (!property) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>{`${property.type || 'Propiedad'} en ${property.location || 'Madrid'} | Goza Madrid`}</title>
        <meta name="description" content={generateMetaDescription(property)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://realestategozamadrid.com/property/${id}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`} />
        <meta property="og:description" content={generateMetaDescription(property)} />
        <meta property="og:image" content={
          property.images && property.images.length > 0 
            ? (typeof property.images[0] === 'string' 
                ? property.images[0] 
                : (property.images[0].src || '/img/default-property-image.jpg'))
            : '/img/default-property-image.jpg'
        } />
        <meta property="og:url" content={`https://realestategozamadrid.com/property/${id}`} />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`} />
        <meta name="twitter:description" content={generateMetaDescription(property)} />
        <meta name="twitter:image" content={
          property.images && property.images.length > 0 
            ? (typeof property.images[0] === 'string' 
                ? property.images[0] 
                : (property.images[0].src || '/img/default-property-image.jpg'))
            : '/img/default-property-image.jpg'
        } />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": `${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`,
            "description": property.description,
            "url": `https://realestategozamadrid.com/property/${id}`,
            "datePosted": property.createdAt,
            "image": property.images && property.images.length > 0 
              ? property.images.map(img => typeof img === 'string' ? img : img.src)
              : ['/img/default-property.jpg'],
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

      {/* Mostrar alerta cuando estamos en modo fallback */}
      {isFallbackMode && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 mx-4 md:mx-8 lg:mx-auto lg:max-w-6xl rounded shadow-md" role="alert">
          <div className="flex items-center">
            <div className="py-1 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Información temporal disponible</p>
              <p className="text-sm">Estamos experimentando problemas al conectar con nuestra base de datos. La información mostrada es limitada.</p>
            </div>
          </div>
        </div>
      )}

      <DefaultPropertyContent property={property} />
    </>
  );
}
