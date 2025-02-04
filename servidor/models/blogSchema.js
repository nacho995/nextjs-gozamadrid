const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
    },
    author: {
        type: String,
        required: true
    }
    ,
    category: {
        type: String,
        required: true
    },
    image: {
        src: {
           type: String
        },
        alt:{ 
            type: String
        },
    },
    readTime: {
        type: String
    },
    button: {
        title: {
            type: String
        },
        variant: {
            type: String
        },
        size: {
            type: String
        },
        iconRight: {
            type: String
        }
    }
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;