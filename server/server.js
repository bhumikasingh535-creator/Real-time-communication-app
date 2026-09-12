const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();
const chatbotRoutes = require("./routes/chatbotRoutes");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Socket
const socketHandler = require("./socket/socket");

const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Create Socket.IO Server
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.IO
socketHandler(io);

// Middleware
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();