import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/express";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction):void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
   res.status(401).json({ message: "Unauthorized: No token provided" });
   return;
  }

  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({ message: "Unauthorized: Invalid token" });
     return;
  }
};

export const adminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction):void => {
  if (!req.user) {
       res.status(401).json({ message: "Unauthorized. No user found." });
       return;
  }

  if (req.user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
  }

  next();
};
