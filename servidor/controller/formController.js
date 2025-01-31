const data = require("../models/emailSchema");

const clientData = { 
    addData: async (req, res) => {
        try {
            const { nombre, email, telefono, asunto } = req.body;
            const newContact = new data({ nombre, email, telefono, asunto });
            await newContact.save();
            res.json({ message: "Data added" });
        } catch (err) {
            console.log("Error:", err);
            res.status(500).json({ message: "Data not added" });
        }
    },
}   

module.exports = clientData;