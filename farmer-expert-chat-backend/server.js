const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // change this to your app's frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Store online users
let onlineUsers = new Map();

// Setup Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // When user joins
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} connected with socket ID ${socket.id}`);
  });

  // On message send
  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message } = data;
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
    }
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});


server.listen(5000, '0.0.0.0', () => {
  console.log('Server listening on all interfaces');
});
