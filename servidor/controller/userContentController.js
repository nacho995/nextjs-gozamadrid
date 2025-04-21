import User from '../models/userSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const userController = {
    getUser: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMe: async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                console.error("req.user no está disponible o no tiene id:", req.user);
                return res.status(401).json({ 
                    message: "No autenticado correctamente",
                    debug: { headers: req.headers }
                });
            }

            const user = await User.findById(req.user.id).select('-password');
            
            if (!user) {
                console.error("Usuario no encontrado con ID:", req.user.id);
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Obtener la URL de la imagen de perfil
            let profileImageUrl = null;
            
            // Primero intentar obtener de profileImage
            if (user.profileImage && user.profileImage.url) {
                profileImageUrl = user.profileImage.url;
            }
            // Si no hay profileImage, intentar obtener de profilePic
            else if (user.profilePic && user.profilePic.src) {
                profileImageUrl = user.profilePic.src;
            }

            // Log de diagnóstico
            console.log("Usuario recuperado correctamente:", {
                id: user._id,
                name: user.name,
                hasProfilePic: !!user.profilePic,
                hasProfileImage: !!user.profileImage,
                profileImageUrl: profileImageUrl
            });

            // Responder con el usuario completo incluyendo la URL de la imagen y el id
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: profileImageUrl,
                profilePic: profileImageUrl
            });
        } catch (error) {
            console.error("Error en getMe:", error);
            res.status(500).json({ 
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
            });
        }
    },

    addUser: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ name, email, password: hashedPassword });
            await user.save();
            res.status(201).json({ message: "Usuario registrado exitosamente" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Usuario no encontrado" });
            }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Contraseña incorrecta" });
            }
            
            // Obtener la URL de la imagen de perfil
            let profileImageUrl = null;
            
            // Primero intentar obtener de profileImage
            if (user.profileImage && user.profileImage.url) {
                profileImageUrl = user.profileImage.url;
            }
            // Si no hay profileImage, intentar obtener de profilePic
            else if (user.profilePic && user.profilePic.src) {
                profileImageUrl = user.profilePic.src;
            }
            
            // Crear token con expiración de 1 hora (3600 segundos)
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            // Devolver token y datos de usuario, incluyendo la URL de la imagen y el id
            res.json({ 
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: profileImageUrl,
                    profilePic: profileImageUrl
                }
            });
        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({ message: error.message });
        }
    },

    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const resetToken = jwt.sign(
                { id: user._id, email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            // Usa FRONTEND_URL si está definido, o una ruta por defecto
            const frontendUrl = process.env.FRONTEND_URL || "/login/reset-password";
            const resetLink = `${frontendUrl}/login/reset-password?token=${resetToken}`;
            console.log("Reset link generado:", resetLink);
            res.status(200).json({ success: true, resetLink });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    // Ejecuta el reinicio de la contraseña
    executePasswordReset: async (req, res) => {
        const { token, newPassword } = req.body;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({
                success: true,
                message: "Contraseña actualizada correctamente",
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Token no válido o caducado",
                error: error.message,
            });
        }
    },

    /**
     * Sincroniza la imagen de perfil entre dispositivos
     * Este endpoint permite tanto obtener la imagen actual como actualizarla
     * @param {Request} req - Solicitud HTTP
     * @param {Response} res - Respuesta HTTP
     */
    syncProfileImage: async (req, res) => {
        try {
            // Verificar si el usuario está autenticado
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Usuario no autenticado' 
                });
            }
            
            // Si es una petición GET, devolver la imagen actual
            if (req.method === 'GET') {
                const user = await User.findById(req.user.id);
                
                if (!user) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Usuario no encontrado' 
                    });
                }
                
                // Buscar imagen en diferentes campos según esté disponible
                let profileImage = null;
                
                if (user.profilePic) {
                    profileImage = typeof user.profilePic === 'string' ? 
                                  user.profilePic : 
                                  (user.profilePic.url || user.profilePic.src);
                } else if (user.profileImage) {
                    profileImage = typeof user.profileImage === 'string' ? 
                                  user.profileImage : 
                                  (user.profileImage.url || user.profileImage.src);
                }
                
                // Si no hay imagen, devolver error
                if (!profileImage) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'No hay imagen de perfil disponible' 
                    });
                }
                
                // Devolver la imagen
                return res.status(200).json({
                    success: true,
                    profilePic: profileImage,
                    synced: true,
                    timestamp: new Date()
                });
            }
            
            // Si es una petición POST, actualizar la imagen
            else if (req.method === 'POST') {
                // Verificar si se proporcionó una imagen
                if (!req.body.profilePic && !req.body.profilePicUrl) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'No se proporcionó imagen de perfil' 
                    });
                }
                
                // Determinar qué imagen usar
                const profileImage = req.body.profilePic || req.body.profilePicUrl;
                
                // Actualizar el usuario
                const updatedUser = await User.findByIdAndUpdate(
                    req.user.id,
                    { 
                        profilePic: profileImage,
                        // También actualizamos profileImage para asegurar compatibilidad
                        profileImage: {
                            url: profileImage
                        }
                    },
                    { new: true }
                );
                
                if (!updatedUser) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Usuario no encontrado' 
                    });
                }
                
                // Devolver confirmación
                return res.status(200).json({
                    success: true,
                    message: 'Imagen de perfil sincronizada correctamente',
                    synced: true,
                    timestamp: new Date()
                });
            }
            
            // Si es otro método, devolver error
            else {
                return res.status(405).json({ 
                    success: false, 
                    message: 'Método no permitido' 
                });
            }
        } catch (error) {
            console.error('Error al sincronizar imagen de perfil:', error);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor al sincronizar imagen de perfil',
                error: error.message
            });
        }
    },

    // Modificar changeUserPerfil para que actualice ambos campos
    changeUserPerfil: async (req, res) => {
        try {
            console.log("Recibida solicitud para actualizar perfil");
            console.log("Body:", req.body);
            console.log("File:", req.file);
            console.log("Token decodificado:", req.decodedToken);
            
            // Obtén el id del usuario del token
            const userId = req.userId || (req.decodedToken && req.decodedToken.id);
            
            if (!userId) {
                console.error("No se proporcionó ID de usuario");
                return res.status(400).json({ message: 'User id not provided' });
            }
            
            console.log("ID de usuario:", userId);

            const updates = {};

            if (req.body.name && req.body.name.trim() !== '') {
                updates.name = req.body.name;
            }

            if (req.file) {
                // Crear una URL sin espacios
                const filename = req.file.filename.replace(/\s+/g, '-');
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
                
                // Actualizar ambos campos de imagen
                updates.profilePic = {
                    src: fileUrl,
                    alt: req.body.name || 'Foto de perfil',
                };
                
                // También actualizar el campo profileImage para compatibilidad
                updates.profileImage = {
                    url: fileUrl,
                    publicId: filename
                };
            }
            
            console.log("Actualizaciones a aplicar:", updates);

            const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
            
            if (!updatedUser) {
                console.error("Usuario no encontrado:", userId);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            console.log("Usuario actualizado correctamente");

            res.json({
                message: 'Perfil actualizado correctamente',
                profilePic: updatedUser.profilePic && updatedUser.profilePic.src ? updatedUser.profilePic.src : null,
                profileImage: updatedUser.profileImage && updatedUser.profileImage.url ? updatedUser.profileImage.url : null,
                name: updatedUser.name,
            });
        } catch (err) {
            console.error("Error en changeUserPerfil:", err);
            res.status(500).json({ message: 'Error al actualizar el perfil', error: err.message });
        }
    },

    getData: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getDataById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addData: async (req, res) => {
        try {
            const user = new User(req.body);
            await user.save();
            res.status(201).json({ message: "Usuario agregado" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteData: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: "Usuario eliminado" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateData: async (req, res) => {
        try {
            await User.findByIdAndUpdate(req.params.id, req.body);
            res.json({ message: "Usuario actualizado" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUserProfile: async (req, res) => {
        try {
            const userId = req.userId;
            
            if (!userId) {
                return res.status(400).json({ message: 'User id not provided' });
            }
            
            // Buscar el usuario en la base de datos
            const user = await User.findById(userId).select('name profilePic profileImage email');
            
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Obtener la URL de la imagen de perfil
            let profileImageUrl = null;
            
            // Primero intentar obtener de profileImage
            if (user.profileImage && user.profileImage.url) {
                profileImageUrl = user.profileImage.url;
            }
            // Si no hay profileImage, intentar obtener de profilePic
            else if (user.profilePic && user.profilePic.src) {
                profileImageUrl = user.profilePic.src;
            }
            
            // Devolver los datos del usuario con la URL de la imagen
            res.status(200).json({
                name: user.name,
                profileImage: profileImageUrl,
                profilePic: profileImageUrl,
                email: user.email
            });
        } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
            res.status(500).json({ message: 'Error al obtener datos del usuario' });
        }
    }
};

export default userController;
