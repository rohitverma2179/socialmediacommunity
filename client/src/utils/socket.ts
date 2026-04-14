import { io } from "socket.io-client";

const SOCKET_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : "https://community-final-vf8t.vercel.app";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;