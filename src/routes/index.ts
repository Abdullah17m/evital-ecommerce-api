import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import addressRoutes from "./addressRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import orderRoutes from "./orderRoutes";
import returnRoutes from "./returnRoutes";
import feedbackRoutes from "./feedbackRoutes";
import discountRoutes from "./discountRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/addresses", addressRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/returns", returnRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/discounts", discountRoutes);

export default router;
