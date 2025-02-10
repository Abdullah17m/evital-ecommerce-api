import { Request, Response } from "express";
import { FeedbackService } from "../models/feedbackModel";
import { AuthenticatedRequest } from "../types/express";
import { formatResponse } from "../utils/helper";

const feedbackService = new FeedbackService();

// Add Feedback
export const addFeedbackController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.userId;
        req.body.user_id = user_id;

        const result = await feedbackService.add(req.body);

        res.status(result.error ? 400 : 201).json(result);
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Get All Feedbacks
export const getAllFeedbacksController = async (_req: Request, res: Response) => {
    try {
        const result = await feedbackService.getAll();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Get Feedback for Specific Product
export const getProductFeedbackController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await feedbackService.getByProduct(Number(id));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching product feedback:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Update Feedback (Only Author)
export const updateFeedbackController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { feedback_id, rating, comment } = req.body;

        const result = await feedbackService.update(feedback_id, user_id, {rating, comment});

        res.status(result.error ? 403 : 200).json(result);
    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Delete Feedback (Only Author)
export const deleteFeedbackController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { feedback_id } = req.body;

        const result = await feedbackService.delete(feedback_id, user_id);

        res.status(result.error ? 403 : 200).json(result);
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};
