/**
 * @file authMiddleware.js
 * @description Verifies the JWT cookie and attaches the user to the request.
 *
 * This middleware keeps protected route logic clean by handling authentication
 * before controllers run.
 */
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/**
 * @description Validates the auth cookie and stores decoded user data on req.user.
 * @returns A 401 JSON response when the cookie is missing or invalid.
 * @route N/A
 * @access Private
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.[config.jwtCookieName];

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
