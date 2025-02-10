import { Request, Response } from "express";
import ProductService from "../models/productModel";
import { formatResponse } from "../utils/helper";

const product =  new ProductService()
// Add Product
export const addProductController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category_id, name, description, price, stock } = req.body;
        const response = await product.addProduct(category_id, name, description, price, stock);
        res.status(response.error ? 400 : 201).json(response);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get All Products
export const getAllProductsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const response = await product.getAllProducts(page);
        res.status(response.error ? 400 : 200).json(response);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Get Product By ID
export const getProductByIdController = async (req: Request, res: Response): Promise<void> => {
    const product_id = parseInt(req.params.id);

    if (isNaN(product_id)) {
        res.status(400).json(formatResponse(true, "Invalid product ID", null));
        return;
    }

    try {
        const response = await product.getProductById(product_id);
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Update Product
export const updateProductController = async (req: Request, res: Response): Promise<void> => {
    const { category_id, name, description, price, stock, product_id } = req.body;

    if (isNaN(product_id)) {
        res.status(400).json(formatResponse(true, "Invalid product ID", null));
        return;
    }

    try {
        const response = await product.updateProduct(product_id, {category_id, name, description, price, stock});
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Delete Product
export const deleteProductController = async (req: Request, res: Response): Promise<void> => {
    const { product_id } = req.body;

    if (isNaN(product_id)) {
        res.status(400).json(formatResponse(true, "Invalid product ID", null));
        return;
    }

    try {
        const response = await product.deleteProduct(product_id);
        res.status(response.error ? 404 : 200).json(response);
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", null));
    }
};

// Search & Filter Products
export const searchAndFilterProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        req.body.page = page;
        const result = await product.searchAndFilterProducts(req.body);
        res.status(result.error ? 500 : 200).json(result);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json(formatResponse(true, "Server error", null));
    }
};
