import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('menuVisible');
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    const [dropdownVisible, setDropdownVisible] = useState({
        vender: false,
        servicios: false
    });

    // Mantener el estado del menú durante la navegación
    useEffect(() => {
        const handleRouteChange = () => {
            // Mantener el estado actual del menú
            if (typeof window !== 'undefined') {
                const currentState = localStorage.getItem('menuVisible');
                if (currentState) {
                    setMenuVisible(JSON.parse(currentState));
                }
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router]);

    // Guardar en localStorage cuando cambie el estado
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('menuVisible', JSON.stringify(menuVisible));
        }
    }, [menuVisible]);

    const toggleMenu = () => {
        setMenuVisible(prev => !prev);
    };

    const toggleDropdown = (key) => {
        setDropdownVisible(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <NavbarContext.Provider value={{
            menuVisible,
            toggleMenu,
            dropdownVisible,
            toggleDropdown
        }}>
            {children}
        </NavbarContext.Provider>
    );
}

export function useNavbar() {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbar must be used within a NavbarProvider');
    }
    return context;
} 