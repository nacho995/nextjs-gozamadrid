/**
 * API Proxy para WordPress simplificado
 */
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    const fullUrl = `https://realestategozamadrid.com${url}`;
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'WordPress API error' });
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from WordPress API' });
  }
} 