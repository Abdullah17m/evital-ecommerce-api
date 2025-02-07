import { Request, Response } from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../models/categoryModel";

export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;

    if (!name) {
        res.status(400).json({ error: true, message: "Category name is required", data: {} });
        return;
    }

    try {
        const result = await createCategory(name);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: true, message: error.message || "Internal Server Error", data: {} });
    }
};

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllCategories();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: true, message: error.message || "Internal Server Error", data: {} });
    }
};

export const getCategoryByIdController = async (req: Request, res: Response): Promise<void> => {
    const category_id = parseInt(req.params.id);

    if (isNaN(category_id)) {
        res.status(400).json({ error: true, message: "Invalid category ID", data: {} });
        return;
    }

    try {
        const result = await getCategoryById(category_id);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: true, message: error.message || "Internal Server Error", data: {} });
    }
};

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
    
    const { name,category_id } = req.body;

    if (isNaN(category_id)) {
        res.status(400).json({ error: true, message: "Invalid category ID", data: {} });
        return;
    }

    try {
        const result = await updateCategory(category_id, name);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: true, message: error.message || "Internal Server Error", data: {} });
    }
};

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    const {category_id} = req.body;

    if (isNaN(category_id)) {
        res.status(400).json({ error: true, message: "Invalid category ID", data: {} });
        return;
    }

    try {
        const result = await deleteCategory(category_id);
        res.status(result.error ? 404 : 200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: true, message: error.message || "Internal Server Error", data: {} });
    }
};
