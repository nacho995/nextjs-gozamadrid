import axios from 'axios';
import { kv } from '@vercel/kv';

// 🔧 Transformador simplificado
const transformRealProperty = (property) => {
  try {
    return {
      id: String(property.id),
      title: property.name || `Propiedad ${property.id}`,
      description: property.short_description || '',
      price: parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0,
      source: 'woocommerce',
      images: property.images?.slice(0, 1).map(img => ({
        url: img.url || img.src,
        alt: property.name || 'Imagen'
      })) || [],
      features: { 
        bedrooms: 2, 
        bathrooms: 1, 
        area: 80 
      },
      location: property.name || 'Madrid',
      address: property.name || '',
      createdAt: property.date_created || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error transformando:', error.message);
    return null;
  }
};

export default async function handler(req, res) {
  // Verificar que es un cron job de Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  console.log('🔄 Iniciando precarga de WooCommerce en caché...');

  try {
    // Cargar datos de WooCommerce con timeout largo (solo para cron)
    const response = await axios.get('https://wordpress.realestategozamadrid.com/wp-json/wc/v3/products', {
      params: {
        consumer_key: process.env.WC_CONSUMER_KEY,
        consumer_secret: process.env.WC_CONSUMER_SECRET,
        per_page: 50, // Cargar más productos en el cron
        status: 'publish'
      },
      timeout: 30000, // 30 segundos para el cron
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      const realProperties = response.data
        .map(transformRealProperty)
        .filter(Boolean);

      // Guardar en diferentes claves para diferentes límites
      const cachePromises = [
        kv.set('woo_props_page_1_limit_5', realProperties.slice(0, 5), { ex: 3600 }), // 1 hora
        kv.set('woo_props_page_1_limit_10', realProperties.slice(0, 10), { ex: 3600 }),
        kv.set('woo_props_page_1_limit_20', realProperties.slice(0, 20), { ex: 3600 }),
        kv.set('woo_props_page_1_limit_33', realProperties.slice(0, 33), { ex: 3600 }),
        kv.set('woo_props_all', realProperties, { ex: 3600 }) // Todos los datos
      ];

      await Promise.all(cachePromises);

      const duration = Date.now() - startTime;
      console.log(`✅ Caché actualizado: ${realProperties.length} propiedades en ${duration}ms`);

      res.status(200).json({
        success: true,
        duration: `${duration}ms`,
        propertiesLoaded: realProperties.length,
        cacheKeys: [
          'woo_props_page_1_limit_5',
          'woo_props_page_1_limit_10', 
          'woo_props_page_1_limit_20',
          'woo_props_page_1_limit_33',
          'woo_props_all'
        ]
      });
    } else {
      throw new Error(`Respuesta inválida: ${response.status}`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error en cron job después de ${duration}ms:`, error.message);

    res.status(200).json({
      success: false,
      duration: `${duration}ms`,
      error: error.message
    });
  }
} 