import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});

console.log("🔌 SOCKET FILE LOADED");

socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("🔴 SOCKET ERROR:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🟠 SOCKET DISCONNECTED:", reason);
});

export default socket;