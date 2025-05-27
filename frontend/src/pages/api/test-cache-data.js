import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // Datos de prueba para verificar que el sistema funciona
    const testProperties = [
      {
        id: "test-1",
        title: "Apartamento en Malasaña",
        description: "Hermoso apartamento en el corazón de Madrid",
        price: 350000,
        source: "woocommerce",
        images: [
          {
            url: "https://placekitten.com/400/300",
            alt: "Apartamento en Malasaña"
          }
        ],
        features: {
          bedrooms: 2,
          bathrooms: 1,
          area: 80
        },
        location: "Malasaña, Madrid",
        address: "Calle Fuencarral, Madrid",
        createdAt: new Date().toISOString()
      },
      {
        id: "test-2",
        title: "Piso en Chueca",
        description: "Moderno piso reformado en Chueca",
        price: 420000,
        source: "woocommerce",
        images: [
          {
            url: "https://placekitten.com/400/301",
            alt: "Piso en Chueca"
          }
        ],
        features: {
          bedrooms: 3,
          bathrooms: 2,
          area: 95
        },
        location: "Chueca, Madrid",
        address: "Calle Hortaleza, Madrid",
        createdAt: new Date().toISOString()
      },
      {
        id: "test-3",
        title: "Ático en Salamanca",
        description: "Exclusivo ático con terraza en Salamanca",
        price: 750000,
        source: "woocommerce",
        images: [
          {
            url: "https://placekitten.com/400/302",
            alt: "Ático en Salamanca"
          }
        ],
        features: {
          bedrooms: 4,
          bathrooms: 3,
          area: 120
        },
        location: "Salamanca, Madrid",
        address: "Calle Serrano, Madrid",
        createdAt: new Date().toISOString()
      }
    ];

    // Guardar en diferentes claves para diferentes límites
    const cachePromises = [
      kv.set('woo_props_page_1_limit_5', testProperties.slice(0, 3), { ex: 3600 }),
      kv.set('woo_props_page_1_limit_10', testProperties.slice(0, 3), { ex: 3600 }),
      kv.set('woo_props_page_1_limit_20', testProperties.slice(0, 3), { ex: 3600 }),
      kv.set('woo_props_page_1_limit_33', testProperties.slice(0, 3), { ex: 3600 }),
      kv.set('woo_props_all', testProperties, { ex: 3600 })
    ];

    await Promise.all(cachePromises);

    res.status(200).json({
      success: true,
      message: "Datos de prueba insertados en el caché",
      propertiesInserted: testProperties.length,
      cacheKeys: [
        'woo_props_page_1_limit_5',
        'woo_props_page_1_limit_10',
        'woo_props_page_1_limit_20',
        'woo_props_page_1_limit_33',
        'woo_props_all'
      ],
      testProperties
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
} 