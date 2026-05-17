/**
 * @file authController.js
 * @description Handles registration, login, and logout for cookie-based JWT auth.
 *
 * This controller hashes passwords, generates JWTs, stores them in HTTP-only
 * cookies, and returns only safe user data to the client.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { createUser, findUserByEmail } from "../dao/user.dao.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookies.js";

/**
 * @description Creates a safe user object for API responses.
 * @returns A user object without sensitive fields.
 * @route N/A
 * @access Private
 */
const buildSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  bio: user.bio,
  interests: user.interests,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @description Generates a signed JWT for the user.
 * @returns A JWT string.
 * @route N/A
 * @access Private
 */
const createAuthToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * @description Registers a user, stores the JWT cookie, and returns safe user data.
 * @returns JSON response with message and user.
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, bio, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      bio,
      interests,
    });

    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully",
      user: buildSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * @description Logs a user in, stores the JWT cookie, and returns safe user data.
 * @returns JSON response with message and user.
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      user: buildSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/**
 * @description Clears the auth cookie so the user is logged out.
 * @returns JSON response confirming logout.
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = async (req, res) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
