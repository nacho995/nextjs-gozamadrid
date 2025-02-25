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
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
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
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ token });
        } catch (error) {
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

    changeUserPerfil: async (req, res) => {
        try {
            // Obtén el id del usuario del token
            const userId = req.decodedToken && req.decodedToken.id;
            if (!userId) {
                return res.status(400).json({ message: 'User id not provided' });
            }

            const updates = {};

            if (req.body.name && req.body.name.trim() !== '') {
                updates.name = req.body.name;
            }

            if (req.file) {
                const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                updates.profilePic = {
                    src: fileUrl,
                    alt: req.file.originalname || 'Foto de perfil',
                };
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Perfil actualizado correctamente',
                profilePic: updatedUser.profilePic ? updatedUser.profilePic.src : null,
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
    }
};

export default userController;
