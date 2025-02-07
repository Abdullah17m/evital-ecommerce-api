import express from "express";
import { adminAuth, authenticate } from "../middlewares/authMiddleware";
import {
    createCategoryController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController
} from "../controllers/categoryController";
import { validateRequest } from "../middlewares/validateRequest";
import { categorySchema, UpdatecategorySchema } from "../middlewares/productValidation";

const router = express.Router();

router.post("/", authenticate, adminAuth,validateRequest(categorySchema), createCategoryController);
router.get("/", getAllCategoriesController);
// router.get("/:id", getCategoryByIdController);
router.patch("/", authenticate, adminAuth,validateRequest(UpdatecategorySchema), updateCategoryController); 
router.delete("/", authenticate, adminAuth, deleteCategoryController); 

export default router;
