import express from 'express';
import * as authController from '../controller/authController.js';
import userController from '../controller/userContentController.js';

const router = express.Router();

// Ruta para solicitar restablecimiento de contraseña
router.post('/recover-password', authController.forgotPassword);

// Ruta para restablecer la contraseña con el token
router.patch('/:token', authController.resetPassword);

router.post('/login', userController.loginUser);

export default router; 