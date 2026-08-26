const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  chatbotMessage,
} = require("../controllers/chatbotController");

// ===============================
// Security Chatbot
// ===============================

router.post(
  "/message",
  authMiddleware,
  chatbotMessage
);

module.exports = router;