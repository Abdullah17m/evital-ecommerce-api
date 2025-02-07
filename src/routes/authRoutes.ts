import express from "express";
import { registerUser,loginUser, getProfile } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../middlewares/authValidation";
import { authenticate } from "../middlewares/authMiddleware";
const router = express.Router();

router.post("/register", validateRequest(registerSchema),registerUser);
router.post("/login", validateRequest(loginSchema),loginUser);
//router.post("/logout", /* Controller Function */);
router.get("/profile",authenticate, getProfile);

export default router;
