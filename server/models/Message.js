const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

reactions: {
  type: Map,
  of: String,
  default: {},
},

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);