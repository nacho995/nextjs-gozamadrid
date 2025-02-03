const blog = require('../models/blogSchema');

const blogController = { 

    getData: async (req, res) => {
        try {
            const response = await blog.find()
            res.json(response)
        } catch (err) {
            console.log("Error:", err)
            res.status(500).json({ message: "No blog getted" })
        }
    },

    addData: async (req, res) => {
        try {
            const newBlog = new blog(req.body)
            await newBlog.save()
            res.json({ message: "Blog added" })
        } catch (err) {
            console.log("Error:", err)
            res.status(500).json({ message: "No blog added" })
        }
    },
    deleteData: async (req, res) => {
        try {
            await blog.findByIdAndDelete(req.params.id)
            res.json({ message: "Blog deleted" })
        } catch (err) {
            console.log("Error:", err)
            res.status(500).json({ message: "No blog deleted" })
        }
    },
    updateData: async (req, res) => {
        try {
            await blog.findByIdAndUpdate(req.params.id, req.body) 
            res.json({ message: "Blog updated" })
        } catch (err) {
            console.log("Error:", err)
            res.status(500).json({ message: "No blog updated" })
        }
},
}

module.exports = blogController;