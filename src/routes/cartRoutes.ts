import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { addProductCartController, createCartController, deleteCartController, deleteProductCartController, getAllCartsController, getCartByIdController, updateProductCartController } from "../controllers/cartController";
import { validateRequest } from "../middlewares/validateRequest";
import { addProductCartSchema, updateProductCartSchema } from "../middlewares/cartValidation";

const router = express.Router();

router.get("/", authenticate,getAllCartsController);
router.get("/items/:id", authenticate,getCartByIdController);
router.post("/", authenticate,createCartController);
router.post("/items", authenticate,validateRequest(addProductCartSchema), addProductCartController);
router.patch("/items/:id",authenticate,validateRequest(updateProductCartSchema),updateProductCartController);
router.delete("/items/:id",authenticate,deleteProductCartController);
router.delete("/clear", authenticate,deleteCartController);

export default router;