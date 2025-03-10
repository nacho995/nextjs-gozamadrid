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
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
      // Construir la URL base según el entorno
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'  // URL de desarrollo
        : '';  // En producción, usar path relativo
      
      const wpResponse = await fetch(`${baseUrl}/api/wordpress-proxy?path=products`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        // Si wpData es un array vacío debido a un error 503, no lo consideramos un error
        if (Array.isArray(wpData)) {
          console.log(`Propiedades WordPress obtenidas: ${wpData.length}`);
          wpProperties = wpData.map(prop => ({ ...prop, source: 'woocommerce' }));
        }
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
    // pero solo si AMBAS fuentes fallaron
    if (allProperties.length === 0 && errors.length >= 2) {
      throw new Error(errors.join('. '));
    }

    // Devolver las propiedades que pudimos obtener
    return allProperties;
  } catch (error) {
    console.error('Error al obtener las propiedades:', error);
    // En caso de error total, devolver array vacío en lugar de lanzar error
    return [];
  }
}; 