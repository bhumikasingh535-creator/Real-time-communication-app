const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const path = require("path");
const fs = require("fs");

// ===============================
// Send Message
// ===============================
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, replyTo } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver is required",
      });
    }

    let replyData = null;

    // ===============================
    // Prepare Reply Data
    // ===============================
    if (replyTo?.messageId) {
      const originalMessage = await Message.findById(replyTo.messageId);

      if (originalMessage) {
        replyData = {
          messageId: originalMessage._id,
          text: originalMessage.text || "",
          image: originalMessage.image || "",

          file: {
            url: originalMessage.file?.url || "",
            publicId: originalMessage.file?.publicId || "",
            name: originalMessage.file?.name || "",
            type: originalMessage.file?.type || "",
            size: originalMessage.file?.size || 0,
          },

          audio: {
            url: originalMessage.audio?.url || "",
            duration: originalMessage.audio?.duration || 0,
          },

          senderId: originalMessage.senderId,
        };
      }
    }

    // ===============================
    // Create New Message
    // ===============================
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId,
      text: text || "",
      image: "",
      status: "sent",
      replyTo: replyData,
    });

    res.status(201).json(message);

  } catch (error) {
    console.log("❌ Send Message Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ===============================
// Send Image
// ===============================
exports.sendImage = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "No image selected",
      });
    }

    // Upload image buffer directly to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "chat-images",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    // Save message
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId,
      text: "",
      image: result.secure_url,
      status: "sent",
    });

    res.status(201).json(message);

  } catch (error) {
    console.log("❌ Image Upload Error:", error);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
};
// ===============================
// Get Conversation
// ===============================
exports.getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        {
          senderId: senderId,
          receiverId: receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// ===============================
// Mark Messages as Seen
// ===============================
exports.markAsSeen = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.senderId;

    await Message.updateMany(
      {
    senderId: senderId,
    receiverId: receiverId,
    status: { $ne: "seen" },
  },
  {
    status: "seen",
  }
);

    res.status(200).json({
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ===============================
// Send Image Message
// ===============================
exports.sendImage = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "No image selected",
      });
    }

    console.log("📷 Image received:", req.file.filename);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat-images",
      resource_type: "image",
    });

    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Temporary file delete error:", err);
      }
    });

    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId,
      text: "",
      image: result.secure_url,
      status: "sent",
    });

    res.status(201).json(message);

  } catch (error) {
    console.log("❌ Image Upload Error:", error);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
};
exports.uploadFile = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiverId,
      text: "",
      image: "",
      file: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
      status: "sent",
    });

    res.status(201).json(message);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "File upload failed",
    });
  }
};

    exports.downloadFile = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message || !message.file.url) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const filePath = path.join(__dirname, "../uploads", path.basename(message.file.url));

    return res.download(filePath, message.file.name);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Download failed",
    });
  }
};

exports.uploadAudio = async (req, res) => {
  try {
    const { receiverId, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "No audio uploaded",
      });
    }

    const audioUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: "",
      image: "",
      file: {},
      audio: {
        url: audioUrl,
        duration: Number(duration),
      },
      status: "sent",
    });

    res.status(201).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Audio upload failed",
    });
  }
};

// ===============================
// Add / Remove Message Reaction
// ===============================
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;

    if (!reaction) {
      return res.status(400).json({
        message: "Reaction is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const userId = String(req.user.id);

    // Initialize reactions if missing
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Same reaction → remove it
    if (message.reactions.get(userId) === reaction) {
      message.reactions.delete(userId);
    } 
    // Different reaction → change it
    else {
      message.reactions.set(userId, reaction);
    }

    await message.save();

    res.status(200).json({
      message: "Reaction updated",
      reactions: Object.fromEntries(message.reactions),
    });

  } catch (error) {
    console.log("❌ Reaction Error:", error);

    res.status(500).json({
      message: "Failed to update reaction",
    });
  }
};

// ===============================
// Delete Message
// ===============================
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete their own message
    if (String(message.senderId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    message.text = "This message was deleted";
    message.image = "";

    message.file = {
      url: "",
      publicId: "",
      name: "",
      type: "",
      size: 0,
    };

    message.audio = {
      url: "",
      duration: 0,
    };

    message.reactions = new Map();

    await message.save();

    res.status(200).json({
      message: "Message deleted",
      updatedMessage: message,
    });
  } catch (error) {
    console.log("❌ Delete Message Error:", error);

    res.status(500).json({
      message: "Failed to delete message",
    });
  }
};

// ===============================
// Edit Message
// ===============================
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can edit their own message
    if (String(message.senderId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You can only edit your own messages",
      });
    }

    // Deleted messages cannot be edited
    if (message.text === "This message was deleted") {
      return res.status(400).json({
        message: "Deleted message cannot be edited",
      });
    }

    // Only text messages can be edited
    if (message.image || message.file?.url || message.audio?.url) {
      return res.status(400).json({
        message: "Only text messages can be edited",
      });
    }

    message.text = text.trim();

    await message.save();

    res.status(200).json({
      message: "Message updated successfully",
      updatedMessage: message,
    });

  } catch (error) {
    console.log("❌ Edit Message Error:", error);

    res.status(500).json({
      message: "Failed to edit message",
    });
  }
};