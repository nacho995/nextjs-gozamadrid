import Cookies from 'js-cookie';

// Definir las claves de las cookies que usaremos
export const COOKIE_KEYS = {
  ACCEPTED: 'cookiesAccepted',
  THEME: 'theme',
  SESSION: 'session',
  LANGUAGE: 'language',
  FILTER_PREFERENCES: 'filter_preferences',
  VIEW_MODE: 'view_mode',
  FAVORITES: 'favorites',
  RECENT_SEARCHES: 'recent_searches',
  COOKIE_CONSENT: 'cookie_consent'
};

// Función para establecer una cookie
export function setCookie(name, value, days = 7) {
  try {
    const options = {
      expires: days,
      path: '/',
    };
    
    if (typeof value === 'object') {
      Cookies.set(name, JSON.stringify(value), options);
    } else {
      Cookies.set(name, value, options);
    }
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

// Función para obtener una cookie
export function getCookie(name) {
  try {
    const value = Cookies.get(name);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

// Función para eliminar una cookie
export function removeCookie(name) {
  try {
    Cookies.remove(name, { path: '/' });
  } catch (error) {
    console.error('Error removing cookie:', error);
  }
}

// Función para comprobar si una cookie existe
export function hasCookie(name) {
  return !!Cookies.get(name);
} 