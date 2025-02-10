const express = require("express");
const userRouter = express.Router();
const upload = require("../config/multer"); // Usamos la configuración centralizada de multer
const userController = require("../controller/userContentController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

userRouter.get("/", verifyToken, isAdmin, userController.getUser);
userRouter.get("/me", userController.getMe);

userRouter.post("/register", userController.addUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/request-reset", userController.requestPasswordReset); // Endpoint para solicitar la recuperación de contraseña
userRouter.post("/reset-password", userController.executePasswordReset); // Endpoint para cambiar la contraseña usando el token

userRouter.patch("/update-profile", verifyToken, upload.single("profilePic"), userController.changeUserPerfil);

module.exports = userRouter;
