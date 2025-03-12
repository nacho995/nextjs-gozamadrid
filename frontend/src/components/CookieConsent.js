import { useEffect, useState } from 'react';
import { useCookies } from '@/context/CookieContext';

export default function CookieConsent() {
  const { setCookie, getCookie, COOKIE_KEYS } = useCookies();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si ya se ha aceptado el consentimiento
    const consent = getCookie(COOKIE_KEYS.COOKIE_CONSENT);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookie(COOKIE_KEYS.COOKIE_CONSENT, {
      necessary: true,
      analytics: true,
      marketing: true
    });
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    setCookie(COOKIE_KEYS.COOKIE_CONSENT, {
      necessary: true,
      analytics: false,
      marketing: false
    });
    setShowBanner(false);
  };

  const handleReject = () => {
    setCookie(COOKIE_KEYS.COOKIE_CONSENT, {
      necessary: true, // Las cookies necesarias siempre se mantienen
      analytics: false,
      marketing: false
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-amber-500/20 p-6 shadow-2xl z-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-300">
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Utilizamos cookies para mejorar tu experiencia en nuestra web. 
              Al continuar navegando, aceptas nuestra{' '}
              <a href="/politica-cookies" className="text-amber-500 hover:text-amber-400 transition-colors duration-200">
                política de cookies
              </a>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 text-sm text-gray-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar
            </button>
            <button
              onClick={handleAcceptNecessary}
              className="px-6 py-2.5 text-sm text-gray-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Solo necesarias
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 text-sm text-black bg-amber-500 rounded-lg hover:bg-amber-400 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 