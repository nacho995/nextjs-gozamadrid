import { NextResponse } from 'next/server';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Error proxying image:', error);
    res.redirect('/placeholder.jpg');
  }
} 