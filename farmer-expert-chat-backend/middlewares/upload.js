const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directories exist
const uploadDirs = ["uploads", "uploads/images", "uploads/audio"]
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
})

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File mimetype:", file.mimetype)

    let folder = "uploads"

    if (file.mimetype.startsWith("image/")) {
      folder = "uploads/images"
    } else if (file.mimetype.startsWith("audio/") || file.mimetype === "application/octet-stream") {
      folder = "uploads/audio"
    }

    console.log(`Saving file to ${folder}`)
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp and original extension
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname) || ".bin"}`
    console.log(`Generated filename: ${uniqueFilename}`)
    cb(null, uniqueFilename)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  console.log("Filtering file:", file.originalname, file.mimetype)

  // Accept images and audio files
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "application/octet-stream" // For some audio files from mobile
  ) {
    console.log("File accepted")
    cb(null, true)
  } else {
    console.log("File rejected")
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false)
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})

module.exports = upload
