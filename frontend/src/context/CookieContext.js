import { createContext, useContext, useCallback } from 'react';
import { setCookie, getCookie, removeCookie, COOKIE_KEYS } from '@/utils/cookies';

const CookieContext = createContext();

export function CookieProvider({ children }) {
  const setGlobalCookie = useCallback((key, value, options = {}) => {
    setCookie(key, value, options);
  }, []);

  const getGlobalCookie = useCallback((key) => {
    return getCookie(key);
  }, []);

  const removeGlobalCookie = useCallback((key) => {
    removeCookie(key);
  }, []);

  return (
    <CookieContext.Provider value={{
      setCookie: setGlobalCookie,
      getCookie: getGlobalCookie,
      removeCookie: removeGlobalCookie,
      COOKIE_KEYS
    }}>
      {children}
    </CookieContext.Provider>
  );
}

export const useCookies = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookies debe ser usado dentro de un CookieProvider');
  }
  return context;
}; 