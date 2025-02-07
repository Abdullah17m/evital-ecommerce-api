import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { getAllUsersService, getUserByIdService, updateUserService } from "../models/userModel";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getAllUsersService();
        res.status(200).json({ message: "All users fetched successfully", users });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    try {
        const user = await getUserByIdService(userId);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ message: "User fetched successfully", user });
    } catch (error: any) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateUserController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);
    const { first_name, last_name } = req.body;

    if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    try {
        const updatedUser = await updateUserService(userId, first_name, last_name);

        if (updatedUser.error) {
            res.status(404).json({ message: updatedUser.message });
            return;
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser.data });
    } catch (error: any) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
