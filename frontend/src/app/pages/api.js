export async function getCountryPrefix(data) {
  const response = await fetch('http://localhost:3000/prefix', {
   method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const countryPrefix = await response.json()
    return countryPrefix
  }

// Asegúrate de que getBlogPosts() esté correctamente definido
export async function getBlogPosts() {
  const response = await fetch('http://localhost:3000/blog', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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


  