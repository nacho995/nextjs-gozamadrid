import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

// Lista completa de países con sus prefijos
const COUNTRIES = [
  { code: 'ES', name: 'España', prefix: '+34' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1' },
  { code: 'FR', name: 'Francia', prefix: '+33' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44' },
  { code: 'DE', name: 'Alemania', prefix: '+49' },
  { code: 'IT', name: 'Italia', prefix: '+39' },
  { code: 'PT', name: 'Portugal', prefix: '+351' },
  { code: 'MX', name: 'México', prefix: '+52' },
  { code: 'AR', name: 'Argentina', prefix: '+54' },
  { code: 'CO', name: 'Colombia', prefix: '+57' },
  { code: 'CL', name: 'Chile', prefix: '+56' },
  { code: 'PE', name: 'Perú', prefix: '+51' },
  { code: 'VE', name: 'Venezuela', prefix: '+58' },
  { code: 'EC', name: 'Ecuador', prefix: '+593' },
  { code: 'BR', name: 'Brasil', prefix: '+55' },
  { code: 'CA', name: 'Canadá', prefix: '+1' },
  { code: 'CN', name: 'China', prefix: '+86' },
  { code: 'JP', name: 'Japón', prefix: '+81' },
  { code: 'AU', name: 'Australia', prefix: '+61' },
  { code: 'RU', name: 'Rusia', prefix: '+7' },
  { code: 'IN', name: 'India', prefix: '+91' },
  { code: 'NL', name: 'Países Bajos', prefix: '+31' },
  { code: 'BE', name: 'Bélgica', prefix: '+32' },
  { code: 'CH', name: 'Suiza', prefix: '+41' },
  { code: 'AT', name: 'Austria', prefix: '+43' },
  { code: 'SE', name: 'Suecia', prefix: '+46' },
  { code: 'NO', name: 'Noruega', prefix: '+47' },
  { code: 'DK', name: 'Dinamarca', prefix: '+45' },
  { code: 'FI', name: 'Finlandia', prefix: '+358' },
  { code: 'IE', name: 'Irlanda', prefix: '+353' },
];

const CountryPrefix = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState(COUNTRIES);
  const dropdownRef = useRef(null);
  
  // Encontrar el país actual basado en el prefijo
  const currentCountry = COUNTRIES.find(country => country.prefix === value) || COUNTRIES[0];

  useEffect(() => {
    // Filtrar países basados en la búsqueda
    if (search) {
      const filtered = COUNTRIES.filter(country => 
        country.name.toLowerCase().includes(search.toLowerCase()) || 
        country.prefix.includes(search)
      );
      setCountries(filtered);
    } else {
      setCountries(COUNTRIES);
    }
  }, [search]);

  useEffect(() => {
    // Cerrar el dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (prefix) => {
    onChange(prefix);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-20 focus:border-amarillo focus:ring-2 focus:ring-amarillo text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center truncate">
          <span className="ml-0 md:ml-1 text-sm md:text-base">{currentCountry.prefix}</span>
        </span>
        <FaChevronDown className={`ml-1 text-xs md:text-sm transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full min-w-[180px] mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b z-10">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país o prefijo"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amarillo text-sm"
              />
            </div>
          </div>
          
          <div>
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-sm md:text-base"
                onClick={() => handleCountrySelect(country.prefix)}
              >
                <span className="font-medium truncate">{country.name}</span>
                <span className="ml-auto text-gray-500 whitespace-nowrap">{country.prefix}</span>
              </button>
            ))}
            
            {countries.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-center text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryPrefix;