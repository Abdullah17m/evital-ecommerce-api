import express from "express";
import { adminAuth, authenticate } from "../middlewares/authMiddleware";
import {
    addProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
    searchAndFilterProducts
} from "../controllers/productController";
import { validateRequest } from "../middlewares/validateRequest";
import searchAndFilterSchema, { productSchema, updateProductSchema } from "../middlewares/productValidation";

const router = express.Router();

// Routes
router.post("/", authenticate, adminAuth, validateRequest(productSchema),addProductController);
router.get("/", getAllProductsController); 
router.get("/search",validateRequest(searchAndFilterSchema), searchAndFilterProducts); 
router.get("/:id", getProductByIdController);
router.patch("/:id", authenticate, adminAuth,validateRequest(updateProductSchema),updateProductController); 
router.delete("/", authenticate, adminAuth, deleteProductController); 

export default router;
