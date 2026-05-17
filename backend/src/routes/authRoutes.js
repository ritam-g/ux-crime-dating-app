/**
 * @file authRoutes.js
 * @description Declares authentication endpoints for register, login, and logout.
 *
 * This file should only map routes to controller functions and avoid business logic.
 */
import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/authController.js";

const router = Router();

/**
 * @description Registers a new user and sets the auth cookie.
 * @returns The controller response.
 * @route POST /api/auth/register
 * @access Public
 */
router.post("/register", registerUser);

/**
 * @description Logs a user in and sets the auth cookie.
 * @returns The controller response.
 * @route POST /api/auth/login
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @description Logs a user out by clearing the auth cookie.
 * @returns The controller response.
 * @route POST /api/auth/logout
 * @access Private
 */
router.post("/logout", logoutUser);

export default router;
