import { Request, Response } from "express";
import { DiscountService } from "../models/discountModel"; 
import { formatResponse } from "../utils/helper";

const discountService = new DiscountService();

// Create Discount
export const createDiscountController = async (req: Request, res: Response) => {
    try {
        const discount = await discountService.createDiscount(req.body);
        res.status(discount.error ? 400 : 201).json(discount);
    } catch (error) {
        console.error("Error in createDiscountController:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Get All Discounts
export const getAllDiscountsController = async (_req: Request, res: Response) => {
    try {
        const discounts = await discountService.getAllDiscounts();
        res.status(discounts.error ? 400 : 200).json(discounts);
    } catch (error) {
        console.error("Error in getAllDiscountsController:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Get Discount by ID
export const getDiscountByIdController = async (req: Request, res: Response) => {
    try {
        const discount = await discountService.getDiscountById(Number(req.params.id));
        res.status(discount.error ? 404 : 200).json(discount);
    } catch (error) {
        console.error("Error in getDiscountByIdController:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Update Discount
export const updateDiscountController = async (req: Request, res: Response) => {
    try {
        const updatedDiscount = await discountService.updateDiscount(req.body);
        res.status(updatedDiscount.error ? 404 : 200).json(updatedDiscount);
    } catch (error) {
        console.error("Error in updateDiscountController:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

// Delete Discount
export const deleteDiscountController = async (req: Request, res: Response) => {
    try {
        const deletedDiscount = await discountService.deleteDiscount(req.body.discount_id);
        res.status(deletedDiscount.error ? 404 : 200).json(deletedDiscount);
    } catch (error) {
        console.error("Error in deleteDiscountController:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};
