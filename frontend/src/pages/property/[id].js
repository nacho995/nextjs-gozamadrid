import React from 'react';
import DefaultPropertyContent from '@/components/propiedades/PropertyContent';

import { getPropertyById } from '../api';

const PropertyDetail = ({ property }) => {
  if (!property) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center">Propiedad no encontrada</h1>
      </div>
    );
  }

  // Selecciona la plantilla en función del campo `template`
  let PropertyContentComponent;
  switch (property.template) {
    case "estiloA":
      PropertyContentComponent = EstiloAPropertyContent;
      break;
    case "default":
    default:
      PropertyContentComponent = DefaultPropertyContent;
  }

  return (
    <>
      {/* Fondo fijo común */}
      <div
        className="fixed inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/gozamadridwp.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Contenido existente */}
      <div className="relative z-10">
        <div className="container mx-auto p-4">
          <PropertyContentComponent property={property} />
        </div>
      </div>
    </>
  );
};

PropertyDetail.getInitialProps = async ({ query }) => {
  try {
    const { id } = query;
    if (!id) return { property: null };
    
    // Usar la función modificada
    const property = await getPropertyById(id);
    return { property };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { property: null, error: 'No pudimos cargar esta propiedad' };
  }
};

export default PropertyDetail;
