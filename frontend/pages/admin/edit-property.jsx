import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaEdit, FaTrash, FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditPropertyPage() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Cargar propiedades al montar el componente
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties/sources/mongodb');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        toast.error('Error al cargar las propiedades');
      }
    } catch (error) {
      console.error('Error cargando propiedades:', error);
      toast.error('Error al cargar las propiedades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty({
      ...property,
      images: property.images || []
    });
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...editingProperty.images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value
    };
    setEditingProperty({
      ...editingProperty,
      images: updatedImages
    });
  };

  const handleAddImage = () => {
    const newImage = { src: '', alt: '' };
    setEditingProperty({
      ...editingProperty,
      images: [...editingProperty.images, newImage]
    });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = editingProperty.images.filter((_, i) => i !== index);
    setEditingProperty({
      ...editingProperty,
      images: updatedImages
    });
  };

  const handleSaveProperty = async () => {
    if (!editingProperty) return;

    try {
      setIsSaving(true);
      
      // Filtrar imágenes vacías
      const validImages = editingProperty.images.filter(img => img.src && img.src.trim() !== '');
      
      const propertyData = {
        ...editingProperty,
        images: validImages
      };

      const response = await fetch(`/api/properties/${editingProperty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      if (response.ok) {
        toast.success('Propiedad actualizada correctamente');
        setEditingProperty(null);
        loadProperties(); // Recargar la lista
      } else {
        const error = await response.json();
        toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error guardando propiedad:', error);
      toast.error('Error al guardar la propiedad');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePropertyFieldChange = (field, value) => {
    setEditingProperty({
      ...editingProperty,
      [field]: value
    });
  };

  return (
    <>
      <Head>
        <title>Editar Propiedades - Admin Goza Madrid</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Editor de Propiedades
                </h1>
                <p className="text-gray-600">
                  Gestiona las propiedades y sus imágenes con descripciones alt personalizadas
                </p>
              </div>
              {editingProperty && (
                <button
                  onClick={() => setEditingProperty(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaArrowLeft />
                  Volver a la lista
                </button>
              )}
            </div>
          </div>

          {/* Vista de edición */}
          {editingProperty ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Editando: {editingProperty.title}
                </h2>
                
                {/* Campos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editingProperty.title || ''}
                      onChange={(e) => handlePropertyFieldChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio
                    </label>
                    <input
                      type="text"
                      value={editingProperty.price || ''}
                      onChange={(e) => handlePropertyFieldChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingProperty.description || ''}
                    onChange={(e) => handlePropertyFieldChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Gestión de imágenes */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Imágenes ({editingProperty.images.length})
                    </h3>
                    <button
                      onClick={handleAddImage}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlus />
                      Añadir imagen
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingProperty.images.map((image, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Imagen {index + 1}</h4>
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              URL de la imagen
                            </label>
                            <input
                              type="url"
                              value={image.src || ''}
                              onChange={(e) => handleImageChange(index, 'src', e.target.value)}
                              placeholder="https://ejemplo.com/imagen.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción Alt (SEO)
                            </label>
                            <input
                              type="text"
                              value={image.alt || ''}
                              onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                              placeholder="Descripción de la imagen para SEO"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        {/* Vista previa de la imagen */}
                        {image.src && (
                          <div className="mt-3">
                            <img
                              src={image.src}
                              alt={image.alt || 'Vista previa'}
                              className="w-32 h-24 object-cover rounded-md border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingProperty(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProperty}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors ${
                      isSaving 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Lista de propiedades */
            <div className="bg-white rounded-lg shadow-lg">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando propiedades...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Propiedad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Imágenes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {properties.map((property) => (
                        <tr key={property._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.description?.substring(0, 100)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.address || property.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.images?.length || 0} imágenes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditProperty(property)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <FaEdit />
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 