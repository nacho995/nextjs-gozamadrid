/**
 * Script para actualizar coordenadas de propiedades en MongoDB
 * Ejecutar desde frontend/public/ con: node update-coordinates.js
 */

const coordinates = [
  {
    _id: "680629124e93b7cb1a817193",
    title: "Don Pedro",
    address: "La Latina",
    coordinates: { lat: 40.4086, lng: -3.7097 } // La Latina, Madrid
  },
  {
    _id: "683bfea5ffaf145919a3463b", 
    title: "Antonia Merce 2",
    address: "Antonia Merce",
    coordinates: { lat: 40.4231, lng: -3.6836 } // Calle Antonia Mercé, Madrid
  },
  {
    _id: "683c011affaf145919a3495c",
    title: "Padilla 80", 
    address: "Padilla 80",
    coordinates: { lat: 40.4284, lng: -3.6787 } // Calle Padilla 80, Madrid
  },
  {
    _id: "683c02d2ffaf145919a349f6",
    title: "Diego de León 60",
    address: "Diego de León",
    coordinates: { lat: 40.4403, lng: -3.6774 } // Calle Diego de León 60, Madrid
  },
  {
    _id: "683c0799ffaf145919a35112",
    title: "General Pardiñas 69",
    address: "General Pardiñas 69", 
    coordinates: { lat: 40.4326, lng: -3.6798 } // Calle General Pardiñas 69, Madrid
  },
  {
    _id: "683c0c0dffaf145919a3551b",
    title: "Ortega y Gasset 47",
    address: "Ortega u Gasset",
    coordinates: { lat: 40.4368, lng: -3.6829 } // Calle Ortega y Gasset 47, Madrid
  },
  {
    _id: "683c1098ffaf145919a355d7", 
    title: "General Díaz Porlier 95",
    address: "General Diaz Polier",
    coordinates: { lat: 40.4392, lng: -3.6742 } // Calle General Díaz Porlier 95, Madrid
  },
  {
    _id: "683c11efffaf145919a35764",
    title: "Ayala 94",
    address: "Ayala 94",
    coordinates: { lat: 40.4315, lng: -3.6775 } // Calle Ayala 94, Madrid
  },
  {
    _id: "683c136effaf145919a35847",
    title: "Montera 39", 
    address: "Montera 39",
    coordinates: { lat: 40.4186, lng: -3.7018 } // Calle Montera 39, Madrid (Sol)
  },
  {
    _id: "683c166fffaf145919a35f74",
    title: "Tetuán 20",
    address: "Tetuan", 
    coordinates: { lat: 40.4647, lng: -3.6986 } // Calle Tetuán 20, Madrid
  },
  {
    _id: "683c17e6ffaf145919a36247",
    title: "Isabel la Católica 7",
    address: "Isabel la Católica 7",
    coordinates: { lat: 40.4136, lng: -3.7053 } // Calle Isabel la Católica 7, Madrid
  },
  {
    _id: "683c1976ffaf145919a36449", 
    title: "Principe De Vergara 39",
    address: "Principe De Vergara 39",
    coordinates: { lat: 40.4251, lng: -3.6836 } // Calle Príncipe de Vergara 39, Madrid
  },
  {
    _id: "683c1bb5ffaf145919a3666d",
    title: "Diego de Leon 52",
    address: "Diego de Leon 52",
    coordinates: { lat: 40.4398, lng: -3.6775 } // Calle Diego de León 52, Madrid
  },
  {
    _id: "683c1c7dffaf145919a3679b",
    title: "Padilla 80",
    address: "Padilla", 
    coordinates: { lat: 40.4284, lng: -3.6787 } // Calle Padilla, Madrid
  },
  {
    _id: "683c1d4affaf145919a368c8",
    title: "Ventura de la Vega, 7",
    address: "Ventura de la vega",
    coordinates: { lat: 40.4153, lng: -3.6984 } // Calle Ventura de la Vega 7, Madrid
  },
  {
    _id: "683c1e18ffaf145919a36a09",
    title: "General Pardiñas 8", 
    address: "Genral Pardiñas 8",
    coordinates: { lat: 40.4268, lng: -3.6838 } // Calle General Pardiñas 8, Madrid
  },
  {
    _id: "683c1f95ffaf145919a36b48",
    title: "Hermosilla 121",
    address: "Hermosilla 121",
    coordinates: { lat: 40.4346, lng: -3.6756 } // Calle Hermosilla 121, Madrid
  }
];

// Función para actualizar coordenadas via API
async function updateCoordinates() {
  console.log('🚀 Iniciando actualización de coordenadas para 17 propiedades...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const property of coordinates) {
    try {
      console.log(`📍 Actualizando: ${property.title} (${property.address})`);
      
      const response = await fetch('/api/properties/update-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: property._id,
          coordinates: property.coordinates,
          title: property.title,
          address: property.address
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${property.title}: Coordenadas actualizadas exitosamente`);
        console.log(`   Lat: ${property.coordinates.lat}, Lng: ${property.coordinates.lng}`);
        successCount++;
      } else {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${property.title}:`, error.message);
      errorCount++;
    }
    
    // Pausa pequeña entre requests para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Resumen de actualización:');
  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📍 Total: ${coordinates.length}`);
  
  if (successCount === coordinates.length) {
    console.log('🎉 ¡Todas las coordenadas se actualizaron correctamente!');
  }
}

// Ejecutar si se corre directamente
if (typeof window !== 'undefined') {
  // Ejecutar desde el navegador
  updateCoordinates();
} else {
  // Exportar para uso en Node.js
  module.exports = { coordinates, updateCoordinates };
} 