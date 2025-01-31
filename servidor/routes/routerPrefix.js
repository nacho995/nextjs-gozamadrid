const express = require("express")
const prefixRouter = express.Router()

const prefixController = require("/home/nacho/Documentos/Programación/gozamadrid3/servidor/controller/countryPrefix")

// prefix


prefixRouter.get("/", prefixController.getCountryPrefix)


module.exports = prefixRouter;