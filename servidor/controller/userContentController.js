const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/userContent");

const usersController = {
  getUser: async (req, res) => {
    try {
      const response = await User.find();
      res.json(response);
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: "No user getted" });
    }
  },

  getMe: async (req, res) => {
    try {
      const userFound = await User.findById(req.decodedToken.id);
      res.json(userFound);
    } catch (error) {
      console.log("Error:", err);
      res.status(500).json({ message: error.message });
    }
  },

  addUser: async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });

      // Si el usuario ya existe, enviamos un error
      if (existingUser) {
        return res.status(400).json({ message: "Ese usuario ya existe" });
      }

      // Hash de la contraseña y creación del nuevo usuario
      const data = req.body;
      const hashedPassword = await bcrypt.hash(
        data.password,
        process.env.SALT_ROUNDS || 10
      );
      const newUser = new User({ ...data, password: hashedPassword });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },

  loginUser: async (req, res) => {
    console.log(req.body);
    // primero cogemos el email y el password
    const { email, password } = req.body;
    // luego buscamos el usuario en la base de datos
    const user = await User.findOne({ email });
    // si el usuario no existe, devolvemos un error
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // luego comprobamos si el password es correcto
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // si el password es correcto, devolvemos el un token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ msg: "User logged in", token });
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
      const { id } = req.params;  // o, si usas autenticación, podrías obtener el id de req.decodedToken.id
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.file) {
        // Aquí puedes construir la URL de la imagen subida
        updates.profilePic = {
          src: `http://localhost:3000/uploads/${req.file.filename}`,
          alt: req.file.originalname
        };
      }
      const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedUser) {
          
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({
        message: "Perfil actualizado correctamente",
        profilePic: updatedUser.profilePic?.src,  // O el objeto completo, según necesites
        name: updatedUser.name,
      });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  }
}

module.exports = usersController;
