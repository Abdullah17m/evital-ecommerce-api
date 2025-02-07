import express from "express";
import { adminAuth, authenticate } from "../middlewares/authMiddleware";
import { cancelOrderController, createOrdersController, getAdminOrdersController, getAllUserOrdersController, getOrderByIdController, updateOrderStatusController } from "../controllers/orderController";
import { validateRequest } from "../middlewares/validateRequest";
import { orderValidationSchema } from "../middlewares/orderValidation";
const router = express.Router();

router.post("/",authenticate,validateRequest(orderValidationSchema),createOrdersController);
router.get("/",authenticate,adminAuth,getAdminOrdersController);
router.get("/user",authenticate,getAllUserOrdersController);
router.get("/details",authenticate,getOrderByIdController);
router.patch("/status", authenticate,adminAuth,updateOrderStatusController);
router.delete("/cancel",authenticate,cancelOrderController);

export default router;