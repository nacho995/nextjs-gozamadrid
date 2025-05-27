const axios = require('axios');

async function testAPIs() {
    console.log('🔍 Probando APIs de propiedades...\n');
    
    const baseURL = 'http://localhost:3000';
    
    try {
        // Probar API de MongoDB
        console.log('📊 Probando API de MongoDB...');
        const mongoResponse = await axios.get(`${baseURL}/api/properties/sources/mongodb`, {
            timeout: 10000
        });
        console.log('✅ MongoDB API:', {
            status: mongoResponse.status,
            propiedades: Array.isArray(mongoResponse.data) ? mongoResponse.data.length : 'No es array',
            muestra: mongoResponse.data.slice(0, 2).map(p => ({
                id: p.id || p._id,
                title: p.title || p.name,
                source: p.source
            }))
        });
    } catch (error) {
        console.error('❌ Error MongoDB API:', error.response?.data || error.message);
    }
    
    try {
        // Probar API de WooCommerce
        console.log('\n🛒 Probando API de WooCommerce...');
        const wooResponse = await axios.get(`${baseURL}/api/properties/sources/woocommerce`, {
            timeout: 10000
        });
        console.log('✅ WooCommerce API:', {
            status: wooResponse.status,
            propiedades: Array.isArray(wooResponse.data) ? wooResponse.data.length : 'No es array',
            muestra: wooResponse.data.slice(0, 2).map(p => ({
                id: p.id || p._id,
                title: p.title || p.name,
                source: p.source
            }))
        });
    } catch (error) {
        console.error('❌ Error WooCommerce API:', error.response?.data || error.message);
    }
    
    try {
        // Probar API combinada
        console.log('\n🔗 Probando API combinada...');
        const combinedResponse = await axios.get(`${baseURL}/api/properties`, {
            timeout: 10000
        });
        console.log('✅ API Combinada:', {
            status: combinedResponse.status,
            propiedades: Array.isArray(combinedResponse.data) ? combinedResponse.data.length : 'No es array'
        });
    } catch (error) {
        console.error('❌ Error API Combinada:', error.response?.data || error.message);
    }
    
    console.log('\n✨ Diagnóstico completado');
}

testAPIs().catch(console.error); 