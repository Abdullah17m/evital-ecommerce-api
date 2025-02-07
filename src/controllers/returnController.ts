import { Request, Response } from "express";
import {
    createReturnRequest,
    getAllReturns,
    getReturnDetails,
    updateReturnStatus,
    getReturnItems,
} from "../models/returnModel";
import { AuthenticatedRequest } from "../types/express";

// Create a return request
export const createReturnRequestController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { returnRequest, returnItems } = req.body;

        if (!returnRequest || !returnItems) {
            res.status(400).json({ error: true, message: "Missing returnRequest or returnItems in request body." });
            return;
        }

        returnRequest.user_id = user_id;
        const newReturn = await createReturnRequest(returnRequest, returnItems);

        if (newReturn.error) {
            res.status(400).json(newReturn);
            return;
        }

        res.status(201).json(newReturn);
    } catch (error) {
        console.error("Error creating return request:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Get all return requests (Admin)
export const getAllReturnsController = async (_req: Request, res: Response): Promise<void> => {
    try {
        const returns = await getAllReturns();

        if (returns.error) {
            res.status(400).json(returns);
            return;
        }

        res.status(200).json({ error: false, message: "All return requests retrieved successfully", data: returns.data });
    } catch (error) {
        console.error("Error fetching return requests:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Get return details by return ID
export const getReturnDetailsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { returnId } = req.params;

        if (!returnId) {
            res.status(400).json({ error: true, message: "Return ID is required." });
            return;
        }

        const returnDetails = await getReturnDetails(Number(returnId));

        if (returnDetails.error) {
            res.status(404).json(returnDetails);
            return;
        }

        res.status(200).json({ error: false, message: "Return details retrieved successfully", data: returnDetails.data });
    } catch (error) {
        console.error("Error fetching return details:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Update return request status (Admin)
export const updateReturnStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const { status,returnId } = req.body;

        if (!returnId || !status) {
            res.status(400).json({ error: true, message: "Return ID and status are required." });
            return;
        }

        const updatedReturn = await updateReturnStatus(Number(returnId), status);

        if (updatedReturn.error) {
            res.status(400).json(updatedReturn);
            return;
        }

        res.status(200).json({ error: false, message: "Return status updated successfully", data: updatedReturn.data });
    } catch (error) {
        console.error("Error updating return status:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Get return items for a specific return request (User)
export const getReturnItemsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { returnId } = req.body;
        const user_id = req.user?.userId;

        if (!returnId) {
            res.status(400).json({ error: true, message: "Return ID is required." });
            return;
        }

        const returnItems = await getReturnItems(Number(returnId), user_id);

        if (returnItems.error) {
            res.status(404).json(returnItems);
            return;
        }

        res.status(200).json({ error: false, message: "Return items retrieved successfully", data: returnItems.data });
    } catch (error) {
        console.error("Error fetching return items:", error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

