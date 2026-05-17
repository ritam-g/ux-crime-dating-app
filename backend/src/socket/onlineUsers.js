/**
 * @file onlineUsers.js
 * @description In-memory tracking of online user socket connections.
 */

const onlineUsers = new Map(); // userId -> Set of socketIds

/**
 * Adds a socket connection for a user.
 * @param {string} userId 
 * @param {string} socketId 
 */
export const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

/**
 * Removes a socket connection.
 * @param {string} socketId 
 * @returns {string|null} The userId associated with the socket connection, if found.
 */
export const removeOnlineUser = (socketId) => {
  for (const [userId, socketIds] of onlineUsers.entries()) {
    if (socketIds.has(socketId)) {
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        onlineUsers.delete(userId);
      }
      return userId;
    }
  }
  return null;
};

/**
 * Checks if a user has any active socket connections.
 * @param {string} userId 
 * @returns {boolean}
 */
export const isUserOnline = (userId) => {
  const socketIds = onlineUsers.get(userId);
  return !!(socketIds && socketIds.size > 0);
};

export default {
  addOnlineUser,
  removeOnlineUser,
  isUserOnline,
};
