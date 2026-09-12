import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import socket from "../socket/socket";
import { useNavigate } from "react-router-dom";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileImage,
  FaFileAlt,
  FaRobot,
  FaCog,
  FaPhone,
  FaVideo,
  FaEllipsisH,
  FaSearch,
  FaPaperclip,
  FaPaperPlane,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";


const Home = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callPartnerId, setCallPartnerId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotMessage, setChatbotMessage] = useState("");
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);


  const configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const recordingInterval = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);

  const chatEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, []);

  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  console.log("Current User Object:", currentUser);
  console.log("Local User:", localStorage.getItem("user"));

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("🔌 Checking socket...");
    console.log("Socket connected:", socket.connected);

    const handleConnect = () => {
      console.log("🟢 Home Socket Connected:", socket.id);

      socket.emit("join", currentUser.id);

      console.log("👤 Join emitted:", currentUser.id);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("connect_error", (error) => {
      console.log("🔴 Socket Error:", error.message);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("incomingCall", ({ from, offer, callType }) => {
  console.log("📲 Incoming Call Received:", from);
  console.log("📞 Call Type:", callType);

  setIncomingCall({
    from,
    offer,
    callType,
  });
});

    

    socket.on("callUser", ({ from, offer }) => {
      setIncomingCall({
        from,
        offer,
      });
    });

    const handleCallAccepted = async ({ answer }) => {
  console.log("📞 CALL ACCEPTED BY RECEIVER");

  const pc = peerConnection.current;

  if (!pc) {
    console.log("❌ Peer connection not found");
    return;
  }

  try {
    await pc.setRemoteDescription(
      new RTCSessionDescription(answer)
    );

    console.log("✅ Remote answer set");
    setCallAccepted(true);

  } catch (error) {
    console.log("❌ Error setting remote answer:", error);
  }
};


    socket.on("callAccepted", async ({ answer }) => {
  console.log("📞 Call Accepted");

  const pc = peerConnection.current;

  if (!pc) {
    console.log("❌ Peer connection not found");
    return;
  }

  await pc.setRemoteDescription(
    new RTCSessionDescription(answer)
  );

  console.log("✅ Remote answer set");
});

socket.on("callEnded", () => {
  console.log("📞 Call ended by other user");

  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;
  }

  if (peerConnection.current) {
    peerConnection.current.close();
    peerConnection.current = null;
  }

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;
  }

  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }

  if (remoteAudioRef.current) {
    remoteAudioRef.current.srcObject = null;
  }

  setIsCalling(false);
  setCallAccepted(false);
  setIncomingCall(null);
  setCallType(null);
  setCallPartnerId(null);
});

socket.on("iceCandidate", async ({ candidate }) => {
  try {
    const pc = peerConnection.current;

    if (pc && candidate) {
      await pc.addIceCandidate(
        new RTCIceCandidate(candidate)
      );

      console.log("🧊 ICE candidate added");
    }
  } catch (error) {
    console.log("❌ ICE Error:", error);
  }
});

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error");
      socket.off("onlineUsers");
      socket.off("incomingCall");
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
      socket.off("receiveMessage");
      socket.off("messageDelivered");
      socket.off("messageSeen");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [currentUser]);


const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("Token:", token);

      const res = await API.get("/user/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Users API Response:", res.data);

      console.log("Users received:", res.data);
