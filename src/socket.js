import { io } from "socket.io-client";

const socket = io("https://queuecure-1.onrender.com", {
  transports: ["websocket"]
});

export default socket;