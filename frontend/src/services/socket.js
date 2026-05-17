/**
 * @file socket.js
 * @description Shared Socket.io service for realtime chat.
 *
 * The socket is intentionally kept separate from HTTP so the app can use REST
 * for history and Socket.io for live delivery without mixing concerns.
 */
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinRoom = (matchId) => {
  socket.emit("join_room", { matchId });
};

export const sendMessage = (payload) => {
  socket.emit("send_message", payload);
};

export const onReceiveMessage = (handler) => {
  socket.on("receive_message", handler);
};

export const offReceiveMessage = (handler) => {
  socket.off("receive_message", handler);
};

export default socket;