setUsers(res.data);
    } catch (error) {
      console.log("❌ Fetch Users Error");
      console.log(error);
      console.log(error.response);
    }
  };
  useEffect(() => {
  if (currentUser?.id) {
    fetchUsers();
  }
}, [currentUser]);
  useEffect(() => {
  chatEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
useEffect(() => {
  selectedUserRef.current = selectedUser;
}, [selectedUser]);

const fetchMessages = async (receiverId) => {
  try {
    const token = localStorage.getItem("token");

    // Get conversation
    const res = await API.get(`/message/${receiverId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res.data);
    setMessages(res.data);

    // Mark all messages from this user as seen
    await API.put(
      
      `/message/seen/${receiverId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    socket.emit("messagesSeen", {
  senderId: receiverId,
});
  } catch (error) {
    console.log(error);
  }
};

const sendMessage = async () => {
  console.log("🚀 Send button clicked");
  console.log("Selected User:", selectedUser);
  console.log("Message:", text);

  if (!text.trim() || !selectedUser) return;

  try {
    const token = localStorage.getItem("token");

    console.log("🔥 REPLYING TO BEFORE SEND:", replyingTo);
    const res = await API.post(
      "/message/send",
      {
        receiverId: selectedUser._id,
        text,
        replyTo: replyingTo
          ? {
              messageId: replyingTo._id,
              text: replyingTo.text || "",
              senderId: replyingTo.senderId,
            }
          : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("🔥 REPLYTO IN RESPONSE:", res.data.replyTo);

    console.log("SENT MESSAGE:", res.data);
    socket.emit("sendMessage", res.data);

    setMessages((prev) => [
      ...prev,
      {
        ...res.data,
        status: "sent",
      },
    ]);

    setText("");
    setReplyingTo(null);

    socket.emit("stopTyping", {
      receiverId: selectedUser._id,
    });

  } catch (error) {
    console.log("❌ SEND MESSAGE ERROR");
    console.log(error);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("No response from server");
    }
  }
};
const createPeerConnection = (remoteUserId) => {
  const pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });

  peerConnection.current = pc;

  // ===============================
  // Remote Audio / Video
  // ===============================
  pc.ontrack = (event) => {
    console.log("🎥🎧 Remote track received:", event.track.kind);

    const remoteStream = event.streams[0];

    // Video call
    if (event.track.kind === "video") {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;

        remoteVideoRef.current
          .play()
          .catch((error) => {
            console.log("Remote video play error:", error);
          });
      }
    }

    // Audio call
    if (event.track.kind === "audio") {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;

        remoteAudioRef.current
          .play()
          .catch((error) => {
            console.log("Remote audio play error:", error);
          });
      }
    }
  };

  // ===============================
  // ICE Candidate
  // ===============================
  pc.onicecandidate = (event) => {
    if (event.candidate && remoteUserId) {
      console.log("🧊 Sending ICE candidate");

      socket.emit("iceCandidate", {
        to: remoteUserId,
        candidate: event.candidate,
      });
    }
  };

  // ===============================
  // Connection State
  // ===============================
  pc.onconnectionstatechange = () => {
    console.log(
      "🔗 Peer Connection State:",
      pc.connectionState
    );
  };

  return pc;
};
const stopExistingMedia = () => {
  console.log("🛑 Stopping existing media...");

  // Stop existing camera/microphone
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;
  }

  // Clear local video
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;
  }

  // Close old peer connection
  if (peerConnection.current) {
    peerConnection.current.close();
    peerConnection.current = null;
  }
};

const acceptCall = async () => {
  if (!incomingCall) return;

  try {
    console.log("📞 Accepting call");
    console.log("📞 Call Type:", incomingCall.callType);

    const isVideoCall = incomingCall.callType === "video";

    // Video call → camera + microphone
    // Audio call → microphone only
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideoCall,
      audio: true,
    });

    console.log("✅ Media access granted");

    localStreamRef.current = stream;

    setCallType(incomingCall.callType);
    setCallPartnerId(incomingCall.from);
    setIsCalling(true);
    setCallAccepted(true);

    // Only show local video for video calls
    if (isVideoCall && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;

      localVideoRef.current.play().catch((err) => {
        console.log("Local video play error:", err);
      });
    }

    // Create peer connection
    const pc = createPeerConnection(incomingCall.from);

    // Add audio/video tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Set caller's offer
    await pc.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );

    console.log("✅ Remote offer set");

    // Create answer
    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    console.log("📤 Sending answer");

    socket.emit("answerCall", {
      to: incomingCall.from,
      answer,
    });

    setIncomingCall(null);

  } catch (error) {
    console.log("❌ Accept Call Error:", error);
  }
};

const rejectCall = () => {
  console.log("❌ Call rejected");

  if (incomingCall) {
    socket.emit("endCall", {
      to: incomingCall.from,
    });
  }

  setIncomingCall(null);
};

const startVideoCall = async () => {
  console.log("📹 Video Button Clicked");

  try {
    if (!selectedUser) {
      console.log("❌ No user selected");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log("✅ Camera Access Granted");

    localStreamRef.current = stream;

    // Show caller's own video
    setCallType("video");
    setCallPartnerId(selectedUser._id);
    setIsCalling(true);
    

    // Wait for video element to render
    setTimeout(() => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        localVideoRef.current.play().catch((err) => {
          console.log("Local video play error:", err);
        });
      }
    }, 100);

    const pc = createPeerConnection(selectedUser._id);

    // Add camera + microphone
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Create offer
    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    console.log("📞 Sending call");

    socket.emit("callUser", {
      to: selectedUser._id,
      from: currentUser.id,
      offer,
       callType: "video",
    });

    console.log("✅ callUser emitted");

  } catch (error) {
    console.log("❌ Video Call Error:", error);
  }
};
  useEffect(() => {
  if (isCalling && localVideoRef.current && localStreamRef.current) {
    console.log("🎥 Attaching local stream to video");

    localVideoRef.current.srcObject = localStreamRef.current;

    localVideoRef.current
      .play()
      .catch((error) => {
        console.log("Video play error:", error);
      });
  }
}, [isCalling]);

