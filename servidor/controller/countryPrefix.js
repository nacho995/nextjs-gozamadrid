const prefix = require("../models/countryPrefixes")

const countryPrefix = {
    getCountryPrefix: async (req, res) => {
        try {
            const response = await prefix.find()
            res.json(response)
        } catch (err) {
            console.log("Error:", err)
            res.status(500).json({ message: "No prefix getted" })
        }
    },
}

module.exports = countryPrefix;