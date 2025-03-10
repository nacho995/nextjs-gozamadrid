// Función para obtener las propiedades
export const getPropertyPosts = async () => {
  try {
    let mongoProperties = [];
    let wpProperties = [];
    let errors = [];

    // Intentar obtener propiedades de MongoDB
    try {
      console.log('Obteniendo propiedades de MongoDB...');
      const mongoResponse = await fetch('https://goza-madrid.onrender.com/property', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // Evitar caché
      });

      if (mongoResponse.ok) {
        const mongoData = await mongoResponse.json();
        console.log(`Propiedades MongoDB obtenidas: ${mongoData.length}`);
        mongoProperties = mongoData.map(prop => ({ ...prop, source: 'mongodb' }));
      } else {
        console.error(`Error MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
        errors.push(`Error al obtener propiedades de MongoDB: ${mongoResponse.statusText}`);
      }
    } catch (mongoError) {
      console.error('Error al conectar con MongoDB:', mongoError);
      errors.push(`Error al conectar con MongoDB: ${mongoError.message}`);
    }

    // Intentar obtener propiedades de WordPress
    try {
      console.log('Obteniendo propiedades de WordPress...');
      const wpResponse = await fetch(`${window.location.origin}/api/wordpress-proxy?path=products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // Evitar caché
      });

      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        console.log(`Propiedades WordPress obtenidas: ${wpData.length}`);
        wpProperties = wpData.map(prop => ({ ...prop, source: 'woocommerce' }));
      } else {
        console.error(`Error WordPress: ${wpResponse.status} ${wpResponse.statusText}`);
        errors.push(`Error al obtener propiedades de WordPress: ${wpResponse.statusText}`);
      }
    } catch (wpError) {
      console.error('Error al conectar con WordPress:', wpError);
      errors.push(`Error al conectar con WordPress: ${wpError.message}`);
    }

    // Combinar y devolver todas las propiedades disponibles
    const allProperties = [...mongoProperties, ...wpProperties];
    
    // Si no hay propiedades de ninguna fuente y hay errores, lanzar excepción
    if (allProperties.length === 0) {
      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      } else {
        throw new Error('No se encontraron propiedades disponibles');
      }
    }

    return allProperties;
  } catch (error) {
    console.error('Error al obtener las propiedades:', error);
    throw error;
  }
}; 