// context/NavbarContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  // Lee el estado inicial de localStorage (si existe) o usa false por defecto
  const [menuVisible, setMenuVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('menuVisible') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('menuVisible', menuVisible);
  }, [menuVisible]);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  return (
    <NavbarContext.Provider value={{ menuVisible, setMenuVisible, toggleMenu }}>
      {children}
    </NavbarContext.Provider>
  );
}

export const useNavbar = () => useContext(NavbarContext);
