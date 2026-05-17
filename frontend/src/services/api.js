/**
 * @file api.js
 * @description Central API service for all backend HTTP calls.
 *
 * This keeps requests in one place so pages stay focused on UI and state,
 * while the service layer handles URLs, credentials, and response shaping.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put("/user/profile", payload);
  return response.data;
};

export const getMatchUsers = async () => {
  const response = await api.get("/match/users");
  return response.data;
};

export const likeUser = async (id) => {
  const response = await api.post(`/match/like/${id}`);
  return response.data;
};

export const dislikeUser = async (id) => {
  const response = await api.post(`/match/dislike/${id}`);
  return response.data;
};

export const getMyMatches = async () => {
  const response = await api.get("/match/my-matches");
  return response.data;
};

export const getChatHistory = async (conversationId) => {
  const response = await api.get(`/chat/${conversationId}`);
  return response.data;
};

export const sendChatMessage = async (payload) => {
  const response = await api.post("/chat/send", payload);
  return response.data;
};

/**
 * Returns the peer profile involved in a conversation, ensuring we don't show the logged-in user.
 * 
 * @param {Object} conversation 
 * @param {string} currentUserId 
 * @returns {Object|null}
 */
export const getOtherParticipant = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) return null;

  const initiatorId = conversation.initiator?._id || conversation.initiator?.id || conversation.initiator;
  const targetId = conversation.targetUser?._id || conversation.targetUser?.id || conversation.targetUser;

  const initiatorStr = String(initiatorId);
  const currentUserStr = String(currentUserId);

  return initiatorStr === currentUserStr ? conversation.targetUser : conversation.initiator;
};

export default api;
