const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogContentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [String],
    image: {
        src: {
           type: String
        },
        alt:{ 
            type: String
        },
    },
  },  {
    timestamps: true
});

module.exports = mongoose.model('BlogContent', blogContentSchema);