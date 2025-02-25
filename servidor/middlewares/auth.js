import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.decodedToken = decoded; // Para mantener compatibilidad
        
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin role required" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error checking admin status" });
    }
};
