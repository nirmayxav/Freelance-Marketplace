import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001"; // Adjust if needed

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,  // Ensures the socket connects automatically
  reconnectionAttempts: 5, // Retry connection 5 times if failed
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", (reason) => console.warn("❌ Socket disconnected:", reason));
socket.on("connect_error", (error) => console.error("⚠️ Socket connection error:", error));
