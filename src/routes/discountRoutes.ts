import express from "express";
import {
    createDiscountController,
    getAllDiscountsController,
    getDiscountByIdController,
    updateDiscountController,
    deleteDiscountController
} from "../controllers/discountController";
import { adminAuth, authenticate } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { discountSchema, updatediscountSchema } from "../middlewares/discountValidation";

const router = express.Router();

router.post("/", authenticate, adminAuth,validateRequest(discountSchema), createDiscountController);
router.get("/", authenticate, getAllDiscountsController);
router.get("/:id", authenticate, getDiscountByIdController);
router.patch("/", authenticate, adminAuth,validateRequest(updatediscountSchema), updateDiscountController);
router.delete("/", authenticate, adminAuth, deleteDiscountController);

export default router;
