import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Crear el contexto con un valor por defecto más descriptivo
const NavbarContext = createContext({
    menuVisible: false,
    toggleMenu: () => {},
    dropdownVisible: {
        vender: false,
        servicios: false
    },
    toggleDropdown: () => {}
});

export function NavbarProvider({ children }) {
    const router = useRouter();
    
    // Estado para el menú con persistencia y accesibilidad
    const [menuVisible, setMenuVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('menuVisible');
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    // Estado para dropdowns con nombres semánticos
    const [dropdownVisible, setDropdownVisible] = useState({
        vender: false,
        servicios: false
    });

    // Efecto para manejar cambios de ruta con accesibilidad
    useEffect(() => {
        const handleRouteChange = () => {
            if (typeof window !== 'undefined') {
                const currentState = localStorage.getItem('menuVisible');
                if (currentState) {
                    setMenuVisible(JSON.parse(currentState));
                    
                    // Anunciar cambio de página para lectores de pantalla
                    const pageAnnouncement = document.createElement('div');
                    pageAnnouncement.setAttribute('role', 'status');
                    pageAnnouncement.setAttribute('aria-live', 'polite');
                    pageAnnouncement.className = 'sr-only';
                    pageAnnouncement.textContent = `Navegando a ${router.pathname.replace('/', '')}`;
                    document.body.appendChild(pageAnnouncement);
                    
                    setTimeout(() => {
                        document.body.removeChild(pageAnnouncement);
                    }, 1000);
                }
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router]);

    // Persistencia del estado con manejo de errores
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('menuVisible', JSON.stringify(menuVisible));
                
                // Actualizar el ARIA cuando cambia el estado del menú
                const menuButton = document.querySelector('[aria-controls="main-menu"]');
                if (menuButton) {
                    menuButton.setAttribute('aria-expanded', menuVisible.toString());
                }
            }
        } catch (error) {
            console.error('Error al guardar el estado del menú:', error);
        }
    }, [menuVisible]);

    // Función para alternar el menú con soporte de accesibilidad
    const toggleMenu = () => {
        setMenuVisible(prev => {
            const newState = !prev;
            // Anunciar cambio de estado para lectores de pantalla
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Menú ${newState ? 'abierto' : 'cerrado'}`;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
            
            return newState;
        });
    };

    // Función CORREGIDA para alternar dropdowns con soporte de hover
    const toggleDropdown = (key, isOpen = undefined) => {
        setDropdownVisible(prev => {
            let newState;
            
            if (isOpen !== undefined) {
                // Si se especifica explícitamente el estado (para hover)
                newState = {
                    ...prev,
                    [key]: isOpen
                };
            } else {
                // Si no se especifica, alternar (para click)
                newState = {
                    ...prev,
                    [key]: !prev[key]
                };
            }
            
            // Actualizar ARIA para el dropdown específico
            const dropdownButton = document.querySelector(`[aria-controls="${key}-dropdown"]`);
            if (dropdownButton) {
                dropdownButton.setAttribute('aria-expanded', newState[key].toString());
            }
            
            return newState;
        });
    };

    return (
        <NavbarContext.Provider 
            value={{
                menuVisible,
                toggleMenu,
                dropdownVisible,
                toggleDropdown
            }}
        >
            {children}
        </NavbarContext.Provider>
    );
}

export function useNavbar() {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbar debe ser utilizado dentro de un NavbarProvider');
    }
    return context;
} 