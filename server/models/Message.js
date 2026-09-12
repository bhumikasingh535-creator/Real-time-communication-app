const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ===============================
    // Sender
    // ===============================
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // Receiver
    // ===============================
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // Text Message
    // ===============================
    text: {
      type: String,
      default: "",
    },

    // ===============================
    // Image Message
    // ===============================
    image: {
      type: String,
      default: "",
    },

    // ===============================
    // File / Document Message
    // ===============================
    file: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },

      type: {
        type: String,
        default: "",
      },

      size: {
        type: Number,
        default: 0,
      },
    },

    // ===============================
    // Audio Message
    // ===============================
    audio: {
      url: {
        type: String,
        default: "",
      },

      duration: {
        type: Number,
        default: 0,
      },
    },

    // ===============================
    // Reply To
    // ===============================
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },

      text: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      file: {
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },

        name: {
          type: String,
          default: "",
        },

        type: {
          type: String,
          default: "",
        },

        size: {
          type: Number,
          default: 0,
        },
      },

      audio: {
        url: {
          type: String,
          default: "",
        },

        duration: {
          type: Number,
          default: 0,
        },
      },

      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // ===============================
    // Message Status
    // ===============================
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // ===============================
    // Reactions
    // ===============================
    reactions: {
      type: Map,
      of: String,
      default: {},
    },
  },

  // ===============================
  // Timestamps
  // ===============================
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);