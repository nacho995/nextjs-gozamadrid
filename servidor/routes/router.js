const express = require("express")
const formRouter = express.Router()

const formController = require("../controller/formController")

// form


formRouter.post("/", formController.addData)


module.exports = formRouter;