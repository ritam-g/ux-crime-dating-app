import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

/**
 * Auth routes handle registration and login only.
 * Keeping them separate makes the API easier to extend later.
 */
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
