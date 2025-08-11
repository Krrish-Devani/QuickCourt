import { Router } from "express";
import { userValidate, loginValidate } from "../middleware/Validate.js";
import { checkAuthMiddleware } from "../middleware/checkAuthMiddleware.js";

import { signup, login, logout, checkAuth, verifyEmail, updateProfile, getUserActivity } from "../controllers/auth.controller.js";

const router = Router();

router.post('/signup', userValidate, signup);
router.post('/login', loginValidate, login);
router.post('/logout', logout);

router.post("/verify-email", verifyEmail);

router.put('/update-profile', checkAuthMiddleware, updateProfile);

router.get('/check-auth', checkAuthMiddleware, checkAuth);

router.get('/activity', checkAuthMiddleware, getUserActivity);

export default router;
