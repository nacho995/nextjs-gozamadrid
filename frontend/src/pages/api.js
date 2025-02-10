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

