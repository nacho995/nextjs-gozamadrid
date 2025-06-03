/**
 * Build helpers para manejar errores de compilación y variables de entorno
 */

export const getEnvVar = (name, defaultValue = null, required = false) => {
  const value = process.env[name];
  
  if (!value && required) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`Warning: Required environment variable ${name} is not set`);
      return defaultValue;
    } else {
      console.warn(`Warning: Environment variable ${name} is not set, using default: ${defaultValue}`);
      return defaultValue;
    }
  }
  
  return value || defaultValue;
};

export const isServerSide = () => typeof window === 'undefined';

export const isDevelopment = () => process.env.NODE_ENV === 'development';

export const isProduction = () => process.env.NODE_ENV === 'production';

export const safeDbConnect = async () => {
  try {
    // Solo importar dbConnect si estamos en el servidor
    if (isServerSide()) {
      const dbConnect = (await import('./dbConnect')).default;
      return await dbConnect();
    }
    return null;
  } catch (error) {
    console.warn('Database connection failed during build:', error.message);
    return null;
  }
};

export const buildTimeHelper = {
  // Para usar durante el build cuando las variables de entorno pueden no estar disponibles
  getMongoUri: () => getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/fallback'),
  getEmailConfig: () => ({
    host: getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(getEnvVar('EMAIL_PORT', '587')),
    user: getEnvVar('EMAIL_USER', 'example@gmail.com'),
    pass: getEnvVar('EMAIL_PASSWORD', 'password')
  })
}; 