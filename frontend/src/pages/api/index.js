// Función para obtener las propiedades
export const getPropertyPosts = async () => {
  try {
    let mongoProperties = [];
    let wpProperties = [];
    let errors = [];
    let retryCount = 0;
    const MAX_RETRIES = 3;

    // Función de reintento con delay exponencial
    const retryWithDelay = async (fn, errorMessage) => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const result = await fn();
          return result;
        } catch (error) {
          lastError = error;
          const delay = Math.pow(2, i) * 2000; // 2s, 4s, 8s
          console.log(`Reintento ${i + 1}/${MAX_RETRIES} después de ${delay}ms: ${errorMessage}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      throw lastError;
    };

    // Intentar obtener propiedades de MongoDB
    try {
      console.log('Obteniendo propiedades de MongoDB...');
      const fetchMongo = async () => {
        const mongoResponse = await fetch('https://goza-madrid.onrender.com/property', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        if (!mongoResponse.ok) {
          throw new Error(`Error MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
        }

        return mongoResponse.json();
      };

      const mongoData = await retryWithDelay(fetchMongo, 'Error al obtener propiedades de MongoDB');
      console.log(`Propiedades MongoDB obtenidas: ${mongoData.length}`);
      mongoProperties = mongoData.map(prop => ({ ...prop, source: 'mongodb' }));
    } catch (mongoError) {
      console.error('Error al conectar con MongoDB:', mongoError);
      errors.push(`Error al conectar con MongoDB: ${mongoError.message}`);
    }

    // Intentar obtener propiedades de WordPress
    try {
      console.log('Obteniendo propiedades de WordPress...');
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : '';
      
      const fetchWordPress = async () => {
        // En producción, solicitar el máximo de elementos por página
        const per_page = process.env.NODE_ENV === 'production' ? 100 : 10;
        const wpResponse = await fetch(`${baseUrl}/api/wordpress-proxy?path=products&per_page=${per_page}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        if (!wpResponse.ok && wpResponse.status !== 503) {
          throw new Error(`Error WordPress: ${wpResponse.status} ${wpResponse.statusText}`);
        }

        const data = await wpResponse.json();
        return Array.isArray(data) ? data : [];
      };

      const wpData = await retryWithDelay(fetchWordPress, 'Error al obtener propiedades de WordPress');
      console.log(`Propiedades WordPress obtenidas: ${wpData.length}`);
      wpProperties = wpData.map(prop => ({ ...prop, source: 'woocommerce' }));
    } catch (wpError) {
      console.error('Error al conectar con WordPress:', wpError);
      errors.push(`Error al conectar con WordPress: ${wpError.message}`);
    }

    // Combinar y devolver todas las propiedades disponibles
    const allProperties = [...mongoProperties, ...wpProperties];
    
    console.log(`Total de propiedades obtenidas: ${allProperties.length} (MongoDB: ${mongoProperties.length}, WordPress: ${wpProperties.length})`);
    
    // Si no hay propiedades de ninguna fuente y hay errores, lanzar excepción
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