import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log("No hay header Authorization");
            return res.status(401).json({ message: "No autorizado, token no proporcionado" });
        }
        
        // El formato debería ser: "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log("Formato de token incorrecto");
            return res.status(401).json({ message: "Formato de token incorrecto" });
        }
        
        // Verificar que el token sea válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Añadir los datos del usuario decodificados a la request
        req.user = decoded;
        req.userId = decoded.id; // Para compatibilidad
        
        console.log("Token verificado correctamente para usuario:", decoded.id);
        
        next();
    } catch (error) {
        console.error("Error al verificar token:", error.message);
        // Respondemos con 401 para todos los errores de autenticación
        res.status(401).json({ 
            message: "Token inválido o expirado",
            error: error.message 
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: "Access denied. Admin role required" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error checking admin status" });
    }
};
