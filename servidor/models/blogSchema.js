import mongoose from 'mongoose';
const { Schema } = mongoose;

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { type: String },
    author: { type: String, required: true },
    category: { type: String, required: true },
    content: { 
      type: String, 
      required: function() {
        // Solo requerir en documentos nuevos
        return this.isNew;
      },
      default: "" 
    },
    tags: [String],
    image: {
      src: { type: String },
      alt: { type: String },
    },
    readTime: { type: String },
    button: {
      title: { type: String },
      variant: { type: String },
      size: { type: String },
      iconRight: { type: String },
    },
    // Nuevo campo para definir la plantilla a usar
   
  }, {
    timestamps: true,
  });
  
export default mongoose.model('Blog', blogSchema);
  