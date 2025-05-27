import axios from 'axios';

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Probando conexión directa a WooCommerce...');
    
    const response = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: process.env.WC_CONSUMER_KEY,
        consumer_secret: process.env.WC_CONSUMER_SECRET,
        per_page: 2,
        status: 'publish'
      },
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const duration = Date.now() - startTime;
    
    console.log(`✅ WooCommerce respondió en ${duration}ms con ${response.data.length} productos`);
    
    res.status(200).json({
      success: true,
      duration: `${duration}ms`,
      status: response.status,
      productCount: response.data.length,
      firstProduct: response.data[0] ? {
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price,
        hasImages: !!response.data[0].images?.length,
        hasMetaData: !!response.data[0].meta_data?.length
      } : null,
      credentials: {
        hasKey: !!process.env.WC_CONSUMER_KEY,
        hasSecret: !!process.env.WC_CONSUMER_SECRET,
        keyLength: process.env.WC_CONSUMER_KEY?.length || 0,
        secretLength: process.env.WC_CONSUMER_SECRET?.length || 0
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Error en WooCommerce después de ${duration}ms:`, error.message);
    
    res.status(200).json({
      success: false,
      duration: `${duration}ms`,
      error: error.message,
      errorCode: error.code,
      errorStatus: error.response?.status,
      credentials: {
        hasKey: !!process.env.WC_CONSUMER_KEY,
        hasSecret: !!process.env.WC_CONSUMER_SECRET,
        keyLength: process.env.WC_CONSUMER_KEY?.length || 0,
        secretLength: process.env.WC_CONSUMER_SECRET?.length || 0
      }
    });
  }
} 