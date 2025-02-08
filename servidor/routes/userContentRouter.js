const express = require("express");
const multer = require('multer');
const userRouter = express.Router();
const upload = multer({ dest: 'uploads/' });
const userController = require("../controller/userContentController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

userRouter.get("/", verifyToken, isAdmin, userController.getUser);
userRouter.get("/me", userController.getMe);

userRouter.post("/register", userController.addUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/request-reset", userController.requestPasswordReset); // Endpoint para solicitar la recuperación de contraseña
userRouter.post("/reset-password", userController.executePasswordReset); // Endpoint para cambiar la contraseña usando el token
userRouter.patch('/update-profile', upload.single('profilePic'), userController.changeUserPerfil);
module.exports = userRouter;
