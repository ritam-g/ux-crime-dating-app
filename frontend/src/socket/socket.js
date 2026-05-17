/**
 * @file socket.js
 * @description Shared Socket.io client for real-time chat.
 *
 * The app uses this singleton client to join match rooms and receive messages
 * without needing to reconnect from every component.
 */
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export default socket;
