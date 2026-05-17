import { Router } from "express";
import { getChatHistory, sendMessage } from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

/**
 * @file chatRoutes.js
 * @description Declares the chat REST API endpoints.
 *
 * The socket layer handles live delivery, while these routes handle history
 * and message persistence through the controller and DAO layers.
 */
const router = Router();

router.get("/:matchId", authMiddleware, getChatHistory);
router.post("/send", authMiddleware, sendMessage);

export default router;
