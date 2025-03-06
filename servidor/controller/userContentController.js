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
            // Verificar que req.user existe y tiene id
            if (!req.user || !req.user.id) {
                console.error("req.user no está disponible o no tiene id:", req.user);
                return res.status(401).json({ 
                    message: "No autenticado correctamente",
                    debug: { headers: req.headers }
                });
            }

            // Buscar el usuario con todos los campos necesarios
            const user = await User.findById(req.user.id).select('-password');
            
            if (!user) {
                console.error("Usuario no encontrado con ID:", req.user.id);
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // Log de diagnóstico
            console.log("Usuario recuperado correctamente:", {
                id: user._id,
                name: user.name,
                hasProfilePic: !!user.profilePic,
                hasProfileImage: !!user.profileImage
            });

            // Responder con el usuario completo
            res.json(user);
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
            
            // Sincronizar imágenes de perfil (si una existe y la otra no)
            const updates = {};
            
            // Si tiene profileImage pero no profilePic
            if (user.profileImage && user.profileImage.url && (!user.profilePic || !user.profilePic.src)) {
                updates.profilePic = {
                    src: user.profileImage.url,
                    alt: user.name || 'Foto de perfil'
                };
            }
            
            // Si tiene profilePic pero no profileImage
            if (user.profilePic && user.profilePic.src && (!user.profileImage || !user.profileImage.url)) {
                updates.profileImage = {
                    url: user.profilePic.src,
                    publicId: user.profilePic.src.split('/').pop() || ''
                };
            }
            
            // Actualizar usuario si hay cambios
            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates);
                // Actualizar objeto user para la respuesta
                Object.assign(user, updates);
            }
            
            // Crear token con expiración de 1 hora (3600 segundos)
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            // Obtener URLs finales para la respuesta
            const profilePicUrl = user.profilePic && user.profilePic.src ? user.profilePic.src : null;
            const profileImageUrl = user.profileImage && user.profileImage.url ? user.profileImage.url : null;
            
            // Usar la primera imagen disponible si la otra no existe
            const finalProfileUrl = profileImageUrl || profilePicUrl;
            
            // Devolver token y datos de usuario, incluyendo AMBOS tipos de imágenes de perfil
            res.json({ 
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: finalProfileUrl,
                    profileImage: finalProfileUrl,
                    role: user.role
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

    // Nueva función para sincronizar imágenes de perfil
    syncProfileImage: async (req, res) => {
        try {
            // Obtener ID del usuario del token
            const userId = req.userId || (req.user && req.user.id);
            
            if (!userId) {
                return res.status(401).json({ 
                    success: false,
                    message: 'No se proporcionó ID de usuario o token inválido'
                });
            }
            
            // Obtener los datos actuales del usuario
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            // Inicializar objeto de actualizaciones
            const updates = {};
            
            // Sincronizar profilePic con profileImage si existe profileImage pero no profilePic
            if (user.profileImage && user.profileImage.url && (!user.profilePic || !user.profilePic.src)) {
                updates.profilePic = {
                    src: user.profileImage.url,
                    alt: user.name || 'Foto de perfil'
                };
            }
            
            // Sincronizar profileImage con profilePic si existe profilePic pero no profileImage
            if (user.profilePic && user.profilePic.src && (!user.profileImage || !user.profileImage.url)) {
                updates.profileImage = {
                    url: user.profilePic.src,
                    publicId: user.profilePic.src.split('/').pop() || ''
                };
            }
            
            // Si no hay nada que actualizar, devolver éxito
            if (Object.keys(updates).length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No se requieren actualizaciones en el perfil',
                    user: {
                        _id: user._id,
                        name: user.name,
                        profilePic: user.profilePic && user.profilePic.src,
                        profileImage: user.profileImage && user.profileImage.url
                    }
                });
            }
            
            // Actualizar usuario
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true }
            );
            
            res.status(200).json({
                success: true,
                message: 'Perfil sincronizado correctamente',
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    profilePic: updatedUser.profilePic && updatedUser.profilePic.src,
                    profileImage: updatedUser.profileImage && updatedUser.profileImage.url
                }
            });
            
        } catch (error) {
            console.error('Error al sincronizar imágenes de perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al sincronizar imágenes de perfil',
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
            // El middleware de autenticación ya debería haber verificado el token
            // y añadido el ID del usuario a req.userId
            const userId = req.userId;
            
            if (!userId) {
                return res.status(400).json({ message: 'User id not provided' });
            }
            
            // Buscar el usuario en la base de datos
            const user = await User.findById(userId).select('name profilePic email');
            
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Devolver los datos del usuario
            res.status(200).json({
                name: user.name,
                profilePic: user.profilePic,
                email: user.email
            });
        } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
            res.status(500).json({ message: 'Error al obtener datos del usuario' });
        }
    }
};

export default userController;
