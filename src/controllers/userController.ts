import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { UserService } from "../models/userModel";
import { formatResponse } from "../utils/helper";

const userService = new UserService();

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error: any) {
        console.error("Error fetching users:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        res.status(400).json(formatResponse(true, "Invalid user ID", null));
        return;
    }

    try {
        const user = await userService.getUserById(userId);
        res.status(user.error ? 404 : 200).json(user);
    } catch (error: any) {
        console.error("Error fetching user:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Update user details
export const updateUserController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);
    const { first_name, last_name } = req.body;

    if (isNaN(userId)) {
        res.status(400).json(formatResponse(true, "Invalid user ID", null));
        return;
    }

    try {
        const updatedUser = await userService.updateUser(userId, {first_name, last_name});
        res.status(updatedUser.error ? 404 : 200).json(updatedUser);
    } catch (error: any) {
        console.error("Error updating user:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};
