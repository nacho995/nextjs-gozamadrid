import { createContext, useContext } from 'react';
import { setCookie as setUniversalCookie, getCookie as getUniversalCookie, removeCookie as removeUniversalCookie } from '@/utils/cookies';

const COOKIE_KEYS = {
  COOKIE_CONSENT: 'cookie_consent',
  USER_PREFERENCES: 'user_preferences',
  SESSION: 'session',
  THEME: 'theme'
};

const CookieContext = createContext({
  setCookie: () => {},
  getCookie: () => {},
  removeCookie: () => {},
  COOKIE_KEYS: {}
});

export function CookieProvider({ children }) {
  const setCookie = (name, value, options = {}) => {
    setUniversalCookie(name, value, options);
  };

  const getCookie = (name) => {
    return getUniversalCookie(name);
  };

  const removeCookie = (name) => {
    removeUniversalCookie(name);
  };

  return (
    <CookieContext.Provider value={{ setCookie, getCookie, removeCookie, COOKIE_KEYS }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookies debe ser usado dentro de un CookieProvider');
  }
  return context;
} 