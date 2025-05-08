const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { sendMessage, getMessages } = require("../controllers/messageController");

// For text messages
router.post("/text", sendMessage);

// For image/audio uploads
router.post("/media", upload.single("file"), sendMessage);

// Get chat between two users
router.get("/:senderId/:receiverId", getMessages);

module.exports = router;
