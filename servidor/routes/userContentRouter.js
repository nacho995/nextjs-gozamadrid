import express from 'express';
import userController from '../controller/userContentController.js';
import upload from '../config/multer.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import User from '../models/userSchema.js';

const userRouter = express.Router();

// IMPORTANTE: Ordenar las rutas de más específicas a más genéricas
// Rutas específicas primero
userRouter.get("/profile", verifyToken, userController.getUserProfile);
userRouter.get("/me", verifyToken, userController.getMe);
userRouter.post("/update-profile", verifyToken, upload.single("profilePic"), userController.changeUserPerfil);
// Nueva ruta para sincronizar imágenes de perfil
userRouter.get("/sync-profile-image", verifyToken, userController.syncProfileImage);
userRouter.post("/register", userController.addUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/request-reset", userController.requestPasswordReset);
userRouter.post("/reset-password", userController.executePasswordReset);

// Rutas con parámetros después (estas son más genéricas)
userRouter.get("/", verifyToken, isAdmin, userController.getUser);
userRouter.get('/:id', userController.getDataById);
userRouter.post('/', userController.addData);
userRouter.delete('/:id', userController.deleteData);
userRouter.patch('/:id', userController.updateData);

// Configurar storage específico para imágenes de perfil
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'user-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Recorte inteligente enfocado en rostros
      { quality: 'auto' }
    ]
  }
});

// Middleware de multer para perfiles
const uploadProfileImage = multer({ storage: profileImageStorage });

// Ruta para subir/actualizar imagen de perfil
userRouter.post('/profile-image/:userId', uploadProfileImage.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se ha subido ninguna imagen' 
      });
    }
    
    const userId = req.params.userId;
    
    // Buscar el usuario por ID y actualizar su imagen de perfil
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImage: {
          url: req.file.path,
          publicId: req.file.filename || req.file.public_id 
        }
      },
      { new: true, select: '-password' } // Devolver el usuario actualizado excluyendo la contraseña
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Imagen de perfil actualizada correctamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la imagen de perfil',
      error: error.message
    });
  }
});

// Ruta para eliminar imagen de perfil
userRouter.delete('/profile-image/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Buscar el usuario para obtener su public_id actual
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // Si tiene una imagen de perfil guardada
    if (user.profileImage && user.profileImage.publicId) {
      // Eliminar la imagen de Cloudinary
      await cloudinary.v2.uploader.destroy(user.profileImage.publicId);
    }
    
    // Actualizar el usuario para quitar la referencia a la imagen
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { profileImage: 1 } },
      { new: true, select: '-password' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Imagen de perfil eliminada correctamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al eliminar imagen de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen de perfil',
      error: error.message
    });
  }
});

// Añadir esta ruta para diagnóstico (quítala en producción)
userRouter.get("/check-profile-image", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email profilePic profileImage');
        
        res.json({
            user: {
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                profileImage: user.profileImage
            },
            tokenInfo: req.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default userRouter;