import { Request, Response } from "express";
import UserService from "../models/authModel";
import { AuthenticatedRequest } from "../types/express";
import { formatResponse } from "../utils/helper";

const userObj = new UserService();

// Register User
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userObj.registerUser(req.body);
        res.status(user.error ? 400 : 201).json(formatResponse(user.error, user.message, user.data));
    } catch (error: any) {
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await userObj.loginUser(email, password);
        res.status(user.error ? 400 : 200).json(formatResponse(user.error, user.message, user.data));
    } catch (error: any) {
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};

// Get Profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await userObj.getProfile(req.user?.userId);
        res.status(user.error ? 404 : 200).json(formatResponse(user.error, user.message, user.data));
    } catch (error: any) {
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};
