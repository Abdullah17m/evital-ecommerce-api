import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { 
    addProductCart, 
    createCart, 
    deleteCart, 
    deleteProductCart, 
    getAllCarts, 
    getCartItemsById, 
    updateCart 
} from "../models/cartModel";

export const getAllCartsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        const allCarts = await getAllCarts(userId);
        res.status(200).json({ error: allCarts.error, message: allCarts.message, carts: allCarts.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const createCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        const cart = await createCart(userId);
        res.status(201).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const addProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        req.body.user_id = userId;
        const cart = await addProductCart(req.body);
        res.status(201).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: true, message: error.message || "Internal Server Error" });
    }
};

export const updateProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const cartId = parseInt(req.params.id);
        const userId = req.user?.userId; 
        req.body.user_id = userId;
        req.body.cart_id = cartId;
        const cart = await updateCart(req.body);
        res.status(200).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const deleteProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const cartId = parseInt(req.params.id);
        const userId = req.user?.userId; 
        req.body.user_id = userId;
        req.body.cart_id = cartId;
        const cart = await deleteProductCart(req.body);
        res.status(200).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const deleteCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        req.body.user_id = userId;
        const cart = await deleteCart(req.body);
        res.status(200).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const getCartByIdController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId; 
        const cartId = parseInt(req.params.id);
        const cart = await getCartItemsById(cartId, userId);
        res.status(200).json({ error: cart.error, message: cart.message, cart: cart.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};
