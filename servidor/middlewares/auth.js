const jwt = require("jsonwebtoken");

const authObj = {
  verifyToken: (req, res, next) => {
    // Se obtiene el header "Authorization"
    const authHeader = req.headers["authorization"];
    // Se espera que el header tenga el formato "Bearer <token>"
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      // Verifica el token utilizando la clave secreta definida en las variables de entorno
      const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
      // Se asigna el token decodificado a req.decodedToken para que otros middlewares o controladores lo puedan usar
      req.decodedToken = tokenDecoded;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: "Invalid token", reason: error.message });
    }
  },

  isAdmin: (req, res, next) => {
    // Verifica que se haya definido req.decodedToken y que tenga la propiedad role
    if (req.decodedToken && req.decodedToken.role === "ADMIN") {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};

module.exports = authObj;
