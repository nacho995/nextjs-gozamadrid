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
    <div className="container mx-auto p-4">
      <PropertyContentComponent property={property} />
    </div>
  );
};

PropertyDetail.getInitialProps = async ({ query }) => {
  const { id } = query;
  console.log("Parámetro id recibido:", id);
  try {
    const property = await getPropertyById(id);
    console.log("Datos de la propiedad:", property);
    return { property };
  } catch (error) {
    console.error("Error fetching property content:", error);
    return { property: null };
  }
};

export default PropertyDetail;
