import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEOMetadata from '../components/SEOMetadata';

// ─── Imagenes por tipo de local ─────────────────────────────────────────────
const imagenes = {
  restaurante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80',
  ],
  comercial: [
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
  ],
  edificio: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  ],
  cafeteria: [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  ],
  bar: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
  ],
  sala: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  ],
};

function getImagen(nombre, index) {
  const n = nombre.toLowerCase();
  if (n.includes('sala de fiestas') || n.includes('discoteca') || n.includes('lounge')) return imagenes.sala[index % imagenes.sala.length];
  if (n.includes('hotel') || n.includes('hostal')) return imagenes.hotel[index % imagenes.hotel.length];
  if (n.includes('edificio') || n.includes('suelo')) return imagenes.edificio[index % imagenes.edificio.length];
  if (n.includes('bar') && !n.includes('restaurante')) return imagenes.bar[index % imagenes.bar.length];
  if (n.includes('cafeter') || n.includes('pasteler') || n.includes('panaderi') || n.includes('obrador')) return imagenes.cafeteria[index % imagenes.cafeteria.length];
  if (n.includes('comercial') || n.includes('comercio') || n.includes('local comercial')) return imagenes.comercial[index % imagenes.comercial.length];
  return imagenes.restaurante[index % imagenes.restaurante.length];
}

// ─── CATEGORIAS ─────────────────────────────────────────────────────────────
const CATEGORIAS = {
  HOSTELERIA_ALQUILER: 'Hostelería en Alquiler',
  COMERCIAL_ALQUILER: 'Comercial en Alquiler',
  VENTA_SIN_RENTABILIDAD: 'Venta sin Rentabilidad',
  VENTA_CON_RENTABILIDAD: 'Venta con Rentabilidad',
};

