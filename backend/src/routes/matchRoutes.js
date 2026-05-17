import { Router } from "express";
import {
  dislikeUser,
  getMyMatchesController,
  getUsersForMatching,
  likeUser,
} from "../controllers/matchController.js";
import authMiddleware from "../middleware/authMiddleware.js";

/**
 * @file matchRoutes.js
 * @description Declares all matching-related API endpoints.
 *
 * These routes stay thin so the controller layer can handle all business logic.
 */
const router = Router();

router.get("/users", authMiddleware, getUsersForMatching);
router.post("/like/:targetUserId", authMiddleware, likeUser);
router.post("/dislike/:targetUserId", authMiddleware, dislikeUser);
router.get("/my-matches", authMiddleware, getMyMatchesController);

export default router;
