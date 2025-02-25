const countryPrefixes = [
    { country: "España", prefix: "+34" },
    { country: "Reino Unido", prefix: "+44" },
    { country: "Francia", prefix: "+33" },
    { country: "Alemania", prefix: "+49" },
    { country: "Italia", prefix: "+39" },
    { country: "Portugal", prefix: "+351" },
    { country: "Estados Unidos", prefix: "+1" }
];

export const getCountryPrefix = async (req, res) => {
    try {
        res.json(countryPrefixes);
    } catch (error) {
        console.error('Error al obtener prefijos:', error);
        res.status(500).json({ message: 'Error al obtener los prefijos de países' });
    }
}; 