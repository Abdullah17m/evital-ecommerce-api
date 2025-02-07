import express from "express";
import { adminAuth, authenticate } from "../middlewares/authMiddleware";
import { getAllUsers, getUserById, updateUserController } from "../controllers/userController";
const router = express.Router();


router.get("/", authenticate, adminAuth,getAllUsers);
router.get("/:id",authenticate,getUserById);
router.patch("/:id",authenticate,updateUserController);
// router.delete("/:id", /* Delete user (admin) */);

export default router;
