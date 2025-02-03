import { use, useEffect } from "react";
import { useState } from "react";
import { getCountryPrefix } from "../pages/api";


const CountryPrefix = () => {

    const [countryPrefixes, setCountryPrefixes] = useState([]);

    useEffect(() => {
        const fetchPrefixes = async () => {
            const prefixes = await getCountryPrefix();
            setCountryPrefixes(prefixes);}
            fetchPrefixes();
        }, [])


    return (
        <div>
            <select id="country" name="country"
                className="text-black mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amarillo focus:border-amarillo sm:text-sm bg-white">
                {countryPrefixes.map((country) => (
                    <option className="text-black" key={country.prefix} value={country.prefix}>
                        {country.name} ({country.prefix})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CountryPrefix