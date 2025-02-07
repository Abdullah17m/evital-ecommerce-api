import express from "express";
import {
    createReturnRequestController,
    getAllReturnsController,
    getReturnDetailsController,
    updateReturnStatusController,
   
    getReturnItemsController,
   
} from "../controllers/returnController";
import { authenticate, adminAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticate, createReturnRequestController);
router.get("/", authenticate, adminAuth, getAllReturnsController);
router.get("/details", authenticate, adminAuth,getReturnDetailsController);
router.patch("/", authenticate, adminAuth, updateReturnStatusController);
// router.post("/:returnId/items", authenticate, addReturnItemsController);
router.get("/user", authenticate, getReturnItemsController);


export default router;
