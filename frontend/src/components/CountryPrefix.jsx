import { useEffect, useState } from "react";
import { getCountryPrefix } from "@/pages/api";
import { FaChevronDown } from "react-icons/fa";

const CountryPrefix = ({ value, onChange, className }) => {
    const [countryPrefixes, setCountryPrefixes] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => { 
        const fetchPrefixes = async () => {
            const prefixes = await getCountryPrefix();
            setCountryPrefixes(prefixes);
        };
        fetchPrefixes();
    }, []);

    const handleMouseDown = () => {
        setIsOpen(!isOpen);
    };

    const handleChange = (e) => {
        onChange(e.target.value);
        setIsOpen(false);
    };
    
    return (
        <div className="relative w-48">
            <select
                value={value}
                onChange={handleChange}
                onMouseDown={handleMouseDown}
                className={`${className} appearance-none bg-transparent 
                    [&>option]:bg-gray-800 [&>option]:text-white
                    cursor-pointer pr-10 w-full`}
                style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                }}
            >
                {countryPrefixes.map((country) => (
                    <option 
                        className="text-white bg-opacity-20 py-2 px-4" 
                        key={country.prefix} 
                        value={country.prefix}
                    >
                        {country.country} ({country.prefix})
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <FaChevronDown 
                    className={`text-amarillo transition-transform duration-200 
                        ${isOpen ? 'transform rotate-180' : ''}`}
                />
            </div>
        </div>
    );
}

export default CountryPrefix;