const startAudioCall = async () => {
  console.log("📞 Audio Button Clicked");

  try {
    if (!selectedUser) {
      console.log("❌ No user selected");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    console.log("✅ Microphone Access Granted");

    localStreamRef.current = stream;

    setCallType("audio");
    setCallPartnerId(selectedUser._id);
    setIsCalling(true);
    

   const pc = createPeerConnection(selectedUser._id);

    // Add only audio track
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    console.log("📞 SENDING AUDIO CALL");
    console.log("➡️ To:", selectedUser._id);
    console.log("➡️ From:", currentUser.id);

    socket.emit("callUser", {
      to: selectedUser._id,
      from: currentUser.id,
      offer,
      callType: "audio",
    });

    console.log("✅ Audio call emitted");

  } catch (error) {
    console.log("❌ Audio Call Error:", error);
  }
};

const answerCall = async () => {
  try {
    if (!incomingCall) {
      console.log("❌ No incoming call");
      return;
    }

    const isAudioCall = incomingCall.callType === "audio";

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: !isAudioCall,
    });

    console.log("✅ Call media access granted");

    localStreamRef.current = stream;

    // Video only for video calls
    if (!isAudioCall && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setCallType(isAudioCall ? "audio" : "video");
    setCallPartnerId(incomingCall.from);
    setIsCalling(true);

    // IMPORTANT: use the same RTCPeerConnection
    const pc = createPeerConnection(incomingCall.from);

    // Add audio/video tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Get answer
    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    console.log("📞 SENDING ANSWER");

    socket.emit("answerCall", {
      to: incomingCall.from,
      answer,
    });

    setCallAccepted(true);
    setIncomingCall(null);

    console.log("✅ Call answered");

  } catch (error) {
    console.log("❌ Answer Call Error:", error);
  }
};
const endCall = () => {
  console.log("📞 Ending call");

  // Stop camera/microphone
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;
  }

  // Close peer connection
  if (peerConnection.current) {
    peerConnection.current.close();
    peerConnection.current = null;
  }

  // Notify other user
  const receiverId = callPartnerId;
    incomingCall?.from || selectedUser?._id;

  if (receiverId) {
    socket.emit("endCall", {
      to: receiverId,
    });
  }

  // Clear videos
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null;
  }

  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }

  if (remoteAudioRef.current) {
    remoteAudioRef.current.srcObject = null;
  }

  // Reset call state
  setIsCalling(false);
  setCallAccepted(false);
  setIncomingCall(null);
  setCallType(null);
  setCallPartnerId(null);

  console.log("✅ Call ended");
};

const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};


const sendFile = async (e) => {
  try {
    const file = e.target.files[0];

    if (!file || !selectedUser) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("file", file);
    formData.append("receiverId", selectedUser._id);

    const res = await API.post(
      "/message/upload-file",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    socket.emit("sendMessage", res.data);

    setMessages((prev) => [...prev, res.data]);

    e.target.value = "";

  } catch (error) {
    console.log(error);
    alert("File upload failed");
  }
};

const downloadFile = async (message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.get(
      `/message/download/${message._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   const link = document.createElement("a");
link.href = `http://localhost:5000/api/message/download/${message._id}`;
link.download = message.file.name;
link.click();

  } catch (error) {
    console.log(error);
    alert("Download failed");
  }
};

const sendImage = async (e) => {
  console.log("📷 sendImage called");
  try {
    const file = e.target.files[0];

    if (!file || !selectedUser) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("receiverId", selectedUser._id);
    formData.append("text", "");
    formData.append("image", file);

    const res = await API.post(
  "/message/send-image",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    socket.emit("sendMessage", res.data);

    setMessages((prev) => [...prev, res.data]);

    // Reset file input
    e.target.value = "";

  } catch (error) {
    console.log(error);
    alert("Image upload failed");
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const recorder = new MediaRecorder(stream);

    let chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
  const audioBlob = new Blob(chunks, {
    type: "audio/webm",
  });

  uploadAudio(audioBlob);

  stream.getTracks().forEach((track) => track.stop());
};

    recorder.start();

    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);

    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

  } catch (err) {
    console.log(err);
    alert("Microphone permission denied");
  }
};

const stopRecording = () => {
  if (!mediaRecorder) return;

  mediaRecorder.stop();

  clearInterval(recordingInterval.current);

  setIsRecording(false);
};

