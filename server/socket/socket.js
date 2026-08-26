const Message = require("../models/Message");

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    // ===============================
    // User joins
    // ===============================
    socket.on("join", (userId) => {
      onlineUsers.set(String(userId), socket.id);

      console.log("User Joined:", userId);

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });

    // ===============================
    // Send Message
    // ===============================
    socket.on("sendMessage", async (message) => {
      console.log("📨 Message Received:", message);

      try {
        const receiverSocketId = onlineUsers.get(
          String(message.receiverId)
        );

        console.log("Receiver Socket:", receiverSocketId);

        if (receiverSocketId) {
          const updatedMessage = await Message.findByIdAndUpdate(
  message._id,
  {
    status: "delivered",
  },
  {
    new: true,
  }
);

          console.log("✅ Updated Message:", updatedMessage);

          io.to(receiverSocketId).emit(
            "receiveMessage",
            updatedMessage
          );
           console.log("Sender Socket:", socket.id);

io.to(socket.id).emit("messageDelivered", {
  messageId: updatedMessage._id,
  status: updatedMessage.status,
});

console.log("✅ messageDelivered emitted to sender");
          
          
        } else {
          socket.emit("messageDelivered", {
            messageId: message._id,
            delivered: false,
          });

          console.log("❌ Receiver Offline");
        }
      } catch (err) {
        console.log("❌ SOCKET ERROR");
        console.log(err);
      }
    });

    
    // ===============================
    // Typing
    // ===============================
    socket.on("typing", ({ senderId, receiverId }) => {
      console.log("⌨️ Typing:", senderId, "->", receiverId);

      const receiverSocketId = onlineUsers.get(
        String(receiverId)
      );

      console.log("Receiver Socket:", receiverSocketId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", senderId);
        console.log("✅ Typing event sent");
      }
    });

    // ===============================
// Stop Typing
// ===============================
socket.on("stopTyping", ({ receiverId }) => {
  const receiverSocketId = onlineUsers.get(
    String(receiverId)
  );

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("stopTyping");
  }
});

// ===============================
// Video Call Signaling
// ===============================

// Caller -> Receiver
socket.on("callUser", ({ to, offer, from, callType }) => {

  console.log("📞 Call Request Received:", {
    to,
    from,
    callType,
  });

  const receiverSocketId = onlineUsers.get(String(to));

  console.log(
    "Receiver Socket ID:",
    receiverSocketId
  );

  if (receiverSocketId) {

    io.to(receiverSocketId).emit("incomingCall", {
      from,
      offer,
      callType,
    });

    console.log("✅ Incoming call sent");

  } else {

    console.log("❌ Receiver offline");

  }
});


// Receiver -> Caller
socket.on("answerCall", ({ to, answer }) => {

  const callerSocketId = onlineUsers.get(String(to));

  if (callerSocketId) {
    io.to(callerSocketId).emit("callAccepted", {
      answer,
    });

    console.log("✅ Answer sent");
  }
});


// ICE Candidate
socket.on("iceCandidate", ({ to, candidate }) => {

  const socketId = onlineUsers.get(String(to));

  if (socketId) {
    io.to(socketId).emit("iceCandidate", {
      candidate,
    });

    console.log("🧊 ICE sent");
  }
});


// End Call
socket.on("endCall", ({ to }) => {

  const socketId = onlineUsers.get(String(to));

  if (socketId) {
    io.to(socketId).emit("callEnded");
  }
});
       // Messages Seen
socket.on("messagesSeen", async ({ senderId, receiverId }) => {
  try {
    await Message.updateMany(
      {
        senderId,
        receiverId,
        status: "delivered",
      },
      {
        status: "seen",
      }
    );

    const senderSocketId = onlineUsers.get(String(senderId));

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        senderId,
        receiverId,
      });
    }

  } catch (err) {
    console.log(err);
  }
});


// ===============================
    // Disconnect
    // ===============================
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      console.log("🔴 User Disconnected:", socket.id);

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });
  });
};

module.exports = socketHandler;



