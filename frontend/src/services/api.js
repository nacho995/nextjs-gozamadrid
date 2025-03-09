// Función auxiliar para manejar errores
const handleApiError = (error, functionName) => {
  console.error(`Error en ${functionName}:`, error);
  if (error.response) {
    // El servidor respondió con un código de error
    throw new Error(`Error ${error.response.status}: ${error.response.statusText}`);
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    throw new Error('No se recibió respuesta del servidor');
  } else {
    // Error al configurar la petición
    throw new Error(error.message || 'Error desconocido');
  }
};

// Función para obtener una propiedad por ID
export const getPropertyById = async (id) => {
  try {
    const response = await fetch(`/api/woocommerce/products/${id}?consumer_key=${process.env.NEXT_PUBLIC_WC_CONSUMER_KEY}&consumer_secret=${process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, 'getPropertyById');
  }
};

// ... resto del código ... 