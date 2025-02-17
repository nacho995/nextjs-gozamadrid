export async function getCountryPrefix() {
  const response = await fetch('http://localhost:3000/prefix', {
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
  const response = await fetch('http://localhost:3000/blog', {
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
  const response = await fetch(`http://localhost:3000/blog/${id}`, {
      method: 'DELETE',
  })

  return response.json()
}


export async function getBlogById(id) {
  // Usamos el puerto 3001, si ese es el puerto donde corre tu API Express
  const response = await fetch(`http://localhost:3000/blog/${id}`, {
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
  const response = await fetch(`http://localhost:3000/property`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al obtener los property posts')
  }

  return response.json()
}
export async function getPropertyById(id) {
  const response = await fetch(`http://localhost:3000/property/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al obtener el property post')
  }

  return response.json()
}