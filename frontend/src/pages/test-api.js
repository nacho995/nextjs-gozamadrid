import { useState, useEffect } from 'react';

export default function TestAPI() {
  const [wpPosts, setWpPosts] = useState(null);
  const [wpError, setWpError] = useState(null);
  const [wooProducts, setWooProducts] = useState(null);
  const [wooError, setWooError] = useState(null);
  const [loading, setLoading] = useState({ wp: false, woo: false });

  // Función para probar la API de WordPress
  const testWordPressAPI = async () => {
    setLoading(prev => ({ ...prev, wp: true }));
    setWpError(null);
    
    try {
      const response = await fetch('/api/wordpress/posts');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWpPosts(data);
    } catch (error) {
      console.error('Error al conectar con WordPress:', error);
      setWpError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, wp: false }));
    }
  };

  // Función para probar la API de WooCommerce
  const testWooCommerceAPI = async () => {
    setLoading(prev => ({ ...prev, woo: true }));
    setWooError(null);
    
    try {
      const response = await fetch('/api/woocommerce-proxy?path=products');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWooProducts(data);
    } catch (error) {
      console.error('Error al conectar con WooCommerce:', error);
      setWooError(error.message);
    } finally {
      setLoading(prev => ({ ...prev, woo: false }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Prueba de APIs</h1>
      
      {/* Sección de WordPress */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API de WordPress</h2>
        <button 
          onClick={testWordPressAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          disabled={loading.wp}
        >
          {loading.wp ? 'Cargando...' : 'Probar API de WordPress'}
        </button>
        
        {wpError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error:</p>
            <p>{wpError}</p>
          </div>
        )}
        
        {wpPosts && (
          <div className="mt-4">
            <p className="font-semibold">Resultado:</p>
            <p>Se encontraron {wpPosts.length} posts</p>
            <ul className="mt-2 list-disc pl-5">
              {wpPosts.slice(0, 5).map(post => (
                <li key={post.id} className="mb-2">
                  {post.title?.rendered || 'Sin título'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Sección de WooCommerce */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API de WooCommerce</h2>
        <button 
          onClick={testWooCommerceAPI}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
          disabled={loading.woo}
        >
          {loading.woo ? 'Cargando...' : 'Probar API de WooCommerce'}
        </button>
        
        {wooError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error:</p>
            <p>{wooError}</p>
          </div>
        )}
        
        {wooProducts && (
          <div className="mt-4">
            <p className="font-semibold">Resultado:</p>
            <p>Se encontraron {wooProducts.length} productos</p>
            <ul className="mt-2 list-disc pl-5">
              {wooProducts.slice(0, 5).map(product => (
                <li key={product.id} className="mb-2">
                  {product.name || 'Sin nombre'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 