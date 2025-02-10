import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import OrderService from "../models/orderModel";
import { formatResponse } from "../utils/helper";

// Get All Orders for a User
const order = new OrderService();
export const getAllUserOrdersController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const result = await order.getAllUserOrders(userId);
        res.status(result.error ? 400 : 200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Create Order
export const createOrdersController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        req.body.user_id = req.user?.userId;
        const result = await order.createUserOrder(req.body);
        res.status(result.error ? 400 : 201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get Order by ID for a User
export const getOrderByIdController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { order_id } = req.body;

        if (!order_id) {
             res.status(400).json(formatResponse(true, "Order ID is required", null));
             return;
        }

        const result = await order.getOrdersById(userId, order_id);
        res.status(result.error ? 400 : 200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get All Orders (Admin)
export const getAdminOrdersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await order.getAllOrders();
        res.status(result.error ? 400 : 200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Update Order Status (Admin)
export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, status } = req.body;

        if (!order_id || !status) {
            res.status(400).json(formatResponse(true, "Order ID and status are required", null));
            return;
        }

        const result = await order.updateOrderStatus(order_id, status);
        res.status(result.error ? 400 : 200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Cancel Order (User)
export const cancelOrderController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { order_id } = req.body;

        if (!order_id) {
             res.status(400).json(formatResponse(true, "Order ID is required", null));
             return;
        }

        const result = await order.cancelOrder(userId, order_id);
        res.status(result.error ? 400 : 200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};
