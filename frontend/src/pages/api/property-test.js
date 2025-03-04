import { useEffect, useState } from 'react';
import { API_URL } from '@/config';

export default function PropertyTest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch(`${API_URL}/property`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperties();
  }, []);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Property API Test</h1>
      
      {loading && <p>Loading properties...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {properties.length > 0 ? (
        <div>
          <p className="mb-4">Found {properties.length} properties</p>
          <ul className="space-y-4">
            {properties.map(property => (
              <li key={property.id} className="border p-4 rounded">
                <h2 className="text-xl font-bold">{property.title || property.name}</h2>
                <p>ID: {property.id}</p>
                <p>Price: {property.price}</p>
                {property.images && property.images.length > 0 && (
                  <div className="mt-2">
                    <p>First image: {JSON.stringify(property.images[0])}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && !error && <p>No properties found</p>
      )}
    </div>
  );
} 