const uploadAudio = async (audioBlob) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("audio", audioBlob, "voice.webm");
    formData.append("receiverId", selectedUser._id);
    formData.append("duration", recordingTime);

    const res = await API.post(
      "/message/upload-audio",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    socket.emit("sendMessage", res.data);

    setMessages((prev) => [...prev, res.data]);

  } catch (err) {
    console.log(err);
    alert("Audio upload failed");
  }
};

const uploadProfilePicture = async (e) => {
  try {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    const token = localStorage.getItem("token");

    const res = await API.post(
      "/user/upload-profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    setCurrentUser(res.data.user);
    console.log("Current User Object:", currentUser);

    alert("✅ Profile picture updated successfully!");
  } catch (error) {
    console.log(error);
    alert("❌ Upload failed");
  }
};
const getFileIcon = (type, name) => {
  const fileType = type || "";
  const fileName = typeof name === "string" ? name : "";

  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  if (fileType.includes("pdf") || extension === "pdf") {
    return <FaFilePdf className="text-red-600 text-3xl" />;
  }

  if (
    fileType.includes("word") ||
    extension === "doc" ||
    extension === "docx"
  ) {
    return <FaFileWord className="text-blue-600 text-3xl" />;
  }

  if (
    fileType.includes("excel") ||
    extension === "xls" ||
    extension === "xlsx"
  ) {
    return <FaFileExcel className="text-green-600 text-3xl" />;
  }

  if (
    fileType.includes("powerpoint") ||
    extension === "ppt" ||
    extension === "pptx"
  ) {
    return <FaFilePowerpoint className="text-orange-600 text-3xl" />;
  }

  if (
    extension === "zip" ||
    extension === "rar" ||
    extension === "7z"
  ) {
    return <FaFileArchive className="text-yellow-600 text-3xl" />;
  }

  if (fileType.startsWith("image/")) {
    return <FaFileImage className="text-purple-600 text-3xl" />;
  }

  return <FaFileAlt className="text-gray-500 text-3xl" />;
};
const filteredUsers = users.filter((user) =>
  user.name.toLowerCase().includes(search.toLowerCase()) ||
  user.email.toLowerCase().includes(search.toLowerCase())
);
const handleReaction = async (messageId, reaction) => {
  try {
    const res = await API.put(`/message/react/${messageId}`, {
      reaction,
    });

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === messageId
          ? {
              ...message,
              reactions: res.data.reactions,
            }
          : message
      )
    );
  } catch (error) {
    console.log("Reaction error:", error);
  }
};

const handleEditMessage = async (messageId) => {
  try {
    if (!editingText.trim()) return;

    const res = await API.put(`/message/edit/${messageId}`, {
      text: editingText,
    });

    console.log("EDIT RESPONSE:", res.data);

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === messageId
          ? res.data.updatedMessage
          : message
      )
    );

    setEditingMessageId(null);
    setEditingText("");
  } catch (error) {
    console.log("Edit message error:", error);
  }
};

const handleDeleteMessage = async (messageId) => {
  try {
    const res = await API.delete(`/message/delete/${messageId}`);

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === messageId
          ? res.data.updatedMessage
          : message
      )
    );
  } catch (error) {
    console.log("Delete message error:", error);
  }
};

const handleChatbotMessage = async () => {
  if (!chatbotMessage.trim()) return;

  const userMessage = chatbotMessage.trim();

  try {
    setChatbotMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setChatbotMessage("");

    const res = await API.post("/chatbot/message", {
      message: userMessage,
    });

    setChatbotMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: res.data.reply,
      },
    ]);
  } catch (error) {
    console.log("Chatbot error:", error);

    setChatbotMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Sorry, I couldn't process your request.",
      },
    ]);
  }
};

const handleDelete = async (messageId) => {
  try {
    await API.delete(`/message/delete/${messageId}`);

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, text: "This message was deleted", image: "", file: null }
          : msg
      )
    );

    setMessageMenuId(null);
  } catch (error) {
    console.error("Delete message error:", error);
  }
};

const handleEdit = async (messageId) => {
  try {
    if (!editingText.trim()) return;

    const response = await API.put(`/message/edit/${messageId}`, {
      text: editingText,
    });

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, text: editingText }
          : msg
      )
    );

    setEditingMessageId(null);
    setEditingText("");
  } catch (error) {
    console.error("Edit message error:", error);
  }
};

