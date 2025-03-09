import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout';
import DirectImage from '@/components/DirectImage';
import DebugImage from '@/components/DebugImage';

// Ejemplos de imágenes para probar
const TEST_IMAGES = [
  {
    type: 'Local (uploads)',
    url: '/uploads/test-image.jpg',
    alt: 'Imagen de prueba local (uploads)'
  },
  {
    type: 'Local (estática)',
    url: '/fondoamarillo.jpg',
    alt: 'Imagen de prueba local (estática)'
  },
  {
    type: 'Externa (placeholder)',
    url: 'https://via.placeholder.com/400x300',
    alt: 'Imagen de prueba externa (placeholder)'
  },
  {
    type: 'Cloudinary (si está configurado)',
    url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    alt: 'Imagen de prueba de Cloudinary'
  }
];

export default function TestImagesPage() {
  const [customUrl, setCustomUrl] = useState('');
  const [customImages, setCustomImages] = useState([]);
  const [dbImages, setDbImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Intentar cargar algunas imágenes de la base de datos para pruebas
    const fetchDbImages = async () => {
      try {
        setLoading(true);
        // Usar el endpoint que tengas para obtener propiedades
        const response = await fetch('/api/properties?limit=2');
        
        if (response.ok) {
          const data = await response.json();
          
          // Extraer imágenes de las propiedades
          const images = [];
          
          if (Array.isArray(data)) {
            data.forEach(property => {
              if (property.images && Array.isArray(property.images)) {
                property.images.forEach((img, index) => {
                  let url = '';
                  
                  if (typeof img === 'string') {
                    url = img;
                  } else if (img.src) {
                    url = img.src;
                  } else if (img.url) {
                    url = img.url;
                  }
                  
                  if (url) {
                    images.push({
                      type: `DB (propiedad ${property._id || property.id}, imagen ${index})`,
                      url,
                      alt: `Imagen de propiedad ${property._id || property.id}`
                    });
                  }
                });
              }
            });
          }
          
          setDbImages(images);
        }
      } catch (error) {
        console.error('Error al cargar imágenes de la base de datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDbImages();
  }, []);

  const handleAddCustomImage = () => {
    if (customUrl) {
      setCustomImages([
        ...customImages,
        {
          type: 'Personalizada',
          url: customUrl,
          alt: 'Imagen personalizada'
        }
      ]);
      setCustomUrl('');
    }
  };

  return (
    <>
      <Head>
        <title>Prueba de Imágenes</title>
      </Head>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Prueba de Visualización de Imágenes</h1>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Añadir Imagen para Prueba</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="URL de la imagen a probar"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                onClick={handleAddCustomImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Añadir
              </button>
            </div>
          </div>
          
          {loading && (
            <div className="my-8 text-center">
              <p className="text-gray-600">Cargando imágenes...</p>
            </div>
          )}
          
          {/* Imágenes de prueba predefinidas */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Imágenes de Prueba</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEST_IMAGES.map((image, index) => (
                <div key={`test-${index}`} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b">
                    <h3 className="font-medium">{image.type}</h3>
                  </div>
                  <div className="p-4">
                    <DebugImage 
                      src={image.url} 
                      alt={image.alt} 
                      className="w-full h-48 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Imágenes personalizadas */}
          {customImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Imágenes Personalizadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customImages.map((image, index) => (
                  <div key={`custom-${index}`} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b">
                      <h3 className="font-medium">{image.type}</h3>
                    </div>
                    <div className="p-4">
                      <DebugImage 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Imágenes de la base de datos */}
          {dbImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Imágenes de la Base de Datos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dbImages.map((image, index) => (
                  <div key={`db-${index}`} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b">
                      <h3 className="font-medium">{image.type}</h3>
                    </div>
                    <div className="p-4">
                      <DebugImage 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {dbImages.length === 0 && !loading && (
            <div className="my-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">No se encontraron imágenes en la base de datos. Intenta navegar a la página de propiedades para ver si hay imágenes disponibles allí.</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
} 