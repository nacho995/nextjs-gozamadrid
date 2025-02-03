const express = require("express")
const blogRouter = express.Router()

const blogController = require("../controller/blogController")

// form


blogRouter.get("/", blogController.getData)
blogRouter.post("/", blogController.addData)
blogRouter.delete("/:id", blogController.deleteData)
blogRouter.patch("/:id", blogController.updateData)
module.exports = blogRouter;