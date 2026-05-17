import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  updateProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.middleware.js";

/**
 * User routes are protected because they expose private profile data.
 * The auth middleware makes sure only logged-in users can reach them.
 */
const router = Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Secure ImageKit profile picture upload endpoint
router.post("/upload-profile-image", authMiddleware, upload.single("profileImage"), uploadProfileImage);

// Extended profile updater
router.put("/update-profile", authMiddleware, updateProfile);

export default router;
