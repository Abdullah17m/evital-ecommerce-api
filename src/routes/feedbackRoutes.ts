import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { addFeedbackController, deleteFeedbackController, getAllFeedbacksController, getProductFeedbackController, updateFeedbackController } from "../controllers/feedbackController";
import { validateRequest } from "../middlewares/validateRequest";
import { feedbackSchema, updateFeedbackSchema } from "../middlewares/feedbackValidation";
const router = express.Router();

router.post("/",authenticate,validateRequest(feedbackSchema),addFeedbackController);
router.get("/",authenticate,getAllFeedbacksController);
router.get("/product/:id",authenticate,getProductFeedbackController);
router.patch("/",authenticate,validateRequest(updateFeedbackSchema),updateFeedbackController);
router.delete("/",authenticate,deleteFeedbackController);

export default router;
