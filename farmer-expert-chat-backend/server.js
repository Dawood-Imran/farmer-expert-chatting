const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const http = require("http")
const { Server } = require("socket.io")
const messageRoutes = require("./routes/messageRoutes")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose") // Import mongoose

// Load environment variables
dotenv.config()

// Create upload directories if they don't exist
const uploadDirs = ["uploads", "uploads/images", "uploads/audio"]
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
})

// Initialize Express app
const app = express()

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB connection successful")
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err)
  })

// Routes
app.use("/api/messages", messageRoutes)

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // change this to your app's frontend URL in production
    methods: ["GET", "POST"],
  },
})

// Store online users
const onlineUsers = new Map()

// Setup Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id)

  // When user joins
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id)
    console.log(`👤 User ${userId} connected with socket ID ${socket.id}`)
    console.log("Current online users:", Array.from(onlineUsers.entries()))
  })

  // On message send
  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message, messageType } = data
    console.log(`📨 Message from ${senderId} to ${receiverId}: ${message} (${messageType || "text"})`)

    const receiverSocketId = onlineUsers.get(receiverId)
    console.log(`Receiver socket ID: ${receiverSocketId}`)

    if (receiverSocketId) {
      console.log(`Emitting message to socket: ${receiverSocketId}`)
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
        messageType,
      })
    } else {
      console.log(`Receiver ${receiverId} is not online`)
    }
  })

  // Typing indicators
  socket.on("typing", (data) => {
    const { senderId, receiverId } = data
    const receiverSocketId = onlineUsers.get(receiverId)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId,
        receiverId,
      })
    }
  })

  socket.on("stopTyping", (data) => {
    const { senderId, receiverId } = data
    const receiverSocketId = onlineUsers.get(receiverId)

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", {
        senderId,
        receiverId,
      })
    }
  })

  // On disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id)
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`User ${userId} disconnected`)
        onlineUsers.delete(userId)
        break
      }
    }
    console.log("Remaining online users:", Array.from(onlineUsers.entries()))
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack)
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  // Don't crash the server, just log the error
})
