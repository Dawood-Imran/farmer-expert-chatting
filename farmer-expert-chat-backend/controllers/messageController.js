const Message = require("../models/Message");

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, messageType } = req.body;

    let content;
    if (messageType === "text") {
      content = req.body.content;
    } else {
      content = req.file.path; // path of uploaded file
    }

    const newMessage = new Message({ senderId, receiverId, messageType, content });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

// Get all messages between two users
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error getting messages", error });
  }
};

module.exports = { sendMessage, getMessages };