// ─── TODOS LOS LOCALES ─────────────────────────────────────────────────────
const todosLosLocales = [
  // ═══════════════════════════════════════════════════════════════════════════
  // HOSTELERIA EN ALQUILER
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ha-1', nombre: 'Restaurante | Chamberi', direccion: 'Francisco de Sales 17, Chamberi, Madrid', zona: 'Chamberi', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '256 m2', traspaso: '250.000', alquiler: '3.500', precio: null, rentabilidad: null },
  { id: 'ha-2', nombre: 'Restaurante | Chamartín', direccion: 'Costa Rica 15, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '280 m2', traspaso: '170.000', alquiler: '7.700', precio: null, rentabilidad: null },
  { id: 'ha-3', nombre: 'Cafetería-Mesón Degustación | Malasaña', direccion: 'Corredera Baja de San Pablo 47, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '80 m2', traspaso: '60.000', alquiler: '3.000', precio: null, rentabilidad: null },
  { id: 'ha-4', nombre: 'Restaurante | Centro', direccion: 'Calle Mayor 73, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '320 m2', traspaso: null, alquiler: '9.500', precio: null, rentabilidad: null },
  { id: 'ha-5', nombre: 'Restaurante | Chamberi', direccion: 'Calle Sandoval 16, Chamberi, Madrid', zona: 'Chamberi', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '450 m2', traspaso: '150.000', alquiler: '7.400', precio: null, rentabilidad: null },
  { id: 'ha-6', nombre: 'Restaurante | Chueca', direccion: 'Calle Hortaleza 52, Chueca, Madrid', zona: 'Chueca', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '281 m2', traspaso: null, alquiler: '13.900', precio: null, rentabilidad: null },
  { id: 'ha-7', nombre: 'Cafetería-Comercio | La Latina', direccion: 'Calle San Millan 2, La Latina, Madrid', zona: 'La Latina', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '65 m2', traspaso: null, alquiler: '4.100', precio: null, rentabilidad: null },
  { id: 'ha-8', nombre: 'Restaurante | Chamartín', direccion: 'Plaza de Valparaiso 3, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '190 m2', traspaso: '120.000', alquiler: '4.600', precio: null, rentabilidad: null },
  { id: 'ha-9', nombre: 'Restaurante | Chueca', direccion: 'Calle Barbieri 6, Chueca, Madrid', zona: 'Chueca', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '300 m2', traspaso: null, alquiler: '14.000', precio: null, rentabilidad: null },
  { id: 'ha-10', nombre: 'Restaurante | Chamartín', direccion: 'Corazón de María 48, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '378 m2', traspaso: null, alquiler: '4.000 - 8.000', precio: null, rentabilidad: null },
  { id: 'ha-11', nombre: 'Restaurante | Centro', direccion: 'Ribera Curtidores 43, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '130 m2', traspaso: '120.000', alquiler: '4.100', precio: null, rentabilidad: null },
  { id: 'ha-12', nombre: 'Cafetería | Barrio Salamanca', direccion: 'López de Hoyos 10, Barrio Salamanca, Madrid', zona: 'Salamanca', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '120 m2', traspaso: null, alquiler: '6.900', precio: null, rentabilidad: null },
  { id: 'ha-13', nombre: 'Restaurante | Chamartín', direccion: 'Doctor Fleming 43, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '300 m2', traspaso: null, alquiler: '8.000', precio: null, rentabilidad: null },
  { id: 'ha-14', nombre: 'Restaurante | Cuzco', direccion: 'Calle Pensamiento 28, Cuzco, Madrid', zona: 'Cuzco', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '220 m2', traspaso: null, alquiler: '9.000', precio: null, rentabilidad: null },
  { id: 'ha-15', nombre: 'Restaurante | Arganzuela', direccion: 'Mercado Guillermo de Osma, Arganzuela, Madrid', zona: 'Arganzuela', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '40 m2', traspaso: '50.000', alquiler: '1.500', precio: null, rentabilidad: null },
  { id: 'ha-16', nombre: 'Restaurante | Torrejón de Ardoz', direccion: 'Centro Comercial OASIZ, Torrejón de Ardoz, Madrid', zona: 'Torrejón', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '120 m2', traspaso: '140.000', alquiler: '5.000', precio: null, rentabilidad: null },
  { id: 'ha-17', nombre: 'Restaurante | Montecarmelo', direccion: 'Monasterio del Escorial 26, Montecarmelo, Madrid', zona: 'Montecarmelo', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '110 m2', traspaso: '50.000', alquiler: '3.000', precio: null, rentabilidad: null },
  { id: 'ha-18', nombre: 'Restaurante | Castellana', direccion: 'Poeta Joan Maragall 16, Castellana, Madrid', zona: 'Castellana', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '200 m2', traspaso: '180.000', alquiler: '6.000', precio: null, rentabilidad: null },
  { id: 'ha-19', nombre: 'Restaurante | Tetuán', direccion: 'Bravo Murillo 238, Tetuán, Madrid', zona: 'Tetuán', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '130 m2', traspaso: '90.000', alquiler: '4.000', precio: null, rentabilidad: null },
  { id: 'ha-20', nombre: 'Restaurante-Discoteca | Alcobendas', direccion: 'Av. Olimpica, Alcobendas-La Moraleja', zona: 'Alcobendas', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '3.000 m2', traspaso: '1.500.000', alquiler: '9.000', precio: null, rentabilidad: null },
  { id: 'ha-21', nombre: 'Restaurante | Centro', direccion: 'Calle Hortaleza 72, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '90 m2', traspaso: '140.000', alquiler: '4.250', precio: null, rentabilidad: null },
  { id: 'ha-22', nombre: 'Restaurante | Retiro', direccion: 'Calle Jorge Juan 50, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '240 m2', traspaso: '490.000', alquiler: '9.000', precio: null, rentabilidad: null },
  { id: 'ha-23', nombre: 'Restaurante | Tetuán', direccion: 'Av. Brasil 28, Tetuán, Madrid', zona: 'Tetuán', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '300 m2', traspaso: '120.000', alquiler: '4.200', precio: null, rentabilidad: null },
  { id: 'ha-24', nombre: 'Restaurante | San Fernando de Henares', direccion: 'P. Empresarial KUDOS, San Fernando Henares, Madrid', zona: 'San Fernando', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '180 m2', traspaso: '50.000', alquiler: '3.000', precio: null, rentabilidad: null },
  { id: 'ha-25', nombre: 'Restaurante | Moncloa', direccion: 'Calle Quintana 30, Moncloa, Madrid', zona: 'Moncloa', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '200 m2', traspaso: '180.000', alquiler: '5.800', precio: null, rentabilidad: null },
  { id: 'ha-26', nombre: 'Restaurante | San Sebastián de los Reyes', direccion: 'Calle Teide 4, San Sebastián de los Reyes, Madrid', zona: 'SS Reyes', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '356 m2', traspaso: '170.000', alquiler: '3.500', precio: null, rentabilidad: null },
  { id: 'ha-27', nombre: 'Restaurante-Bar de Copas | Ciudad Lineal', direccion: 'Calle Alcala 259, Ciudad Lineal, Madrid', zona: 'Ciudad Lineal', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '440 m2', traspaso: '290.000', alquiler: '6.500', precio: null, rentabilidad: null },
  { id: 'ha-28', nombre: 'Restaurante | Montecarmelo', direccion: 'Santuario de Valverde 2, Montecarmelo, Madrid', zona: 'Montecarmelo', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '170 m2', traspaso: null, alquiler: '6.500', precio: null, rentabilidad: null },
  { id: 'ha-29', nombre: 'Bar-Taberna | Guindalera', direccion: 'Calle de Azcona 66, Guindalera, Madrid', zona: 'Guindalera', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '80 m2', traspaso: 'Negociable', alquiler: '1.600', precio: null, rentabilidad: null },
  { id: 'ha-30', nombre: 'Shisha Lounge Bar | Torrejón de Ardoz', direccion: 'Calle Asturias 22, Torrejón de Ardoz, Madrid', zona: 'Torrejón', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '150 m2', traspaso: '90.000', alquiler: '1.300', precio: null, rentabilidad: null },
  { id: 'ha-31', nombre: 'Bar-Cafetería | Cava Baja, La Latina', direccion: 'Cava Baja 24, La Latina, Madrid', zona: 'La Latina', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '130 m2', traspaso: '100.000', alquiler: '4.000', precio: null, rentabilidad: null },
  { id: 'ha-32', nombre: 'Restaurante | Chamberi', direccion: 'Santa Engracia 70, Chamberi, Madrid', zona: 'Chamberi', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '270 m2', traspaso: '270.000', alquiler: '12.000', precio: null, rentabilidad: null },
  { id: 'ha-33', nombre: 'Restaurante | Mercado Ibiza', direccion: 'Mercado Municipal Ibiza, Calle Ibiza 8, Madrid', zona: 'Retiro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '30 m2', traspaso: '30.000', alquiler: '430', precio: null, rentabilidad: null },
  { id: 'ha-34', nombre: 'Restaurante | Alcobendas', direccion: 'La Granja 9, Alcobendas', zona: 'Alcobendas', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '600 m2', traspaso: '70.000', alquiler: '4.300', precio: null, rentabilidad: null },
  { id: 'ha-35', nombre: 'Restaurante | Montecarmelo', direccion: 'Monasterio del Escorial 30, Montecarmelo, Madrid', zona: 'Montecarmelo', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '170 m2', traspaso: '100.000', alquiler: '3.600', precio: null, rentabilidad: null },
  { id: 'ha-36', nombre: 'Cafetería | Chamartín', direccion: 'Carlos Maurras 4, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '140 m2', traspaso: '55.000', alquiler: '4.300', precio: null, rentabilidad: null },
  { id: 'ha-37', nombre: 'Bar Cafetería | Argüelles', direccion: 'Pintor Rosales 36, Argüelles, Madrid', zona: 'Argüelles', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '260 m2', traspaso: '245.000', alquiler: '5.700', precio: null, rentabilidad: null },
  { id: 'ha-38', nombre: 'Bar-Cafetería | El Pardo', direccion: 'Calle Carboneros 4, El Pardo, Madrid', zona: 'El Pardo', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '67 m2', traspaso: '60.000', alquiler: '60', precio: null, rentabilidad: null },
  { id: 'ha-39', nombre: 'Restaurante | Malasaña', direccion: 'Corredera Baja San Pablo 17, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '240 m2', traspaso: '160.000', alquiler: '3.500', precio: null, rentabilidad: null },
  { id: 'ha-40', nombre: 'Restaurante | Chueca', direccion: 'Calle Pelayo 2, Chueca, Madrid', zona: 'Chueca', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '55 m2', traspaso: '100.000', alquiler: '2.300', precio: null, rentabilidad: null },
  { id: 'ha-41', nombre: 'Restaurante | Tetuán', direccion: 'Rosario Pino 14, Tetuán, Madrid', zona: 'Tetuán', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '730 m2', traspaso: null, alquiler: '26.000', precio: null, rentabilidad: null },
  { id: 'ha-42', nombre: 'Restaurante | Malasaña', direccion: 'Conde Duque 3, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '170 m2', traspaso: '250.000', alquiler: '5.000', precio: null, rentabilidad: null },
  { id: 'ha-43', nombre: 'Restaurante | Centro', direccion: 'Plaza Puerta Cerrada 3, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '120 m2', traspaso: '100.000', alquiler: '4.000', precio: null, rentabilidad: null },
  { id: 'ha-44', nombre: 'Restaurante | Chamberi', direccion: 'Alberto Aguilera 6, Chamberi, Madrid', zona: 'Chamberi', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '180 m2', traspaso: '170.000', alquiler: '3.300', precio: null, rentabilidad: null },
  { id: 'ha-45', nombre: 'Restaurante | Arganzuela', direccion: 'Paseo Los Olmos 8, Arganzuela, Madrid', zona: 'Arganzuela', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '350 m2', traspaso: 'A convenir', alquiler: '7.500', precio: null, rentabilidad: null },
  { id: 'ha-46', nombre: 'Restaurante | Centro', direccion: 'Martin de los Heros 5, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '100 m2', traspaso: '130.000', alquiler: '5.500', precio: null, rentabilidad: null },
  { id: 'ha-47', nombre: 'Restaurante | Tres Cantos', direccion: 'Plaza de Toros 1, Tres Cantos, Madrid', zona: 'Tres Cantos', categoria: CATEGORIAS.HOSTELERIA_ALQUILER, superficie: '350 m2', traspaso: null, alquiler: '4.500', precio: null, rentabilidad: null },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMERCIAL EN ALQUILER
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ca-1', nombre: 'Local Comercial | Retiro', direccion: 'Paseo de la Reina Cristina 18, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '108 m2', traspaso: null, alquiler: '2.900', precio: null, rentabilidad: null },
  { id: 'ca-2', nombre: 'Local Comercial | Centro', direccion: 'Calle Carretas 29, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '85 m2', traspaso: null, alquiler: '9.900', precio: null, rentabilidad: null },
  { id: 'ca-3', nombre: 'Local Comercial | Lavapiés', direccion: 'Calvario 15, Lavapiés, Madrid', zona: 'Lavapiés', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '70 m2', traspaso: null, alquiler: '1.650', precio: null, rentabilidad: null },
  { id: 'ca-4', nombre: 'Local Comercial | Malasaña', direccion: 'Calle La Palma 39, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '70 m2', traspaso: null, alquiler: '3.200', precio: null, rentabilidad: null },
  { id: 'ca-5', nombre: 'Pastelería | Retiro', direccion: 'Narváez 72, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '30 m2', traspaso: null, alquiler: '2.700', precio: null, rentabilidad: null },
  { id: 'ca-6', nombre: 'Local Comercial | Chamartín', direccion: 'Alberto Alcocer 48, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '400 m2', traspaso: null, alquiler: '8.200', precio: null, rentabilidad: null },
  { id: 'ca-7', nombre: 'Local Comercial | La Latina', direccion: 'Calle Toledo 58, La Latina, Madrid', zona: 'La Latina', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '380 m2', traspaso: null, alquiler: '8.000', precio: null, rentabilidad: null },
  { id: 'ca-8', nombre: 'Obrador-Pastelería | Vallecas', direccion: 'Sierra Vieja 56, Vallecas, Madrid', zona: 'Vallecas', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '90 m2', traspaso: '45.000', alquiler: '500', precio: null, rentabilidad: null },
  { id: 'ca-9', nombre: 'Local Comercial | Pza. Carlos V', direccion: 'Plaza Emperador Carlos V, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '500 m2', traspaso: null, alquiler: '37.000', precio: null, rentabilidad: null },
  { id: 'ca-10', nombre: 'Local Comercial | O\'Donnell', direccion: 'Calle O\'Donnell 34, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.COMERCIAL_ALQUILER, superficie: '40 m2', traspaso: null, alquiler: '2.300', precio: null, rentabilidad: null },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENTA SIN RENTABILIDAD
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'vs-1', nombre: 'Piso | Barrio Salamanca', direccion: 'Calle Maldonado 55, Madrid', zona: 'Salamanca', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '102 m2 (85 útiles)', traspaso: null, alquiler: null, precio: 'Consultar', rentabilidad: null },
  { id: 'vs-2', nombre: 'Hotel El Campello | Alicante', direccion: 'El Campello, Alicante', zona: 'Alicante', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '745 m2', traspaso: null, alquiler: null, precio: '1.280.000', rentabilidad: null },
  { id: 'vs-3', nombre: 'Hostal en reforma | Centro', direccion: 'Calle Los Jardines 8, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '338 m2', traspaso: null, alquiler: null, precio: '850.000', rentabilidad: null },
  { id: 'vs-4', nombre: 'Restaurante | Ventas', direccion: 'Calle Albacete 2, Ventas, Madrid', zona: 'Ventas', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '200 m2', traspaso: null, alquiler: null, precio: '750.000', rentabilidad: null },
  { id: 'vs-5', nombre: 'Edificio Empresarial | San Fernando de Henares', direccion: 'Sierra de Guadarrama 2, San Fernando de Henares, Madrid', zona: 'San Fernando', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '2.377 m2 (parcela 4.744 m2)', traspaso: null, alquiler: null, precio: '3.650.000', rentabilidad: null },
  { id: 'vs-6', nombre: 'Restaurante | Tetuán', direccion: 'Calle Orense 39, Tetuán, Madrid', zona: 'Tetuán', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '1.250 m2', traspaso: null, alquiler: null, precio: '2.200.000', rentabilidad: null },
  { id: 'vs-7', nombre: 'Local Comercial | Barrio Salamanca', direccion: 'Calle Padilla 4, Barrio Salamanca, Madrid', zona: 'Salamanca', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '190 m2', traspaso: null, alquiler: null, precio: '1.950.000', rentabilidad: null },
  { id: 'vs-8', nombre: 'Restaurante | Centro', direccion: 'Calle Ballesta 18, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '200 m2', traspaso: null, alquiler: null, precio: '900.000', rentabilidad: null },
  { id: 'vs-9', nombre: 'Restaurante | Pozuelo', direccion: 'Via de las Dos Castillas 6, Pozuelo de Alarcón, Madrid', zona: 'Pozuelo', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '1.200 m2 + 200 m2 terraza', traspaso: null, alquiler: null, precio: '5.000.000', rentabilidad: null },
  { id: 'vs-10', nombre: 'Edificio Comercial | Centro', direccion: 'Calle Carretas 6, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '2.453 m2', traspaso: null, alquiler: null, precio: '34.606.000', rentabilidad: null },
  { id: 'vs-11', nombre: 'Restaurante | Prosperidad', direccion: 'Calle Pechuan 6, Prosperidad, Madrid', zona: 'Prosperidad', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '144 m2', traspaso: null, alquiler: null, precio: '580.000', rentabilidad: null },
  { id: 'vs-12', nombre: 'Suelo Comercial-Industrial | Ponferrada', direccion: 'Calle Canal 17, Columbrianos, Ponferrada', zona: 'Ponferrada', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '3.022 m2', traspaso: null, alquiler: null, precio: '900.000', rentabilidad: null },
  { id: 'vs-13', nombre: 'Local Comercial | San Blas', direccion: 'Fuente Carrantona 49, San Blas, Madrid', zona: 'San Blas', categoria: CATEGORIAS.VENTA_SIN_RENTABILIDAD, superficie: '150 m2', traspaso: null, alquiler: null, precio: '450.000', rentabilidad: null },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENTA CON RENTABILIDAD
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'vr-1', nombre: 'Restaurante | Delicias', direccion: 'Calle Embajadores 165, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '60 m2', traspaso: null, alquiler: '3.000', precio: '550.000', rentabilidad: '6,30%' },
  { id: 'vr-2', nombre: 'Café-Espectáculo | Barrio de las Letras', direccion: 'Calle Huertas 35, Barrio de las Letras, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '227 m2', traspaso: null, alquiler: '8.200', precio: '2.010.000', rentabilidad: '4,90%' },
  { id: 'vr-3', nombre: 'Panadería | Barrio Salamanca', direccion: 'Calle Diego de León 40, Barrio Salamanca, Madrid', zona: 'Salamanca', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '120 m2', traspaso: null, alquiler: '5.530', precio: '1.160.000', rentabilidad: '5,50%' },
  { id: 'vr-4', nombre: 'Restaurante | Centro', direccion: 'Calle Mayor 76, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '200 m2', traspaso: null, alquiler: '8.900', precio: '1.900.000', rentabilidad: '5,50%' },
  { id: 'vr-5', nombre: 'Restaurante | Chamartín', direccion: 'Calle Costa Rica 20, Chamartín, Madrid', zona: 'Chamartín', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '65 m2', traspaso: null, alquiler: '3.500', precio: '822.000', rentabilidad: '5,00%' },
  { id: 'vr-6', nombre: 'Restaurante | Tetuán', direccion: 'Pintor Juan Gris 5, Tetuán, Madrid', zona: 'Tetuán', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: null, traspaso: null, alquiler: '2.350', precio: '564.000', rentabilidad: '5,00%' },
  { id: 'vr-7', nombre: 'Hostelería | Retiro', direccion: 'Calle Narváez 72, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '28 m2', traspaso: null, alquiler: '2.750', precio: '653.000', rentabilidad: '5,00%' },
  { id: 'vr-8', nombre: 'Local Comercial | Retiro', direccion: 'Calle O\'Donnell 34, Retiro, Madrid', zona: 'Retiro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '38 m2', traspaso: null, alquiler: '2.200', precio: '528.000', rentabilidad: '4,75%' },
  { id: 'vr-9', nombre: 'Restaurante | Bailen, Centro', direccion: 'Calle Bailen 33, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '280 m2', traspaso: null, alquiler: null, precio: '1.355.000', rentabilidad: '5,50%' },
  { id: 'vr-10', nombre: 'Sala de Fiestas | Almendro', direccion: 'Almendro 22, Centro, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '236 m2', traspaso: null, alquiler: '7.588', precio: '1.688.000', rentabilidad: '5,40%' },
  { id: 'vr-11', nombre: 'Local Comercial | Puerta del Sol', direccion: 'Cadiz 10, Puerta del Sol, Madrid', zona: 'Centro', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '123 m2', traspaso: null, alquiler: '3.099', precio: '818.000', rentabilidad: '4,50%' },
  { id: 'vr-12', nombre: 'Local Comercial | Malasaña', direccion: 'Fuencarral 88, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '83 m2', traspaso: null, alquiler: null, precio: '1.290.000', rentabilidad: '4,20%' },
  { id: 'vr-13', nombre: 'Restaurante-Cafetería | San Sebastián', direccion: 'Pedro Egaña 10, San Sebastián', zona: 'San Sebastián', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '200 m2', traspaso: null, alquiler: '5.500', precio: null, rentabilidad: '5,94%' },
  { id: 'vr-14', nombre: 'Sala de Fiestas | Malasaña', direccion: 'Barco 34, Malasaña, Madrid', zona: 'Malasaña', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '197 m2', traspaso: null, alquiler: '12.000', precio: '2.500.000', rentabilidad: '5,76%' },
  { id: 'vr-15', nombre: 'Local Comercial | Atocha', direccion: 'Embajadores 78, Atocha, Madrid', zona: 'Atocha', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '260 m2', traspaso: null, alquiler: '5.000', precio: '1.140.000', rentabilidad: '5,26%' },
  { id: 'vr-16', nombre: 'Restaurante | Pueblo Nuevo', direccion: 'Emilio Ferrari 78, Pueblo Nuevo, Madrid', zona: 'Pueblo Nuevo', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '160 m2', traspaso: null, alquiler: '2.250', precio: '360.000', rentabilidad: '7,30%' },
  { id: 'vr-17', nombre: 'Restaurante | Corralejos', direccion: 'Bahia de Almeria 11, Corralejos, Madrid', zona: 'Corralejos', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '123 m2', traspaso: null, alquiler: '1.200', precio: '280.000', rentabilidad: '5,30%' },
  { id: 'vr-18', nombre: 'Local Comercial | Gran Via Bilbao', direccion: 'Gran Via 83, Bilbao', zona: 'Bilbao', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '2.453 m2', traspaso: null, alquiler: '31.500', precio: '7.265.000', rentabilidad: '4,40%' },
  { id: 'vr-19', nombre: 'Local Comercial | Jerez', direccion: 'Lenceria 25, Jerez', zona: 'Jerez', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '116 m2', traspaso: null, alquiler: '4.700', precio: null, rentabilidad: '6,20%' },
  { id: 'vr-20', nombre: 'Local Comercial | San Sebastián', direccion: 'Miracruz 13, San Sebastián', zona: 'San Sebastián', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '203 m2', traspaso: null, alquiler: '3.613', precio: '940.000', rentabilidad: '4,60%' },
  { id: 'vr-21', nombre: 'Restaurante | Córdoba', direccion: 'Ronda de los Tejares 38, Córdoba', zona: 'Córdoba', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '341 m2', traspaso: null, alquiler: null, precio: '1.805.000', rentabilidad: '4,50%' },
  { id: 'vr-22', nombre: 'Local Comercial | San Sebastián', direccion: 'Hernani 1, San Sebastián', zona: 'San Sebastián', categoria: CATEGORIAS.VENTA_CON_RENTABILIDAD, superficie: '62 m2', traspaso: null, alquiler: '3.446', precio: null, rentabilidad: '4,50%' },
];

// ─── Componente de tarjeta de local ─────────────────────────────────────────
function LocalCard({ local, index, onContactar }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImagen(local.nombre, index)}
          alt={local.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {local.zona}
        </div>
        {local.rentabilidad && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Rent. {local.rentabilidad}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
        <h3 className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm leading-tight drop-shadow-lg">{local.nombre}</h3>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-1.5 mb-3 text-gray-500 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-2">{local.direccion}</span>
        </div>

        {/* Datos */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {local.superficie && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-gray-400 mb-0.5">Superficie</p>
              <p className="font-bold text-gray-900">{local.superficie}</p>
            </div>
          )}
          {local.alquiler && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-gray-400 mb-0.5">Alquiler</p>
              <p className="font-bold text-gray-900">{local.alquiler} &euro;/mes</p>
            </div>
          )}
          {local.precio && (
            <div className="bg-yellow-50 rounded-lg p-2 text-center">
              <p className="text-yellow-700 mb-0.5">Precio venta</p>
              <p className="font-bold text-gray-900">{local.precio} &euro;</p>
            </div>
          )}
          {local.traspaso && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-gray-400 mb-0.5">Traspaso</p>
              <p className="font-bold text-gray-900">{local.traspaso} &euro;</p>
            </div>
          )}
        </div>

        {/* Boton */}
        <button
          onClick={() => onContactar(local)}
          className="w-full mt-auto bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold py-2.5 rounded-xl text-sm hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          Me interesa
        </button>
      </div>
    </motion.div>
  );
}

// ─── Formulario de contacto ─────────────────────────────────────────────────
function FormularioLocales({ localSeleccionado, onClearLocal }) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    localInteres: '',
    mensaje: '',
    aceptaTerminos: false,
  });

  useEffect(() => {
    if (localSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        localInteres: localSeleccionado.nombre,
        mensaje: `Hola, estoy interesado/a en el local "${localSeleccionado.nombre}" ubicado en ${localSeleccionado.direccion}. Me gustaría recibir más información.`,
      }));
    }
  }, [localSeleccionado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.telefono || !formData.email) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }
    if (!formData.aceptaTerminos) {
      toast.error('Debe aceptar la política de privacidad');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/contacto-locales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al enviar');
      toast.success('Solicitud enviada. Marta López se pondrá en contacto con usted.');
      setEnviado(true);
    } catch (error) {
      toast.error('Error al enviar. Inténtelo de nuevo o llámenos directamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Solicitud enviada</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">Marta López se pondrá en contacto con usted en las próximas 24 horas.</p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/marta.jpeg" alt="Marta López" width={80} height={80} className="rounded-full object-cover border-4 border-yellow-500/30" />
          <div className="text-left">
            <p className="font-bold text-gray-900">Marta López</p>
            <p className="text-gray-600 text-sm">Asesora Inmobiliaria</p>
            <a href="tel:+34608136529" className="text-yellow-700 text-sm font-semibold">+34 608 136 529</a>
          </div>
        </div>
        <button onClick={() => { setEnviado(false); setFormData({ nombre: '', telefono: '', email: '', localInteres: '', mensaje: '', aceptaTerminos: false }); onClearLocal(); }} className="px-6 py-2 rounded-full border border-yellow-600 text-yellow-700 hover:bg-yellow-50 transition-colors">Consultar otro local</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {localSeleccionado && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-yellow-700 font-medium uppercase tracking-wider">Local seleccionado</p>
            <p className="font-bold text-gray-900">{localSeleccionado.nombre}</p>
            <p className="text-sm text-gray-600">{localSeleccionado.direccion}</p>
          </div>
          <button type="button" onClick={() => { onClearLocal(); setFormData({ ...formData, localInteres: '', mensaje: '' }); }} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-gray-900">Nombre *</label>
          <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" placeholder="Su nombre" />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-gray-900">Teléfono *</label>
          <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" placeholder="+34 600 000 000" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-900">Email *</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" placeholder="su.email@ejemplo.com" />
      </div>
      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-gray-900">Mensaje</label>
        <textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows={3} className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" placeholder="Cuéntenos qué busca..." />
      </div>
      <div className="flex items-start">
        <input id="aceptaTerminos" name="aceptaTerminos" type="checkbox" checked={formData.aceptaTerminos} onChange={handleChange} className="h-4 w-4 mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600" />
        <label htmlFor="aceptaTerminos" className="ml-3 text-sm text-gray-700">Acepto la <Link href="/politica-privacidad" className="text-yellow-700 hover:underline">política de privacidad</Link>. *</label>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-lg">
        {loading ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Enviando...</span>) : 'Solicitar información'}
      </button>
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-1">O llámenos directamente:</p>
        <a href="tel:+34608136529" className="inline-flex items-center gap-2 text-yellow-700 font-bold text-lg hover:text-yellow-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          +34 608 136 529
        </a>
      </div>
    </form>
  );
}

// ─── Pagina principal ───────────────────────────────────────────────────────
const LocalesEnVenta = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [localSeleccionado, setLocalSeleccionado] = useState(null);
  const formRef = useRef(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowFloatingCTA(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const localesFiltrados = useMemo(() => {
    return todosLosLocales.filter((l) => {
      const matchCategoria = categoriaActiva === 'Todos' || l.categoria === categoriaActiva;
      const matchBusqueda = !busqueda || l.nombre.toLowerCase().includes(busqueda.toLowerCase()) || l.direccion.toLowerCase().includes(busqueda.toLowerCase()) || l.zona.toLowerCase().includes(busqueda.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }, [categoriaActiva, busqueda]);

  const handleContactar = (local) => {
    setLocalSeleccionado(local);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const categoriasConConteo = useMemo(() => {
    const conteos = {};
    Object.values(CATEGORIAS).forEach(c => { conteos[c] = todosLosLocales.filter(l => l.categoria === c).length; });
    return conteos;
  }, []);

  return (
    <>
      <SEOMetadata
        title="Locales en Venta, Alquiler y Traspaso en Madrid | Goza Madrid Real Estate"
        description="Más de 90 locales comerciales, restaurantes y negocios de hostelería en venta, alquiler y traspaso en Madrid. Salamanca, Chamartín, Centro, Retiro y más. Contacta con Marta López."
        keywords="locales en venta Madrid, traspaso local Madrid, local hostelería Madrid, restaurante en venta Madrid, alquiler local comercial Madrid"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
        author="Marta López - Goza Madrid"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* HEADER */}
        <header className="w-full">
          <div className="bg-gradient-to-r from-black via-black to-amarillo backdrop-blur-md py-3 px-4 shadow-xl border-b border-yellow-600/30">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="relative z-10">
                <div className="flex items-center" style={{ maxHeight: '8rem' }}>
                  <img src="/logonuevo.png" alt="Real Estate Goza Madrid" width={150} height={200} style={{ maxHeight: '200px', width: 'auto' }} loading="eager" />
                </div>
              </Link>
              <a href="tel:+34608136529" className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-sm">+34 608 136 529</span>
              </a>
            </div>
          </div>

          {/* Hero */}
          <div className="relative flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[75vh] px-4 text-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1770&q=80)', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-20 md:w-40 md:h-40 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 md:w-40 md:h-40 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl"></div>
            </div>
            <motion.div className="relative z-10 max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-700/20 backdrop-blur-sm border border-yellow-500/40 rounded-full">
                <span className="text-yellow-400 font-medium uppercase tracking-wider text-sm md:text-base">+{todosLosLocales.length} Locales Disponibles</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block">Locales en</span>
                <span className="block"><span className="text-yellow-500">Venta</span>, <span className="text-yellow-500">Alquiler</span></span>
                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2">y <span className="text-yellow-500">Traspaso</span> en Madrid</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">Restaurantes, cafeterías, locales comerciales y negocios de hostelería en las mejores zonas de Madrid y toda España.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a href="#locales" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 px-8 py-4 text-lg font-bold text-black shadow-xl transition duration-300 hover:from-yellow-600 hover:to-yellow-800 border-2 border-yellow-400/30">Ver Locales Disponibles</motion.a>
                <motion.a href="tel:+34608136529" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white border border-yellow-600/30 shadow-lg hover:bg-black transition duration-300">Llamar a Marta López</motion.a>
              </div>
            </motion.div>
            <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </motion.div>
          </div>
        </header>

        {/* STATS */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: todosLosLocales.length + '+', label: 'Locales disponibles' },
              { num: '40+', label: 'Zonas en Madrid' },
              { num: '15', label: 'Años de experiencia' },
              { num: '500+', label: 'Clientes satisfechos' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-yellow-600">{s.num}</p>
                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LOCALES SECTION */}
        <section id="locales" className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Catálogo de <span className="text-yellow-600">Locales</span></h2>
              <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Seleccione una categoría y encuentre el local perfecto para su negocio o inversión.</p>
            </motion.div>

            {/* Filtros */}
            <div className="mb-8 space-y-4">
              {/* Barra de busqueda */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por zona, calle o tipo..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
                </div>
              </div>

              {/* Categorias */}
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => setCategoriaActiva('Todos')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${categoriaActiva === 'Todos' ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-400'}`}>
                  Todos ({todosLosLocales.length})
                </button>
                {Object.values(CATEGORIAS).map((cat) => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${categoriaActiva === cat ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-400'}`}>
                    {cat} ({categoriasConConteo[cat]})
                  </button>
                ))}
              </div>
            </div>

            {/* Contador */}
            <p className="text-center text-gray-500 text-sm mb-6">{localesFiltrados.length} locales encontrados</p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {localesFiltrados.map((local, index) => (
                <LocalCard key={local.id} local={local} index={index} onContactar={handleContactar} />
              ))}
            </div>

            {localesFiltrados.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-4">No se encontraron locales con esos criterios.</p>
                <button onClick={() => { setBusqueda(''); setCategoriaActiva('Todos'); }} className="text-yellow-700 font-semibold hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-r from-yellow-500 to-yellow-700 py-10 px-4 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10"><div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white"></div><div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white"></div></div>
          <div className="container mx-auto relative z-10">
            <h3 className="text-black text-2xl md:text-3xl font-bold mb-4">¿No encuentra lo que busca?</h3>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">Llame a Marta López y cuéntele qué tipo de local necesita. Tenemos acceso a locales que aún no están publicados.</p>
            <a href="tel:+34608136529" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105">Llamar ahora: +34 608 136 529</a>
          </div>
        </motion.div>

        {/* Formulario */}
        <section ref={formRef} id="contacto" className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-yellow-500/10 to-transparent z-0"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-500/10 to-transparent z-0"></div>
              <div className="relative z-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contacte con Nosotros</h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-700 md:mx-0 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600 max-w-md">Marta López le atenderá personalmente para resolver todas sus dudas.</p>
                </div>
                <div className="relative rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-xl flex-shrink-0">
                  <img src="/marta.jpeg" alt="Marta López" width={150} height={150} className="object-cover w-[150px] h-[150px]" />
                </div>
              </div>
              <div className="relative z-10">
                <FormularioLocales localSeleccionado={localSeleccionado} onClearLocal={() => setLocalSeleccionado(null)} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-black via-gray-900 to-amarillo text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-8"><div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-white-700 rounded-full"></div></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="mb-6 md:mb-0 text-center md:text-left text-white">
                <Link href="/" className="relative z-10"><div className="flex items-center justify-center md:justify-start" style={{ maxHeight: '8rem' }}><img src="/logonuevo.png" alt="Real Estate Goza Madrid" width={150} height={200} style={{ maxHeight: '200px', width: 'auto' }} loading="lazy" /></div></Link>
                <p className="text-sm text-white max-w-md leading-relaxed mt-4">Locales comerciales en venta, alquiler y traspaso en las mejores zonas de Madrid. Asesoramiento profesional con Marta López.</p>
              </div>
              <div className="text-center md:text-right">
                <a href="#contacto" className="inline-block mb-6 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold px-6 py-3 rounded-full hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg transform hover:scale-105">Solicitar Información</a>
                <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
                  <Link href="/aviso-legal" className="text-sm text-white hover:text-gray-400 transition-colors">Aviso Legal</Link>
                  <Link href="/politica-privacidad" className="text-sm text-white hover:text-gray-400 transition-colors">Política de Privacidad</Link>
                  <Link href="/politica-cookies" className="text-sm text-white hover:text-gray-400 transition-colors">Política de Cookies</Link>
                </div>
                <p className="text-xs text-white">&copy; {new Date().getFullYear()} Real Estate Goza Madrid. Todos los derechos reservados.</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-yellow-700/30 text-center text-sm text-white">
              <p>Calle de Azulinas, 28036 Madrid | Email: marta@gozamadrid.com | Tel: +34 608 136 529</p>
            </div>
          </div>
        </footer>

        {/* Botones flotantes */}
        <AnimatePresence>
          {showFloatingCTA && (
            <motion.a href="#contacto" className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-5 py-3 rounded-full shadow-xl flex items-center space-x-2 border-2 border-yellow-400/30" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="font-bold text-sm">Contactar</span>
            </motion.a>
          )}
        </AnimatePresence>
        <motion.a href="https://wa.me/34608136529?text=Hola%2C%20estoy%20interesado%2Fa%20en%20los%20locales%20en%20venta%20en%20Madrid." target="_blank" rel="noopener noreferrer" className="fixed bottom-8 left-8 z-40 bg-green-500 text-white p-3 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6" fill="white"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>
        </motion.a>
      </div>
    </>
  );
};

LocalesEnVenta.getLayout = function getLayout(page) {
  return <>{page}</>;
};

export default LocalesEnVenta;
