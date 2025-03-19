import Cookies from 'js-cookie';

// Definir las claves de las cookies que usaremos
export const COOKIE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  FILTER_PREFERENCES: 'filter_preferences',
  VIEW_MODE: 'view_mode',
  FAVORITES: 'favorites',
  RECENT_SEARCHES: 'recent_searches',
  COOKIE_CONSENT: 'cookie_consent'
};

// Función para establecer una cookie
export const setCookie = (key, value, options = {}) => {
  Cookies.set(key, JSON.stringify(value), {
    expires: 7, // Por defecto, las cookies expiran en 7 días
    path: '/',
    ...options
  });
};

// Función para obtener una cookie
export const getCookie = (key) => {
  const cookie = Cookies.get(key);
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch {
      return cookie;
    }
  }
  return null;
};

// Función para eliminar una cookie
export const removeCookie = (key) => {
  Cookies.remove(key, { path: '/' });
};

// Función para comprobar si una cookie existe
export const hasCookie = (key) => {
  return !!Cookies.get(key);
}; 