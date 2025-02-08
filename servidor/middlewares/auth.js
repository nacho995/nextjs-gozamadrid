const jwt = require("jsonwebtoken")

const authObj = {
    verifyToken: (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "No token provided" });
        }
        try {
          const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
          req.decodedToken = tokenDecoded;
          next();
        } catch (error) {
          console.error('error verifying token', error);
          return res.status(401).json({ message: "Invalid token", reason: error.message });
        }
      },

    isAdmin: (req, res, next) => {
        console.log('decodedtoken' , req.decodedToken)
        if (req.decodedToken.role === "ADMIN") {
            next()
        } else {
            res.status(401).json({ message: "Unauthorized" })
        }
    }
}

module.exports = authObj
