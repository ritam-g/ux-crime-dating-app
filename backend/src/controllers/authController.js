import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../dao/user.dao.js";
import config from "../config/config.js";

/**
 * Creates a safe user object for API responses.
 * We remove password here so controllers never leak sensitive data by accident.
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
 * Registers a new user.
 * The password is hashed before the record is saved so plain text never reaches MongoDB.
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

    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * Logs a user in after checking their email and password.
 * The DAO fetches the password hash only for this route.
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

    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};
