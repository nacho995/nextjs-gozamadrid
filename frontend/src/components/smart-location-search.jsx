import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaTimes, FaSearch } from 'react-icons/fa';

// Función para calcular similitud entre strings (algoritmo de Levenshtein simplificado)
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Coincidencia exacta
  if (s1 === s2) return 1;
  
  // Contiene la búsqueda
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Palabras en común
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => 
    words2.some(w => w.includes(word) || word.includes(w))
  );
  
  if (commonWords.length > 0) {
    return 0.6 * (commonWords.length / Math.max(words1.length, words2.length));
  }
  
  return 0;
};

// Función para extraer ubicaciones únicas de las propiedades
const extractUniqueLocations = (properties) => {
  const locations = new Set();
  
  properties.forEach(property => {
    if (property.location) {
      // Agregar ubicación completa
      locations.add(property.location);
      
      // Extraer partes de la ubicación (calles, barrios, etc.)
      const parts = property.location.split(',').map(part => part.trim());
      parts.forEach(part => {
        if (part && part.length > 2) {
          locations.add(part);
        }
      });
      
      // Extraer del título si contiene "en"
      if (property.title) {
        const locationMatch = property.title.match(/en\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
        if (locationMatch && locationMatch[1]) {
          locations.add(locationMatch[1].trim());
        }
      }
    }
    
    // Extraer del título patrones comunes de ubicación
    if (property.title) {
      const title = property.title;
      
      // Buscar patrones como "Calle X", "Plaza Y", etc.
      const streetPatterns = [
        /(?:calle|c\/)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s*,|\s*\d|\s*$)/i,
        /(?:plaza|pl\.)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s*,|\s*\d|\s*$)/i,
        /(?:avenida|avda|av\.)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s*,|\s*\d|\s*$)/i,
        /(?:paseo|pº)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s*,|\s*\d|\s*$)/i
      ];
      
      streetPatterns.forEach(pattern => {
        const match = title.match(pattern);
        if (match && match[1]) {
          locations.add(match[1].trim());
        }
      });
    }
  });
  
  return Array.from(locations).filter(loc => loc.length > 2);
};

const SmartLocationSearch = ({ 
  value, 
  onChange, 
  properties = [], 
  placeholder = "Ubicación (ej. Malasaña, Calle Fuencarral...)",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [availableLocations, setAvailableLocations] = useState([]);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Extraer ubicaciones disponibles cuando cambien las propiedades
  useEffect(() => {
    if (properties.length > 0) {
      const locations = extractUniqueLocations(properties);
      setAvailableLocations(locations);
      console.log('🗺️ Ubicaciones extraídas:', locations.length);
    }
  }, [properties]);
  
  // Generar sugerencias cuando cambie el valor
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Buscar ubicaciones similares
    const matches = availableLocations
      .map(location => ({
        location,
        similarity: calculateSimilarity(location, value),
        propertiesCount: properties.filter(p => 
          p.location?.toLowerCase().includes(location.toLowerCase()) ||
          p.title?.toLowerCase().includes(location.toLowerCase())
        ).length
      }))
      .filter(match => match.similarity > 0.3) // Solo mostrar coincidencias relevantes
      .sort((a, b) => {
        // Ordenar por similitud y luego por número de propiedades
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        return b.propertiesCount - a.propertiesCount;
      })
      .slice(0, 8); // Máximo 8 sugerencias
    
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, [value, availableLocations, properties]);
  
  // Manejar teclas de navegación
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex].location);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  
  // Seleccionar una sugerencia
  const selectSuggestion = (location) => {
    onChange(location);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };
  
  // Limpiar búsqueda
  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // Delay para permitir clicks en sugerencias
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 150);
          }}
          className={`w-full px-4 py-4 pr-12 border border-white/30 rounded-xl focus:ring-2 focus:ring-amarillo focus:border-amarillo text-white placeholder-white/70 bg-white/10 backdrop-blur-sm ${className}`}
        />
        
        {/* Iconos de búsqueda y limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              onClick={clearSearch}
              className="text-white/60 hover:text-white transition-colors p-1"
              type="button"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
          <FaSearch className="text-white/60 text-sm" />
        </div>
      </div>
      
      {/* Lista de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.location}
              onClick={() => selectSuggestion(suggestion.location)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-amarillo/10 border-amarillo/20' : ''
              }`}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-amarillo text-sm flex-shrink-0" />
                  <div>
                    <div className="text-gray-900 font-medium">
                      {suggestion.location}
                    </div>
                    {suggestion.propertiesCount > 0 && (
                      <div className="text-gray-500 text-xs">
                        {suggestion.propertiesCount} propiedad{suggestion.propertiesCount !== 1 ? 'es' : ''} disponible{suggestion.propertiesCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Indicador de relevancia */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i < Math.ceil(suggestion.similarity * 3) 
                          ? 'bg-amarillo' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
          
          {/* Footer con información */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
            💡 Usa las flechas ↑↓ para navegar, Enter para seleccionar
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartLocationSearch; 