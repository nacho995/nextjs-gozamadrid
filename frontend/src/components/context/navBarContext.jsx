import { createContext, useContext, useState, useEffect } from 'react';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState({
    vender: false,
    servicios: false,
    serviciosMobile: false
  });

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const toggleDropdown = (menu, value) => {
    setDropdownVisible(prev => ({
      ...prev,
      vender: menu === 'vender' ? value : false,
      servicios: menu === 'servicios' ? value : false,
      serviciosMobile: menu === 'serviciosMobile' ? value : false
    }));
  };

  // Modificar los useEffect para manejar correctamente el localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMenuState = localStorage.getItem('menuVisible');
        if (savedMenuState !== null) {
          setMenuVisible(savedMenuState === 'true');
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('menuVisible', menuVisible.toString());
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [menuVisible]);

  // Eliminar el useEffect para dropdownVisible ya que no necesitamos persistirlo

  return (
    <NavbarContext.Provider value={{ menuVisible, toggleMenu, dropdownVisible, toggleDropdown }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
