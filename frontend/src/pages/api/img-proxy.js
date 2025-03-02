export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  console.log(`[img-proxy] Procesando: ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  
  try {
    // Añadir un timeout para evitar solicitudes que tarden demasiado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    // Configuración mejorada para fetch
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    
    // Limpiar el timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Verificar que es una imagen válida
    const isImage = contentType.startsWith('image/') || contentType === 'application/octet-stream';
    if (!isImage || buffer.byteLength < 100) { // Si es muy pequeña, probablemente no es una imagen válida
      throw new Error(`Invalid image content: ${contentType}, size: ${buffer.byteLength} bytes`);
    }
    
    console.log(`[img-proxy] Éxito: ${url.substring(0, 50)}... (${contentType}, ${buffer.byteLength} bytes)`);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error(`[img-proxy] Error para ${url}:`, error.message);
    
    // SVG de respaldo directamente en la respuesta
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'>
      <rect width='300' height='200' fill='#f0f0f0'/>
      <text x='50%' y='50%' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='#999999'>Imagen no disponible</text>
      <text x='50%' y='130' font-size='12' text-anchor='middle' alignment-baseline='middle' font-family='Arial' fill='#666666'>${error.message.substring(0, 30)}...</text>
    </svg>`);
  }
} 