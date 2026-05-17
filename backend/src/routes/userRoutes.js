import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

/**
 * User routes are protected because they expose private profile data.
 * The auth middleware makes sure only logged-in users can reach them.
 */
const router = Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

export default router;
