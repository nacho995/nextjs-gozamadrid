const multer = require('multer');

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    // Puedes personalizar el nombre del archivo; aquí se antepone la fecha
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Filtro para aceptar solo archivos de imagen
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen'), false);
  }
};

// Inicializamos Multer con la configuración
const upload = multer({ storage, fileFilter });

module.exports = upload;
