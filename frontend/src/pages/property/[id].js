import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';
import { getPropertyById } from '@/pages/api';

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        console.log(`Obteniendo propiedad con ID: ${id}`);
        
        // Determinar si es un ID de MongoDB (generalmente un string largo hexadecimal)
        const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
        console.log(`¿Es un ID de MongoDB? ${isMongoId}`);
        
        const propertyData = await getPropertyById(id);
        console.log("Datos de propiedad obtenidos:", propertyData);
        
        if (!propertyData) {
          throw new Error("No se encontró la propiedad");
        }
        
        setProperty(propertyData);
      } catch (err) {
        console.error("Error al obtener la propiedad:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      
        <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div>
        </div>
     
    );
  }

  if (error) {
    return (
     
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => router.push('/property')}
            className="mt-6 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg"
          >
            Volver a propiedades
          </button>
        </div>
  
    );
  }

  return (
    <>
      {property ? (
        <DefaultPropertyContent property={property} />
      ) : (
        <div className="container mx-auto py-12 text-center">
          <p className="text-lg">No se encontró la propiedad</p>
        </div>
      )}
    </>
  );
}
