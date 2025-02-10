import { Request, Response } from "express";
import { formatResponse } from "../utils/helper";
import CategoryService from "../models/categoryModel";

const category = new CategoryService();

export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;

    if (!name) {
        res.status(400).json(formatResponse(true, "Category name is required"));
        return;
    }

    try {
        const result = await category.createCategory(name);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json(formatResponse(true, error.message || "Internal Server Error"));
    }
};

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await category.getAllCategories();
        res.json(result);
    } catch (error: any) {
        res.status(500).json(formatResponse(true, error.message || "Internal Server Error"));
    }
};

export const getCategoryByIdController = async (req: Request, res: Response): Promise<void> => {
    const category_id = parseInt(req.params.id);

    if (isNaN(category_id)) {
        res.status(400).json(formatResponse(true, "Invalid category ID"));
        return;
    }

    try {
        const result = await category.getCategoryById(category_id);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json(formatResponse(true, error.message || "Internal Server Error"));
    }
};

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
    const { name, category_id } = req.body;

    if (isNaN(category_id)) {
        res.status(400).json(formatResponse(true, "Invalid category ID"));
        return;
    }

    try {
        const result = await category.updateCategory(category_id, name);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json(formatResponse(true, error.message || "Internal Server Error"));
    }
};

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    const { category_id } = req.body;

    if (isNaN(category_id)) {
        res.status(400).json(formatResponse(true, "Invalid category ID"));
        return;
    }

    try {
        const result = await category.deleteCategory(category_id);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json(formatResponse(true, error.message || "Internal Server Error"));
    }
};