// ===============================
// File Selection
// ===============================
const handleFileChange = (e) => {

  const file = e.target.files[0];

  if (file) {
    setSelectedFile(file);
    console.log("Selected File:", file);
  }

};
const handleLogout = () => {
  // Disconnect socket
  socket.disconnect();
 


  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Go to login page
  navigate("/login");
};
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">

      {incomingCall && !callAccepted && (
  <div className="fixed top-6 right-6 bg-white shadow-xl rounded-xl p-5 z-50">

    <h2 className="font-bold text-lg">
      📹 Incoming Video Call
    </h2>

    <button
      onClick={answerCall}
      className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg"
    >
      Accept
    </button>

  </div>
)
};
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 h-full bg-[#1c2230] border-r border-[#2c3445] flex flex-col ${selectedUser ? "hidden md:flex" : "flex"}`}>
       <div className="p-5 border-b border-[#2c3445] flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div>
  <img
    src={
      currentUser?.profilePic ||
      "https://via.placeholder.com/60?text=User"
    }
    alt="Profile"
    className="w-14 h-14 rounded-full object-cover border cursor-pointer"
    onClick={() => fileInputRef.current.click()}
  />

  <input
    type="file"
    ref={fileInputRef}
    onChange={uploadProfilePicture}
    className="hidden"
    accept="image/*"
  />
</div>

    <div>
      <h2  className="font-bold text-white"></h2>

      <p  className="text-sm text-gray-400">
        {currentUser?.email}
      </p>
    </div>
  </div>

  <button
    onClick={handleLogout}
    className="bg-[#252b3a] text-gray-400 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
  >
    Logout
  </button>
</div>


        <div  className="px-5 py-4">
          <input
  type="text"
  placeholder="Search conversations"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
 className="w-full h-11 px-4 rounded-xl bg-[#202533] border border-[#2c3445] text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
/>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-5">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => {
  setSelectedUser(user);
  fetchMessages(user._id);
}}
                className={`p-4 cursor-pointer transition border-l-2 ${
  selectedUser?._id === user._id
    ? "bg-[#252b3a] border-blue-500"
    : "border-transparent hover:bg-[#222938]"
}`}
              >
                <div className="flex items-center justify-between">
  {/* Left Side */}
  <div className="flex items-center gap-3">
    <img
      src={
        user.profilePic ||
        "https://via.placeholder.com/45?text=User"
      }
      alt={user.name}
      className="w-11 h-11 rounded-full object-cover border"
    />

    <div>
      <h3 className="font-semibold text-white">{user.name}</h3>
      <p className="text-sm text-gray-400">{user.email}</p>
    </div>
  </div>

  {/* Right Side */}
  <div className="flex items-center gap-2">
    <span
      className={`w-2.5 h-2.5 rounded-full ${
        onlineUsers.includes(user._id)
          ? "bg-green-500"
          : "bg-gray-400"
      }`}
    ></span>

    <span
  className={`text-xs ${
    onlineUsers.includes(user._id)
      ? "text-emerald-400"
      : "text-gray-500"
  }`}
>
      {onlineUsers.includes(user._id)
        ? "Online"
        : "Offline"}
    </span>
  </div>
</div>
                
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 px-3 md:px-4 py-3 border-t border-white/5 shrink-0">

  <button
    onClick={() => setChatbotOpen(true)}
    title="Security Assistant"
    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252b3a] transition"
  >
    <FaRobot />
  </button>

  <button
    title="Settings"
    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252b3a] transition"
  >
    <FaCog />
  </button>

