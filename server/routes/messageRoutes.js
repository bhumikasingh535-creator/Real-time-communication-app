const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload")


const {
  sendMessage,
  sendImage,
  uploadFile,
  getMessages,
  markAsSeen,
  downloadFile,
  uploadAudio,
  reactToMessage,
  deleteMessage,
  editMessage,
} = require("../controllers/messageController");

console.log("sendMessage =", typeof sendMessage);
console.log("sendImage =", typeof sendImage);
console.log("uploadFile =", typeof uploadFile);
console.log("getMessages =", typeof getMessages);
console.log("markAsSeen =", typeof markAsSeen);
console.log("downloadFile =", typeof downloadFile);
console.log("uploadAudio =", typeof uploadAudio);
console.log("reactToMessage =", typeof reactToMessage);
console.log("deleteMessage =", typeof deleteMessage);
console.log("editMessage =", typeof editMessage);

// ===============================
// Send Text Message
// ===============================
router.post(
  "/send",
  authMiddleware,
  upload.single("image"),
  sendMessage
);

// ===============================
// Send Image
// ===============================
router.post(
  "/send-image",
  authMiddleware,
  upload.single("image"),
  sendImage
);

// ===============================
// Upload File / Document
// ===============================
router.post(
  "/upload-file",
  authMiddleware,
  upload.single("file"),
  uploadFile
);
//reactions

router.put(
  "/react/:messageId",
  authMiddleware,
  reactToMessage
);

// ===============================
// Delete Message
// ===============================
router.delete(
  "/delete/:messageId",
  authMiddleware,
  deleteMessage
);

// ===============================
// Edit Message
// ===============================
router.put(
  "/edit/:messageId",
  authMiddleware,
  editMessage
);

// ===============================
// Get Conversation
// ===============================
router.get(
  "/:receiverId",
  authMiddleware,
  getMessages
);

// ===============================
// Mark Messages as Seen
// ===============================
router.put(
  "/seen/:senderId",
  authMiddleware,
  markAsSeen
);
// ===============================
// Download File
// ===============================
router.get(
  "/download/:messageId",
  authMiddleware,
  downloadFile
);

//========================================
router.post(
  "/upload-audio",
  authMiddleware,
  upload.single("audio"),
  uploadAudio
);

module.exports = router;