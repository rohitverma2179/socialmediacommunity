import { Router } from "express";
import { signup, login, verifyEmail, googleLogin, facebookLogin, getMe, logout, verifyOTP, resendOTP, toggleSavedPost } from "../controllers/User.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);
router.get("/me", protect, getMe);
router.post("/saved/:postId", protect, toggleSavedPost);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

export default router;
