import express from "express";
import { login, logout, signUp,refreshToken,getProfile, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router  = express.Router()

router.post("/signup", signUp)
router.post("/login", login)
router.post("/logout",protectRoute, logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post("/refresh-token", refreshToken)
router.get("/profile",protectRoute, getProfile)

export default router;