/**
 * @file socket.js
 * @description Shared Socket.io client for real-time chat.
 *
 * The app uses this singleton client to join match rooms and receive messages
 * without needing to reconnect from every component.
 */
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