</div>
      </div>

      {/* ================= CHATBOT ================= */}
{chatbotOpen && (
  <div className="fixed bottom-20 left-3 right-3 md:left-5 md:right-auto z-[100] w-auto md:w-80 h-[450px] bg-[#1c2230] border border-[#2c3445] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

    {/* Header */}
    <div className="bg-[#252c3b] text-white px-4 py-3 flex justify-between items-center border-b border-[#343c4e]">

      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <FaRobot />
          Security Assistant
        </h3>

        <p className="text-xs text-gray-400">
          QuickTalk Security Bot
        </p>
      </div>

      <button
        onClick={() => setChatbotOpen(false)}
        className="text-gray-400 hover:text-white text-lg"
      >
        ✕
      </button>

    </div>


    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#151922]">

      {chatbotMessages.length === 0 && (
        <div className="bg-[#242a39] text-gray-200 rounded-xl p-3 text-sm">
          👋 Hi! I'm your Security Assistant.
          <br />
          Ask me about passwords, phishing, OTPs, 2FA or account security.
        </div>
      )}

      {chatbotMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.sender === "user"
              ? "justify-end"
              : "justify-start"
          }`}
        >

          <div
            className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
              message.sender === "user"
                ? "bg-[#3f61b5] text-white"
                : "bg-[#242a39] text-gray-200"
            }`}
          >
            {message.text}
          </div>

        </div>
      ))}

    </div>


    {/* Input */}
    <div className="border-t border-[#2c3445] p-2 flex gap-2 bg-[#1c2230]">

      <input
        type="text"
        value={chatbotMessage}
        onChange={(e) => setChatbotMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleChatbotMessage();
          }
        }}
        placeholder="Ask a security question..."
        className="flex-1 bg-[#252b3a] border border-[#343c4e] text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <button
        onClick={handleChatbotMessage}
        className="bg-[#3f61b5] text-white px-3 rounded-lg hover:bg-[#4b70cc] transition"
      >
        <FaPaperPlane />
      </button>

    </div>

  </div>
)}

      {/* Chat Area */}
      <div className={`flex-1 min-w-0 flex flex-col ${selectedUser ? "flex" : "hidden md:flex"}`}>
        {selectedUser ? (
          <>
            <div className="min-h-[76px] px-3 md:px-6 py-3 border-b border-[#292f3e] flex items-center justify-between bg-[#11141c] gap-2">

  {/* Left */}
 <div className="flex items-center gap-3">

  {/* Profile */}
  <div className="relative">

    <img
      src={
        selectedUser.profilePic ||
        "https://via.placeholder.com/50?text=User"
      }
      alt={selectedUser.name}
      className="w-12 h-12 rounded-full object-cover border border-[#394255]"
    />

    {/* Online Status */}
    <span
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#11141c] ${
        onlineUsers.includes(selectedUser._id)
          ? "bg-emerald-400"
          : "bg-gray-500"
      }`}
    />
  </div>
  <button
  onClick={() => setSelectedUser(null)}
  className="md:hidden text-gray-300 text-xl mr-2"
>
  ←
</button>

  {/* User Details */}
  <div className="min-w-0">

    <h2 className="text-lg font-semibold text-white truncate">
      {selectedUser.name}
    </h2>

    {isTyping ? (
      <p className="text-emerald-400 text-sm font-medium">
        Typing...
      </p>
    ) : (
      <p
        className={`text-sm ${
          onlineUsers.includes(selectedUser._id)
            ? "text-emerald-400"
            : "text-gray-500"
        }`}
      >
        {onlineUsers.includes(selectedUser._id)
          ? "Active now"
          : "Offline"}
      </p>
    )}

  </div>

</div>
  {/* Right */}
 {/* Actions */}
  <div className="flex items-center gap-2">

    {/* Audio Call */}
    <button
      onClick={startAudioCall}
      className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#1c2230] border border-[#2a3141] text-gray-400 hover:text-white hover:bg-[#252c3b] transition flex items-center justify-center"
      title="Audio Call"
    >
      <FaPhone />
    </button>

    {/* Video Call */}
    <button
      onClick={() => startVideoCall(selectedUser)}
      className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-[#1c2230] border border-[#2a3141] text-gray-400 hover:text-white hover:bg-[#252c3b] transition flex items-center justify-center"
      title="Video Call"
    >
      <FaVideo />
    </button>

    {/* More */}
    <button
      className="w-11 h-11 rounded-xl bg-[#1c2230] border border-[#2a3141] text-gray-400 hover:text-white hover:bg-[#252c3b] transition flex items-center justify-center"
      title="More"
    >
      <FaEllipsisH />
    </button>

  </div>


</div>

{incomingCall && (
  <div className="fixed top-4 left-4 right-4 md:top-5 md:right-5 md:left-auto md:w-80 bg-white shadow-lg p-5 rounded-lg z-50">
    <h3 className="font-semibold text-lg">
      Incoming Call
    </h3>

    <p className="text-sm">
      Someone is calling you...
    </p>

    <div className="flex gap-3 mt-4">
      <button
        onClick={acceptCall}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Accept
      </button>

      <button
        onClick={rejectCall}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Reject
      </button>
    </div>
  </div>
)}

{(isCalling || callAccepted) && (
  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 p-3 md:p-4">

    {/* =========================
        VIDEO CALL
    ========================= */}
    {callType === "video" && (
      <>
        {/* Your Video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-64 h-48 bg-black rounded-lg object-cover"
        />

        {/* Other Person Video */}
        {callAccepted && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-64 h-48 bg-black rounded-lg object-cover"
          />
        )}
      </>
    )}

    {/* =========================
        AUDIO CALL
    ========================= */}
    {callType === "audio" && (
      <div className="w-full sm:w-auto flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl">

        <div className="text-5xl mb-5 px-6">
          📞
        </div>

        <p className="font-semibold text-lg">
          Audio Call
        </p>

        <p className="text-sm text-gray-500">
          {callAccepted ? "Connected" : "Calling..."}
        </p>

      </div>
    )}

    {/* Remote Audio */}
    <audio
      ref={remoteAudioRef}
      autoPlay
      playsInline
    />
     <button
  onClick={endCall}
  className="w-full sm:w-auto bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
>
  📞 End Call
</button>


  </div>
  
)}

<div className="flex-1 min-w-0 overflow-y-auto p-3 md:p-6 bg-[#10131b]">
  {messages.map((message, index) => (
    <div
      key={message._id || index}
      onDoubleClick={(e) => {
  e.stopPropagation();

  console.log("DOUBLE CLICK:", message._id);
  console.log("SENDER:", message.senderId);
  console.log("CURRENT USER:", currentUser.id);

  if (String(message.senderId) === String(currentUser.id)) {
    setMessageMenuId(message._id);
  }
}}
      className={`mb-5 flex px-1 md:px-2 ${
        String(message.senderId) === String(currentUser.id)
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`relative px-4 md:px-5 py-3 rounded-2xl max-w-[85%] md:max-w-md shadow-sm ${
          String(message.senderId) === String(currentUser.id)
            ? "bg-[#3f61b5] text-white rounded-br-md"
            : "bg-[#242a39] text-white rounded-bl-md"
        }`}
      >
        {message.replyTo?.messageId && (
  <div className="mb-2 rounded-lg bg-[#151a24] border-l-2 border-blue-400 px-3 py-2">
    <p className="text-xs text-blue-400 mb-1">
      Replying to
    </p>

    <p className="text-xs text-gray-400 truncate">
      {message.replyTo.text
        ? message.replyTo.text
        : message.replyTo.image
        ? "🖼️ Image"
        : message.replyTo.file?.name
        ? `📎 ${message.replyTo.file.name}`
        : message.replyTo.file?.url
        ? "📎 Document"
        : message.replyTo.audio?.url
        ? "🎵 Audio"
        : "This message was deleted"}
    </p>
  </div>
)}
 {message.image && (
  <img
    src={message.image}
    alt="Shared"
    className="max-w-[250px] rounded-lg mb-2"
  />
)}


{message.file?.url && (
  <div className="mt-2 border rounded-xl bg-white p-3 shadow-sm">

    <div className="flex items-center gap-3">
      {getFileIcon(message.file?.type, message.file?.name)}

      <div className="flex-1 overflow-hidden">
        <p className="font-semibold truncate">
          {message.file.name}
        </p>

        <p className="text-xs text-gray-500">
          {(message.file.size / 1024).toFixed(2)} KB
        </p>
      </div>
    </div>

    <div className="flex gap-3 mt-3">

      <a
        href={message.file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Open
      </a>

      <a
        href={message.file.url}
        download={message.file.name}
        className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        Download
      </a>

    </div>

  </div>
)}

{message.audio?.url && (
  <div className="mt-2">
    <audio controls className="w-full max-w-[280px]">
      <source
        src={message.audio.url}
        type="audio/webm"
      />
      Your browser does not support audio.
    </audio>

    <div className="text-xs text-gray-500 mt-1">
      🎤 {message.audio.duration}s
    </div>
  </div>
)}


{message.text && (
  <>
    {editingMessageId === message._id ? (
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          className="border rounded-lg px-2 py-1 text-black outline-none"
          autoFocus
        />

        <button
          onClick={() => handleEditMessage(message._id)}
          className="text-green-600 font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => {
            setEditingMessageId(null);
            setEditingText("");
          }}
          className="text-red-500 font-semibold"
        >
          Cancel
        </button>
      </div>
    ) : (
      <div
        className={
          message.text === "This message was deleted"
            ? "italic text-gray-400"
            : ""
        }
      >
        {message.text === "This message was deleted"
          ? "🚫 This message was deleted"
          : message.text}
      </div>
    )}
  </>
)}

