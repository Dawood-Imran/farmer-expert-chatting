const multer = require("multer");
const path = require("path");

// Common diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith("audio/") ? "uploads/audio" : "uploads/images";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  }
});

const upload = multer({ storage });
module.exports = upload;
