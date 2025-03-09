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
    images: {
      type: [{
        src: { type: String, required: true },
        alt: { type: String, default: '' }
      }],
      default: [],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.every(item => 
            typeof item === 'object' && 
            typeof item.src === 'string' &&
            (!item.alt || typeof item.alt === 'string')
          );
        },
        message: 'El campo images debe ser un array de objetos con src (requerido) y alt (opcional)'
      }
    },
    readTime: { type: String, default: '5' },
    button: {
      title: { type: String },
      variant: { type: String, default: 'primary' },
      size: { type: String, default: 'medium' },
      iconRight: { type: String },
    },
    // Nuevo campo para definir la plantilla a usar
   
  }, {
    timestamps: true,
  });
  
export default mongoose.model('Blog', blogSchema);
  