import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001"; // Adjust if needed
export const socket = io(SOCKET_URL, {
  autoConnect: false, // Important!
  auth: (cb) => {
    const token = localStorage.getItem('token');
    cb({ token });
  }
});

// Connect only after auth
export const connectSocket = () => {
  if (localStorage.getItem('token')) {
    socket.connect();
  }
};