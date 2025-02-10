import express from "express";
import {
    createReturnRequestController,
    getAllReturnsController,
    getReturnDetailsController,
    updateReturnStatusController,
    getReturnItemsController
   
} from "../controllers/returnController";
import { authenticate, adminAuth } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import returnRequestSchema from "../middlewares/returnValidation";

const router = express.Router();

router.post("/", authenticate,validateRequest(returnRequestSchema), createReturnRequestController);
router.get("/", authenticate, adminAuth, getAllReturnsController);
router.get("/details", authenticate, adminAuth,getReturnDetailsController);
router.patch("/", authenticate, adminAuth, updateReturnStatusController);
// router.post("/:returnId/items", authenticate, addReturnItemsController);
router.get("/user", authenticate, getReturnItemsController);


export default router;
