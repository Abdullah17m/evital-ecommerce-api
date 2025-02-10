import { Request, Response } from "express";
import { ReturnService } from "../models/returnModel";
import { AuthenticatedRequest } from "../types/express";
import { formatResponse } from "../utils/helper";

// Instantiate the service
const returnService = new ReturnService();

// Create a return request
export const createReturnRequestController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user_id = req.user?.userId;
        const { returnRequest, returnItems } = req.body;

        if (!returnRequest || !returnItems) {
            res.status(400).json(formatResponse(true, "Missing returnRequest or returnItems in request body.", null));
            return;
        }

        returnRequest.user_id = user_id;
        const newReturn = await returnService.createReturnRequest(returnRequest, returnItems);

        if (newReturn.error) {
            res.status(400).json(newReturn);
            return;
        }

        res.status(201).json(newReturn);
    } catch (error) {
        console.error("Error creating return request:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get all return requests (Admin)
export const getAllReturnsController = async (_req: Request, res: Response): Promise<void> => {
    try {
        const returns = await returnService.getAllReturns();

        if (returns.error) {
            res.status(400).json(returns);
            return;
        }

        res.status(200).json(formatResponse(false, "All return requests retrieved successfully", returns.data));
    } catch (error) {
        console.error("Error fetching return requests:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get return details by return ID
export const getReturnDetailsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { returnId } = req.params;

        if (!returnId) {
            res.status(400).json(formatResponse(true, "Return ID is required.", null));
            return;
        }

        const returnDetails = await returnService.getReturnDetails(Number(returnId));

        if (returnDetails.error) {
            res.status(404).json(returnDetails);
            return;
        }

        res.status(200).json(formatResponse(false, "Return details retrieved successfully", returnDetails.data));
    } catch (error) {
        console.error("Error fetching return details:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Update return request status (Admin)
export const updateReturnStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { returnId, status } = req.body;

        if (!returnId || !status) {
            res.status(400).json(formatResponse(true, "Return ID and status are required.", null));
            return;
        }

        const updatedReturn = await returnService.updateReturnStatus(Number(returnId), status);

        if (updatedReturn.error) {
            res.status(400).json(updatedReturn);
            return;
        }

        res.status(200).json(formatResponse(false, "Return status updated successfully", updatedReturn.data));
    } catch (error) {
        console.error("Error updating return status:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get return items for a specific return request (User)
export const getReturnItemsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { returnId } = req.body;
        const user_id = req.user?.userId;

        if (!returnId) {
            res.status(400).json(formatResponse(true, "Return ID is required.", null));
            return;
        }

        const returnItems = await returnService.getReturnItems(Number(returnId), user_id);

        if (returnItems.error) {
            res.status(404).json(returnItems);
            return;
        }

        res.status(200).json(formatResponse(false, "Return items retrieved successfully", returnItems.data));
    } catch (error) {
        console.error("Error fetching return items:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};
