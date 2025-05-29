import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // Probar escribir en KV
    await kv.set('test-key', { message: 'Vercel KV funciona!', timestamp: new Date().toISOString() });
    
    // Probar leer de KV
    const data = await kv.get('test-key');
    
    res.status(200).json({
      success: true,
      kvWorking: true,
      data,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
        urlLength: process.env.KV_REST_API_URL?.length || 0,
        tokenLength: process.env.KV_REST_API_TOKEN?.length || 0
      }
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      kvWorking: false,
      error: error.message,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
        urlLength: process.env.KV_REST_API_URL?.length || 0,
        tokenLength: process.env.KV_REST_API_TOKEN?.length || 0
      }
    });
  }
} 