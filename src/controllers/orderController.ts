import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { 
    cancelOrder, 
    createUserOrder, 
    getAllOrders, 
    getAllUserOrders, 
    getOrdersById, 
    updateOrderStatus 
} from "../models/orderModel";

// Get All Orders for a User
export const getAllUserOrdersController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const result = await getAllUserOrders(userId);

        res.status(200).json({ error: false, message: "User orders retrieved successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Create Order
export const createOrdersController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        req.body.user_id = req.user?.userId;
        const result = await createUserOrder(req.body);

        res.status(201).json({ error: false, message: "Order created successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get Order by ID for a User
export const getOrderByIdController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { order_id } = req.body;

        if (!order_id) {
            res.status(400).json({ error: true, message: "Order ID is required", data: null });
            return;
        }

        const result = await getOrdersById(userId, order_id);

        res.status(200).json({ error: false, message: "Order retrieved successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get All Orders (Admin)
export const getAdminOrdersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllOrders();

        res.status(200).json({ error: false, message: "All orders retrieved successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Update Order Status (Admin)
export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, status } = req.body;

        if (!order_id || !status) {
            res.status(400).json({ error: true, message: "Order ID and status are required", data: null });
            return;
        }

        const result = await updateOrderStatus(req.body);

        res.status(200).json({ error: false, message: "Order status updated successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Cancel Order (User)
export const cancelOrderController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { order_id } = req.body;

        if (!order_id) {
            res.status(400).json({ error: true, message: "Order ID is required", data: null });
            return;
        }

        const result = await cancelOrder(userId, order_id);

        res.status(200).json({ error: false, message: "Order canceled successfully", data: result.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};
