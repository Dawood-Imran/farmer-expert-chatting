const Message = require("../models/Message")

// Send Message
const sendMessage = async (req, res) => {
  try {
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const { senderId, receiverId, messageType } = req.body

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId are required" })
    }

    let content
    if (messageType === "text") {
      content = req.body.content
      if (!content) {
        return res.status(400).json({ message: "Content is required for text messages" })
      }
    } else if (req.file) {
      content = req.file.path // path of uploaded file
    } else {
      return res.status(400).json({ message: "No content or file provided" })
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      messageType: messageType || "text",
      content,
    })

    const savedMessage = await newMessage.save()
    console.log("Message saved to database:", savedMessage)

    res.status(201).json(savedMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Error sending message", error: error.message, stack: error.stack })
  }
}

// Get all messages between two users
const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params
    console.log(`Fetching messages between ${senderId} and ${receiverId}`)

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId are required" })
    }

    // Validate that the IDs are valid MongoDB ObjectIDs
    if (!senderId.match(/^[0-9a-fA-F]{24}$/) || !receiverId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid senderId or receiverId format" })
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 })

    console.log(`Found ${messages.length} messages`)
    res.json(messages)
  } catch (error) {
    console.error("Error getting messages:", error)
    res.status(500).json({
      message: "Error getting messages",
      error: error.message,
      stack: error.stack,
    })
  }
}

module.exports = { sendMessage, getMessages }