{String(message.senderId) === String(currentUser.id) && (
    <div className="text-right text-xs mt-1">
             {message.status === "sent" && "✓"}

{message.status === "delivered" && "✓✓"}

{message.status === "seen" && (
  <span className="text-blue-300">
    ✓✓
  </span>
)}
    </div>
  )}

 {messageMenuId === message._id &&(
 
    <div className="absolute right-0 bottom-full mb-2 z-50 bg-[#1c2230] border border-[#30384a] rounded-xl shadow-xl overflow-hidden min-w-[120px] max-w-[85vw]">
      
      <button
  onClick={() => {
    setReplyingTo(message);
    setMessageMenuId(null);
  }}
  className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-[#293144] transition"
>
  ↩️ Reply
</button>

      <button
  onClick={() => {
    setEditingMessageId(message._id);
    setEditingText(message.text || "");
    setMessageMenuId(null);
  }}
  className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-[#293144] transition"
>
  ✏️ Edit
</button>

     <button
  onClick={() => {
    handleDelete(message._id);
    setMessageMenuId(null);
  }}
  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[#293144] transition"
>
  🗑️ Delete
</button>

    </div>
  )}
  {/* Reactions */}

{message.text !== "This message was deleted" && (
  <div className="flex flex-wrap gap-1 mt-2">
    {["❤️", "😂", "👍", "😢", "😡"].map((reaction) => (
      <button
        key={reaction}
        onClick={() => handleReaction(message._id, reaction)}
        className="text-sm hover:scale-125 transition-transform"
      >
        {reaction}
      </button>
    ))}
  </div>
)}

{/* Show selected reaction */}

{message.reactions &&
  Object.values(message.reactions).length > 0 && (
    <div className="mt-1 text-sm">
      {Object.values(message.reactions).join(" ")}
    </div>
  )} 
  
</div>
    </div>
  ))}

  <div ref={chatEndRef}></div>
