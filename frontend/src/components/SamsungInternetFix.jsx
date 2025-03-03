import { useEffect } from 'react';

const SamsungInternetFix = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Solo aplicar en Samsung Internet
    if (navigator.userAgent.includes('SamsungBrowser')) {
      // Forzar modo claro con CSS
      const style = document.createElement('style');
      style.innerHTML = `
        :root { color-scheme: light !important; }
        html, body { background-color: #ffffff !important; }
        
        @media (prefers-color-scheme: dark) {
          * { background-color: initial !important; color: initial !important; }
          html::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: white;
            opacity: 0.12;
            z-index: 2147483646;
            pointer-events: none;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Forzar tema claro
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);
  
  return null; // No renderiza nada
};

export default SamsungInternetFix; 