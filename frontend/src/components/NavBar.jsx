const handleImageError = (e) => {
  console.log('Error cargando imagen:', e);
  console.log('URL que falló:', e.target.src);
  
  // Intentar con una URL alternativa sin espacios
  const originalUrl = e.target.src;
  if (originalUrl.includes('%20')) {
    const fixedUrl = originalUrl.replace(/%20/g, '-');
    console.log('Intentando con URL alternativa:', fixedUrl);
    e.target.src = fixedUrl;
    return;
  }
  
  // Si ya intentamos arreglar la URL o no tiene espacios, usar imagen por defecto
  e.target.src = '/default-avatar.png'; // Asegúrate de tener esta imagen en tu carpeta public
};

<img 
  src={user.profilePic || '/default-avatar.png'} 
  alt={user.name || 'Usuario'} 
  className="rounded-full object-cover"
  onError={handleImageError}
/> 