</div>

<div className="relative p-3 md:p-4 bg-white border-t flex gap-2 md:gap-3 flex-wrap">
  {showEmojiPicker && (
  <div className="absolute bottom-20 left-3 md:left-5 z-50 max-w-[calc(100vw-24px)] overflow-hidden">
    <EmojiPicker
      onEmojiClick={onEmojiClick}
      width={320}
      height={400}
    />
  </div>
)}
  
  <input
  type="file"
  ref={imageInputRef}
  accept="image/*"
  className="hidden"
  onChange={sendImage}
/>

<input
  type="file"
  ref={documentInputRef}
  className="hidden"
  onChange={sendFile}
/>


<button
  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
  className="bg-yellow-500 text-white px-3 md:px-4 py-3 rounded-lg hover:bg-yellow-600"
>
  😊
</button>
{selectedImage && (
  <div className="flex items-center text-sm text-green-600">
    📷 {selectedImage.name}
  </div>
)}

{replyingTo && (
  <div className="mb-2 flex items-center justify-between rounded-lg bg-[#1c2230] border border-[#30384a] px-3 py-2">
    <div className="min-w-0">
      <p className="text-xs text-blue-400 mb-1">
        Replying to
      </p>

      <p className="text-sm text-gray-300 truncate">
  {replyingTo.text
    ? replyingTo.text
    : replyingTo.image
    ? "🖼️ Image"
    : replyingTo.file?.name
    ? `📎 ${replyingTo.file.name}`
    : replyingTo.audio?.url
    ? "🎵 Audio message"
    : "Attachment"}
</p>
    </div>

   <button
  onClick={() => setReplyingTo(null)}
  className="text-gray-400 hover:text-white px-2 text-lg"
>
  ✕
</button>
  </div>
)}

  <input
    type="text"
    placeholder="Type a message..."
    value={text}
   onChange={(e) => {
  setText(e.target.value);

  socket.emit("typing", {
    senderId: currentUser.id,
    receiverId: selectedUser._id,
  });

  clearTimeout(window.typingTimer);

  window.typingTimer = setTimeout(() => {
    socket.emit("stopTyping", {
      receiverId: selectedUser._id,
    });
  }, 1000);
}}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    }}
    className="flex-1 min-w-[150px] border rounded-lg p-3 outline-none"
  />
  <div className="relative">

  <button
    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
    className="bg-[#252c3b] text-gray-300 px-4 py-3 rounded-xl hover:bg-[#30384a] transition"
  >
    📎
  </button>

  {showAttachmentMenu && (
    <div className="absolute bottom-14 left-0 w-44 bg-[#1c2230] border border-[#2c3445] rounded-xl shadow-2xl p-2 z-50">

      <button
        onClick={() => {
          imageInputRef.current.click();
          setShowAttachmentMenu(false);
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-200 hover:bg-[#2a3141] transition"
      >
        🖼️
        <span>Image</span>
      </button>

      <button
        onClick={() => {
          documentInputRef.current.click();
          setShowAttachmentMenu(false);
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-200 hover:bg-[#2a3141] transition"
      >
        📄
        <span>Document</span>
      </button>

    </div>
  )}

</div>

<button
  onClick={isRecording ? stopRecording : startRecording}
  className={`text-white px-4 rounded-lg ${
    isRecording
      ? "bg-red-600 hover:bg-red-700"
      : "bg-gray-700 hover:bg-gray-800"
  }`}
>
  {isRecording ? "⏹" : "🎤"}
</button>

{isRecording && (
  <div className="flex items-center text-red-600 font-semibold">
    🔴 Recording {recordingTime}s
  </div>
)}

  <button
    onClick={sendMessage}
    className="bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-blue-700"
  >
    Send
  </button>
</div>
           
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-2xl">
            Select a user to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;