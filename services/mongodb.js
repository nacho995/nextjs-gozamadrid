import config from '@/config/config';

class MongoDBService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || config.API_ROUTES.BEANSTALK;
    this.debug = process.env.NODE_ENV === 'development';
  }

  async getProperty(id) {
    try {
      this.log('Obteniendo propiedad, ID:', id);
      const response = await fetch(`${this.baseUrl}/properties/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener propiedad: ${response.status}`);
      }

      const data = await response.json();
      this.log('Propiedad obtenida:', data);
      return data;
    } catch (error) {
      console.error('Error en getProperty:', error);
      throw error;
    }
  }
  
  async getProperties(params = {}) {
    try {
      this.log('Obteniendo propiedades con parámetros:', params);
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}/properties${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener propiedades: ${response.status}`);
      }

      const data = await response.json();
      this.log('Propiedades obtenidas:', data);
      return data;
    } catch (error) {
      console.error('Error en getProperties:', error);
      throw error;
    }
  }

  async searchProperties(searchParams = {}) {
    try {
      this.log('Buscando propiedades con parámetros:', searchParams);
      const queryParams = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${this.baseUrl}/properties/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error en la búsqueda de propiedades: ${response.status}`);
      }

      const data = await response.json();
      this.log('Resultado de búsqueda:', data);
      return data;
    } catch (error) {
      console.error('Error en searchProperties:', error);
      throw error;
    }
  }

  log(...args) {
    if (this.debug) {
      console.log('MongoDB Service:', ...args);
    }
  }
}

export const mongodbService = new MongoDBService(); 