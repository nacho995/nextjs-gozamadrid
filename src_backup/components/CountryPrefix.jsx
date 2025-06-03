import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import Head from 'next/head';

// Componente para datos estructurados de la aplicación de prefijos
const CountryPrefixStructuredData = ({ countries }) => {
  try {
    // Seleccionamos solo los países más relevantes para el mercado español
    // para evitar un JSON-LD demasiado grande
    const relevantCountries = countries.filter(country => 
      ['ES', 'US', 'FR', 'GB', 'DE', 'IT', 'PT', 'MX', 'AR', 'CO'].includes(country.code)
    );
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Selector de Prefijo Telefónico Internacional",
      "applicationCategory": "BusinessApplication",
      "description": "Selector de prefijos telefónicos internacionales para comunicación global",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "EUR"
      },
      "operatingSystem": "Web",
      "softwareVersion": "1.0",
      "url": "https://realestategozamadrid.com/contacto",
      "provider": {
        "@type": "Organization",
        "name": "Goza Madrid",
        "url": "https://realestategozamadrid.com"
      },
      "applicationSubCategory": "CommunicationApplication",
      "countriesSupported": relevantCountries.map(country => ({
        "@type": "Country",
        "name": country.name,
        "identifier": country.code
      }))
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    );
  } catch (error) {
    console.error("Error generando datos estructurados para prefijos telefónicos:", error);
    return null;
  }
};

// Lista completa de países con sus prefijos y metadatos
const COUNTRIES = [
  { code: 'ES', name: 'España', prefix: '+34', continent: 'Europa', language: 'es-ES' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', continent: 'América del Norte', language: 'en-US' },
  { code: 'FR', name: 'Francia', prefix: '+33', continent: 'Europa', language: 'fr-FR' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44', continent: 'Europa', language: 'en-GB' },
  { code: 'DE', name: 'Alemania', prefix: '+49', continent: 'Europa', language: 'de-DE' },
  { code: 'IT', name: 'Italia', prefix: '+39', continent: 'Europa', language: 'it-IT' },
  { code: 'PT', name: 'Portugal', prefix: '+351', continent: 'Europa', language: 'pt-PT' },
  { code: 'MX', name: 'México', prefix: '+52', continent: 'América del Norte', language: 'es-MX' },
  { code: 'AR', name: 'Argentina', prefix: '+54', continent: 'América del Sur', language: 'es-AR' },
  { code: 'CO', name: 'Colombia', prefix: '+57', continent: 'América del Sur', language: 'es-CO' },
  { code: 'CL', name: 'Chile', prefix: '+56', continent: 'América del Sur', language: 'es-CL' },
  { code: 'PE', name: 'Perú', prefix: '+51', continent: 'América del Sur', language: 'es-PE' },
  { code: 'VE', name: 'Venezuela', prefix: '+58', continent: 'América del Sur', language: 'es-VE' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', continent: 'América del Sur', language: 'es-EC' },
  { code: 'BR', name: 'Brasil', prefix: '+55', continent: 'América del Sur', language: 'pt-BR' },
  { code: 'CA', name: 'Canadá', prefix: '+1', continent: 'América del Norte', language: 'en-CA' },
  { code: 'CN', name: 'China', prefix: '+86', continent: 'Asia', language: 'zh-CN' },
  { code: 'JP', name: 'Japón', prefix: '+81', continent: 'Asia', language: 'ja-JP' },
  { code: 'AU', name: 'Australia', prefix: '+61', continent: 'Oceanía', language: 'en-AU' },
  { code: 'RU', name: 'Rusia', prefix: '+7', continent: 'Europa', language: 'ru-RU' },
  { code: 'IN', name: 'India', prefix: '+91', continent: 'Asia', language: 'hi-IN' },
  { code: 'NL', name: 'Países Bajos', prefix: '+31', continent: 'Europa', language: 'nl-NL' },
  { code: 'BE', name: 'Bélgica', prefix: '+32', continent: 'Europa', language: 'nl-BE' },
  { code: 'CH', name: 'Suiza', prefix: '+41', continent: 'Europa', language: 'de-CH' },
  { code: 'AT', name: 'Austria', prefix: '+43', continent: 'Europa', language: 'de-AT' },
  { code: 'SE', name: 'Suecia', prefix: '+46', continent: 'Europa', language: 'sv-SE' },
  { code: 'NO', name: 'Noruega', prefix: '+47', continent: 'Europa', language: 'no-NO' },
  { code: 'DK', name: 'Dinamarca', prefix: '+45', continent: 'Europa', language: 'da-DK' },
  { code: 'FI', name: 'Finlandia', prefix: '+358', continent: 'Europa', language: 'fi-FI' },
  { code: 'IE', name: 'Irlanda', prefix: '+353', continent: 'Europa', language: 'en-IE' },
].map(country => ({
  ...country,
  searchTerms: `${country.name} ${country.prefix} ${country.code}`.toLowerCase()
}));

const CountryPrefix = ({ value, onChange, className, id = 'country-prefix' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState(COUNTRIES);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  
  const currentCountry = COUNTRIES.find(country => country.prefix === value) || COUNTRIES[0];

  useEffect(() => {
    if (search) {
      const filtered = COUNTRIES.filter(country => 
        country.searchTerms.includes(search.toLowerCase())
      );
      setCountries(filtered);
      setActiveIndex(-1);
    } else {
      setCountries(COUNTRIES);
    }
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setActiveIndex(prev => (prev < countries.length - 1 ? prev + 1 : prev));
        e.preventDefault();
        break;
      case 'ArrowUp':
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        e.preventDefault();
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          handleCountrySelect(countries[activeIndex].prefix);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        e.preventDefault();
        break;
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleCountrySelect = (prefix) => {
    onChange(prefix);
    setIsOpen(false);
    setSearch('');
    setActiveIndex(-1);
  };

  return (
    <>
      <Head>
        <CountryPrefixStructuredData countries={COUNTRIES} />
      </Head>

      <div 
        className={`relative ${className}`} 
        ref={dropdownRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-label="Selector de país y prefijo telefónico"
      >
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-label={`Prefijo seleccionado: ${currentCountry.name} (${currentCountry.prefix})`}
        >
          <span className="flex items-center truncate">
            <span className="ml-0 md:ml-1 text-sm md:text-base">{currentCountry.prefix}</span>
          </span>
          <FaChevronDown 
            className={`ml-1 text-xs md:text-sm transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div 
            className="absolute z-20 w-full min-w-[180px] mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="presentation"
          >
            <div className="sticky top-0 bg-white p-2 border-b z-10">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar país o prefijo"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo text-sm"
                  aria-label="Buscar país o prefijo telefónico"
                  role="searchbox"
                />
              </div>
            </div>
            
            <ul
              ref={listRef}
              role="listbox"
              id={`${id}-listbox`}
              aria-label="Lista de países y prefijos telefónicos"
              className="py-1"
            >
              {countries.map((country, index) => (
                <li 
                  key={country.code}
                  role="option"
                  aria-selected={country.prefix === value}
                  className={`${
                    activeIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-sm md:text-base"
                    onClick={() => handleCountrySelect(country.prefix)}
                    onKeyDown={handleKeyDown}
                  >
                    <span className="font-medium truncate">{country.name}</span>
                    <span className="ml-auto text-gray-500 whitespace-nowrap">{country.prefix}</span>
                  </button>
                </li>
              ))}
              
              {countries.length === 0 && (
                <li 
                  className="px-4 py-2 text-gray-500 text-center text-sm"
                  role="alert"
                >
                  No se encontraron resultados
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default CountryPrefix;