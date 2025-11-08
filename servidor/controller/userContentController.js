import User from '../models/userSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import crypto from 'crypto';

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
            // NO hashear manualmente - el hook pre('save') lo hace automáticamente
            const user = new User({ name, email, password });
            await user.save();
            console.log('[addUser] Usuario registrado:', email);
            res.status(201).json({ message: "Usuario registrado exitosamente" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    loginUser: async (req, res) => {
        // <<< Log inicial para confirmar entrada a la función
        console.log("[loginUser] Entrando a la función loginUser");
        // >>> Fin log inicial

        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB no está conectado al inicio de loginUser. Estado:', mongoose.connection.readyState);
            return res.status(503).json({ message: "Servicio no disponible temporalmente (DB)" });
        }

        try {
            const { email, password } = req.body;

            // <<< Log para verificar estado ANTES de la consulta
            console.log(`[loginUser] Estado de conexión ANTES de User.findOne: ${mongoose.connection.readyState}`);
            if (mongoose.connection.readyState !== 1) {
                 console.error('¡MongoDB se desconectó justo antes de la consulta!');
                 return res.status(503).json({ message: "Error de conexión intermitente con la base de datos." });
            }
            // >>> Fin log ANTES de consulta

            const user = await User.findOne({ email });

            // <<< Log DESPUÉS de la consulta
            console.log(`[loginUser] Resultado de User.findOne: ${user ? 'Usuario encontrado' : 'Usuario NO encontrado'}`);
            // >>> Fin log DESPUÉS de consulta

            if (!user) {
                return res.status(400).json({ message: "Usuario no encontrado" });
            }
            
            console.log('[loginUser] Comparando contraseñas para:', user.email);
            console.log('[loginUser] Password hash en DB:', user.password.substring(0, 20) + '...');
            
            const validPassword = await bcrypt.compare(password, user.password);
            
            console.log('[loginUser] Resultado de comparación:', validPassword ? '✅ VÁLIDA' : '❌ INCORRECTA');
            
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
            if (error.message.includes('Client must be connected')) {
                 return res.status(503).json({ message: "Error de conexión con la base de datos durante el login." });
            }
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
    // Soporta tanto tokens JWT (sistema antiguo) como tokens hasheados SHA-256 (sistema moderno)
    executePasswordReset: async (req, res) => {
        console.log('[executePasswordReset] ========== INICIO ==========');
        console.log('[executePasswordReset] Body recibido:', JSON.stringify(req.body));
        console.log('[executePasswordReset] Headers:', JSON.stringify(req.headers));
        
        const { token, newPassword, password, passwordConfirm } = req.body;
        const passwordToUse = newPassword || password; // Acepta ambos nombres
        
        console.log('[executePasswordReset] Token extraído:', token ? token.substring(0, 10) + '...' : 'NO HAY TOKEN');
        console.log('[executePasswordReset] Password extraída:', passwordToUse ? 'Sí (longitud: ' + passwordToUse.length + ')' : 'NO HAY PASSWORD');
        
        if (!token || !passwordToUse) {
            console.log('[executePasswordReset] ❌ Faltan parámetros requeridos');
            return res.status(400).json({
                success: false,
                message: "Token y contraseña son requeridos"
            });
        }

        try {
            // Detectar tipo de token:
            // - JWT tiene formato: xxxxx.xxxxx.xxxxx (tiene puntos)
            // - Hash SHA-256 es hexadecimal de 64 caracteres
            const isJWT = token.includes('.') && token.split('.').length === 3;
            console.log('[executePasswordReset] Tipo de token detectado:', isJWT ? 'JWT' : 'Hash SHA-256');
            
            let user;
            
            if (isJWT) {
                // Sistema antiguo: token JWT
                console.log('[executePasswordReset] Usando sistema JWT');
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    user = await User.findById(decoded.id);
                    if (!user) {
                        return res.status(404).json({ message: "Usuario no encontrado" });
                    }
                } catch (jwtError) {
                    return res.status(400).json({
                        success: false,
                        message: "Token no válido o caducado",
                        error: jwtError.message,
                    });
                }
            } else {
                // Sistema moderno: token hasheado SHA-256
                console.log('[executePasswordReset] Usando sistema de tokens hasheados');
                console.log('[executePasswordReset] Token recibido (primeros 10 chars):', token.substring(0, 10) + '...');
                console.log('[executePasswordReset] Token recibido (longitud):', token.length);
                
                const hashedToken = crypto
                    .createHash('sha256')
                    .update(token)
                    .digest('hex');
                
                console.log('[executePasswordReset] Token hasheado (primeros 10 chars):', hashedToken.substring(0, 10) + '...');
                console.log('[executePasswordReset] Buscando usuario con token hasheado...');
                console.log('[executePasswordReset] Tiempo actual:', new Date(Date.now()).toISOString());

                user = await User.findOne({
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: { $gt: Date.now() }
                });

                if (!user) {
                    // Intentar encontrar el usuario sin verificar expiración para debug
                    const userWithoutExpiry = await User.findOne({
                        resetPasswordToken: hashedToken
                    });
                    
                    if (userWithoutExpiry) {
                        console.log('[executePasswordReset] ⚠️ Usuario encontrado pero token expirado');
                        console.log('[executePasswordReset] Token expira en:', new Date(userWithoutExpiry.resetPasswordExpires).toISOString());
                        console.log('[executePasswordReset] Tiempo actual:', new Date(Date.now()).toISOString());
                        console.log('[executePasswordReset] Diferencia:', Date.now() - userWithoutExpiry.resetPasswordExpires, 'ms');
                    } else {
                        console.log('[executePasswordReset] ❌ No se encontró usuario con ese token hasheado');
                        // Buscar todos los usuarios con tokens para debug (solo en desarrollo)
                        if (process.env.NODE_ENV !== 'production') {
                            const usersWithTokens = await User.find({ 
                                resetPasswordToken: { $exists: true, $ne: null } 
                            }).select('email resetPasswordExpires');
                            console.log('[executePasswordReset] Usuarios con tokens activos:', usersWithTokens.length);
                        }
                    }
                    
                    return res.status(400).json({
                        success: false,
                        message: "Token no válido o caducado"
                    });
                }
                
                console.log('[executePasswordReset] ✅ Usuario encontrado:', user.email);
                console.log('[executePasswordReset] Token expira en:', new Date(user.resetPasswordExpires).toISOString());
                
                // Limpiar el token después de usarlo
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
            }

            // Actualizar la contraseña (el hook pre('save') la hasheará automáticamente)
            user.password = passwordToUse;
            await user.save();
            
            console.log('[executePasswordReset] Contraseña actualizada para:', user.email);
            res.json({
                success: true,
                message: "Contraseña actualizada correctamente",
            });
        } catch (error) {
            console.error('[executePasswordReset] Error:', error);
            res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud",
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
