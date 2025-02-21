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

  // Cambiar a un objeto para manejar múltiples dropdowns
  const [dropdownVisible, setDropdownVisible] = useState({
    vender: false,
    servicios: false,
    serviciosMobile: false
  });

  // Función para cambiar el estado del menú
  const toggleMenu = () => setMenuVisible(prev => !prev);

  const toggleDropdown = (menu, value) => {
    setDropdownVisible(prev => ({
      ...prev,
      vender: menu === 'vender' ? value : false,
      servicios: menu === 'servicios' ? value : false,
      serviciosMobile: menu === 'serviciosMobile' ? value : false
    }));
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
