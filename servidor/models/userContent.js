const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: (value) => {
          return [...value].includes("@") && [...value].includes(".");
        },
      }
  },
  profilePic: { 
    src: { type: String, default: 'https://example.com/default-profile.jpg' },
    alt: { type: String, default: 'Foto de perfil' }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
});

module.exports = mongoose.model("User", UserSchema);
