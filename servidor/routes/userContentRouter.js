import express from 'express';
import userController from '../controller/userContentController.js';
import upload from '../config/multer.js'; // Usamos la configuración centralizada de multer
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.get("/", verifyToken, isAdmin, userController.getUser);
userRouter.get("/me", userController.getMe);

userRouter.post("/register", userController.addUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/request-reset", userController.requestPasswordReset); // Endpoint para solicitar la recuperación de contraseña
userRouter.post("/reset-password", userController.executePasswordReset); // Endpoint para cambiar la contraseña usando el token

userRouter.patch("/update-profile", verifyToken, upload.single("profilePic"), userController.changeUserPerfil);

userRouter.get('/', userController.getData);
userRouter.get('/:id', userController.getDataById);
userRouter.post('/', userController.addData);
userRouter.delete('/:id', userController.deleteData);
userRouter.patch('/:id', userController.updateData);

export default userRouter;
