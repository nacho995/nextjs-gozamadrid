import { COOKIE_KEYS } from './cookies';

// Función para obtener cookies del servidor
export const getServerCookies = (req) => {
  const cookies = req.cookies || {};
  return {
    get: (key) => cookies[key],
    getAll: () => cookies,
    has: (key) => !!cookies[key]
  };
};

// Función para establecer cookies en la respuesta del servidor
export const setServerCookies = (res, key, value, options = {}) => {
  res.setHeader('Set-Cookie', [
    `${key}=${JSON.stringify(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
  ]);
};

// Función para eliminar cookies en la respuesta del servidor
export const removeServerCookies = (res, key) => {
  res.setHeader('Set-Cookie', [
    `${key}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  ]);
};

// Exportar las mismas claves que usamos en el cliente
export { COOKIE_KEYS }; 