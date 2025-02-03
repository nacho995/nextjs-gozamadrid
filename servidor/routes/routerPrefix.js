const express = require("express")
const prefixRouter = express.Router()

const prefixController = require("/home/nacho/Documentos/Programación/nextjs-gozamadrid/servidor/controller/countryPrefix")

// prefix


prefixRouter.get("/", prefixController.getCountryPrefix)


module.exports = prefixRouter;