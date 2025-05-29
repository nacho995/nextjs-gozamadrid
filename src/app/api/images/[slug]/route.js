import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { slug } = params;
  
  // Lista de imágenes permitidas para seguridad
  const allowedImages = [
    'logonuevo.png',
    'logo.png',
    'manifest.json',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png'
  ];
  
  if (!allowedImages.includes(slug)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
  
  try {
    const imagePath = path.join(process.cwd(), 'public', slug);
    
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determinar el tipo de contenido
    let contentType = 'application/octet-stream';
    if (slug.endsWith('.png')) {
      contentType = 'image/png';
    } else if (slug.endsWith('.jpg') || slug.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (slug.endsWith('.json')) {
      contentType = 'application/json';
    } else if (slug.endsWith('.ico')) {
      contentType = 'image/x-icon';
    }
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 