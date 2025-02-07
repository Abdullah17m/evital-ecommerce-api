import { Request, Response } from "express";
import { createDiscount, getAllDiscounts, getDiscountById, updateDiscount, deleteDiscount } from "../models/discountModel";

// Create Discount
export const createDiscountController = async (req: Request, res: Response) => {
    try {
        const discount = await createDiscount(req.body);
        res.status(discount.error ? 400 : 201).json(discount);
    } catch (error) {
        console.error("Error in createDiscountController:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get All Discounts
export const getAllDiscountsController = async (_req: Request, res: Response) => {
    try {
        const discounts = await getAllDiscounts();
        res.status(discounts.error ? 400 : 200).json(discounts);
    } catch (error) {
        console.error("Error in getAllDiscountsController:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Get Discount by ID
export const getDiscountByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const discount = await getDiscountById(Number(req.params.id));
        res.status(discount.error ? 404 : 200).json(discount);
    } catch (error) {
        console.error("Error in getDiscountByIdController:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Update Discount
export const updateDiscountController = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedDiscount = await updateDiscount(req.body);
        res.status(updatedDiscount.error ? 404 : 200).json(updatedDiscount);
    } catch (error) {
        console.error("Error in updateDiscountController:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

// Delete Discount
export const deleteDiscountController = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedDiscount = await deleteDiscount(req.body.discount_id);
        res.status(deletedDiscount.error ? 404 : 200).json(deletedDiscount);
    } catch (error) {
        console.error("Error in deleteDiscountController:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};
