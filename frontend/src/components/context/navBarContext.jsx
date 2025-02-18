import { createContext, useContext, useState, useEffect } from 'react';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  // Inicializamos el estado leyendo de localStorage si está disponible
  const [menuVisible, setMenuVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('menuVisible') === 'true';
    }
    return false;
  });

  const [dropdownVisible, setDropdownVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dropdownVisible') === 'true';
    }
    return false;
  });

  // Función para cambiar el estado del menú
  const toggleMenu = () => setMenuVisible(prev => !prev);

  // toggleDropdown acepta un parámetro booleano; si se pasa, lo establece; si no, invierte el estado
  const toggleDropdown = (val) => {
    if (typeof val === 'boolean') {
      setDropdownVisible(val);
    } else {
      setDropdownVisible(prev => !prev);
    }
  };

  // Actualizamos localStorage cada vez que cambian los estados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menuVisible', menuVisible);
    }
  }, [menuVisible]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dropdownVisible', dropdownVisible);
    }
  }, [dropdownVisible]);

  return (
    <NavbarContext.Provider value={{ menuVisible, toggleMenu, dropdownVisible, toggleDropdown }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
