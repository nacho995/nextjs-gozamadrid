import express from 'express';
import userController from '../controller/userContentController.js';
import upload from '../config/multer.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const userRouter = express.Router();

// IMPORTANTE: Ordenar las rutas de más específicas a más genéricas
// Rutas específicas primero
userRouter.get("/profile", verifyToken, userController.getUserProfile);
userRouter.get("/me", verifyToken, userController.getMe);
userRouter.post("/update-profile", verifyToken, upload.single("profilePic"), userController.changeUserPerfil);
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

export default userRouter;