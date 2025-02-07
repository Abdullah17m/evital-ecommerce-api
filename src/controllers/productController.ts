import { Request, Response } from "express";
import {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../models/productModel";

export const addProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category_id, name, description, price, stock } = req.body;
        const response = await addProduct(category_id, name, description, price, stock);
        res.status(response.error ? 400 : 201).json(response);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

export const getAllProductsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const response = await getAllProducts();
        res.status(response.error ? 400 : 200).json(response);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

export const getProductByIdController = async (req: Request, res: Response): Promise<void> => {
    const product_id = parseInt(req.params.id);

    if (isNaN(product_id)) {
        res.status(400).json({ error: true, message: "Invalid product ID", data: null });
        return;
    }

    try {
        const response = await getProductById(product_id);
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

export const updateProductController = async (req: Request, res: Response): Promise<void> => {
   
    const { category_id, name, description, price, stock,product_id } = req.body;

    if (isNaN(product_id)) {
        res.status(400).json({ error: true, message: "Invalid product ID", data: null });
        return;
    }

    try {
        const response = await updateProduct(product_id, category_id, name, description, price, stock);
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};

export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
    const {product_id} = req.body;

    if (isNaN(product_id)) {
        res.status(400).json({ error: true, message: "Invalid product ID", data: null });
        return;
    }

    try {
        const response = await deleteProduct(product_id);
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: null });
    }
};
