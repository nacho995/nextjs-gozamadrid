import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const verifyToken = (req, res, next) => {
    try {
        // Imprimir todos los encabezados para depuración
        console.log('Headers recibidos:', req.headers);
        
        // Obtener el token del encabezado de autorización
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid format' });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token extraído:', token);
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);
        
        // Asignar el ID del usuario y el token decodificado a la solicitud
        req.userId = decoded.id;
        req.decodedToken = decoded;
        
        next();
    } catch (error) {
        console.error('Error en verifyToken:', error);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
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
