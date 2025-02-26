const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCountryPrefix() {
  const response = await fetch(`${API_URL}/prefix`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Verifica si la respuesta fue exitosa
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Verifica que la respuesta sea JSON antes de llamar a response.json()
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json(); // Si es JSON, lo procesamos
  } else {
    throw new Error('Response is not JSON');
  }
}
// src/pages/api/index.js
export async function getBlogPosts() {
  const response = await fetch(`${API_URL}/blog`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Verifica si la respuesta fue exitosa
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Verifica que la respuesta sea JSON antes de llamar a response.json()
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json(); // Si es JSON, lo procesamos
  } else {
    throw new Error('Response is not JSON');
  }
}

export async function deleteBlogPost(id) {
  const response = await fetch(`${API_URL}/blog/${id}`, {
    method: 'DELETE',
  });

  return response.json();
}

export async function getBlogById(id) {
  // Usamos el puerto 3001, si ese es el puerto donde corre tu API Express
  const response = await fetch(`${API_URL}/blog/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}
export async function getPropertyPosts() {
  const response = await fetch(`${API_URL}/property`);

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al obtener los property posts')
  }

  return response.json()
}
export async function getPropertyById(id) {
  const response = await fetch(`${API_URL}/property/${id}`);

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al obtener el property post')
  }

  return response.json()
}

export async function sendEmail(emailData) {
  try {
      const response = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              type: 'contact',
              data: emailData
          })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Error en la respuesta del servidor');
      }

      return data;
  } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error(error.message || 'Error al enviar el mensaje');
  }
}

export const sendPropertyEmail = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/api/property-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }

        return data;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error(error.message || 'Error al enviar el mensaje');
    }
};
