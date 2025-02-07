import { Request, Response } from "express";
import {
    addFeedback,
    getAllFeedbacks,
    getProductFeedback,
    updateFeedback,
    deleteFeedback
} from "../models/feedbackModel";
import { AuthenticatedRequest } from "../types/express";

// Add Feedback
export const addFeedbackController = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
    try {
        const user_id = req.user?.userId; // Extract user ID
        req.body.user_id = user_id;

        const result = await addFeedback(req.body);

        if (result.error) {
             res.status(400).json(result);
             return;
        }

        res.status(201).json(result);
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get All Feedbacks
export const getAllFeedbacksController = async (_req: Request, res: Response) => {
    try {
        const result = await getAllFeedbacks();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get Feedback for Specific Product
export const getProductFeedbackController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await getProductFeedback(Number(id));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching product feedback:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Update Feedback (Only Author)
export const updateFeedbackController = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { feedback_id, rating, comment } = req.body;

        const result = await updateFeedback(feedback_id, user_id, rating, comment);

        if (result.error) {
             res.status(403).json(result);
             return;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Delete Feedback (Only Author)
export const deleteFeedbackController = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { feedback_id } = req.body;

        const result = await deleteFeedback(feedback_id, user_id);

        if (result.error) {
             res.status(403).json(result);
             return;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};
