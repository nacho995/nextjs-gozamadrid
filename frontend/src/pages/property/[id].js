import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';

// Función para obtener una propiedad por ID
const fetchProperty = async (id) => {
  console.log(`Intentando obtener propiedad con ID: ${id}`);
  
  // Lista de URLs a probar, en orden de preferencia
  const urls = [
    `/api/wordpress-proxy?path=products/${id}`, // Intentar primero con el proxy de WordPress
    `https://goza-madrid.onrender.com/property/${id}`, // Luego con la URL directa al servidor
    `/property/${id}` // Finalmente con la URL relativa
  ];
  
  let lastError = null;
  
  // Probar cada URL hasta que una funcione
  for (const url of urls) {
    try {
      console.log(`Probando URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`Respuesta de ${url}: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`Error en respuesta de ${url}: ${response.status}`);
        lastError = new Error(`Error ${response.status}: ${response.statusText}`);
        continue; // Probar la siguiente URL
      }
      
      // Verificar el tipo de contenido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`Tipo de contenido no válido: ${contentType}`);
        lastError = new Error(`Tipo de contenido no válido: ${contentType}`);
        continue; // Probar la siguiente URL
      }
      
      // Intentar analizar la respuesta como JSON
      const data = await response.json();
      console.log(`Datos obtenidos correctamente de ${url}`);
      
      // Verificar que los datos sean válidos
      if (!data) {
        console.log(`Datos vacíos de ${url}`);
        lastError = new Error('Datos vacíos');
        continue; // Probar la siguiente URL
      }
      
      // Procesar los datos según la fuente
      const isWooCommerce = url.includes('wordpress-proxy');
      
      // Procesar las imágenes
      let images = [];
      if (data.images) {
        if (Array.isArray(data.images)) {
          images = data.images.map(img => typeof img === 'string' ? img : (img.src || img));
        } else if (typeof data.images === 'string') {
          images = [data.images];
        }
      } else if (data.image && data.image.src) {
        images = [data.image.src];
      }
      
      // Si no hay imágenes, usar una imagen por defecto
      if (!images.length) {
        images = ['/img/default-property-image.jpg'];
      }
      
      // Devolver los datos procesados
      return {
        ...data,
        id: data.id || data._id,
        title: data.title || data.name || 'Propiedad sin título',
        description: data.description || '',
        price: data.price || 0,
        location: data.location || data.address || 'Madrid',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        size: data.size || data.area || 0,
        images: images,
        source: isWooCommerce ? 'woocommerce' : 'mongodb'
      };
    } catch (error) {
      console.error(`Error al obtener propiedad de ${url}:`, error);
      lastError = error;
      // Continuar con la siguiente URL
    }
  }
  
  // Si llegamos aquí, ninguna URL funcionó
  throw lastError || new Error('No se pudo obtener la propiedad');
};

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Cargando propiedad con ID: ${id}`);
        
        const propertyData = await fetchProperty(id);
        
        console.log("Propiedad cargada correctamente:", propertyData);
        setProperty(propertyData);
      } catch (err) {
        console.error("Error al cargar la propiedad:", err);
        setError(err.message || "Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

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
        <link rel="canonical" href={`https://gozamadrid.com/property/${id}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${property.type || 'Propiedad'} en ${property.location || 'Madrid'}`} />
        <meta property="og:description" content={generateMetaDescription(property)} />
        <meta property="og:image" content={property.images?.[0] || '/img/default-property-image.jpg'} />
        <meta property="og:url" content={`https://gozamadrid.com/property/${id}`} />
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
            "url": `https://gozamadrid.com/property/${id}`,
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
