import { Request, Response } from "express";
import { getProfileService, loginUserService, registerUserService } from "../models/authModel";
import { AuthenticatedRequest } from "../types/express";

// Register User
export const registerUser = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await registerUserService(req.body);

    if (user.error) {
      res.status(400).json({ error: true, message: user.message, data: {} });
      return;
    }

    res.status(201).json({ error: false, message: "User registered successfully", data: user.data });
    return;
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message, data: {} });
    return;
  }
};

// Login User
export const loginUser = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await loginUserService(email, password);

    if (user.error) {
       res.status(400).json({ error: true, message: user.message, data: {} });
      return;
    }

    res.status(200).json({ error: false, message: "User logged in successfully", data: user.data });
    return;
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message, data: {} });
    return;
  }
};

// Get Profile
export const getProfile = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
  try {
    const user = await getProfileService(req.user?.userId);

    if (user.error) {
       res.status(404).json({ error: true, message: user.message, data: {} });
       return;
    }

    res.status(200).json({ error: false, message: "User profile fetched successfully", data: user.data });
    return;
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message, data: {} });
    return;
  }
};
