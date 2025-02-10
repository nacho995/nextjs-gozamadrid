const express = require("express")
const blogRouter = express.Router()

const blogController = require("../controller/blogContentController")

// form


blogRouter.get("/", blogController.getData)
blogRouter.get("/:id", blogController.getDataById)
blogRouter.delete("/:id", blogController.deleteData)
module.exports = blogRouter;