export const testAPIs = async () => {
  try {
    // Test Backend API
    const backendResponse = await fetch('/api/health');
    console.log('Backend API:', backendResponse.ok);

    // Test WordPress API
    const wpResponse = await fetch('/api/wordpress/posts');
    console.log('WordPress API:', wpResponse.ok);

    // Test WooCommerce API
    const wooResponse = await fetch('/api/woocommerce/products');
    console.log('WooCommerce API:', wooResponse.ok);

    return {
      backend: backendResponse.ok,
      wordpress: wpResponse.ok,
      woocommerce: wooResponse.ok
    };
  } catch (error) {
    console.error('Error testing APIs:', error);
    return {
      backend: false,
      wordpress: false,
      woocommerce: false,
      error: error.message
    };
  }
}; 