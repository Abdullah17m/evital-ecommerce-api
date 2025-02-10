import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import CartService from "../models/cartModel";
import { formatResponse } from "../utils/helper";

const cart = new CartService();

export const getAllCartsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const result = await cart.getAllCarts(userId);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const createCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const result = await cart.createCart(userId);
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const addProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        req.body.user_id = req.user?.userId;
        const result = await cart.addProductCart(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const updateProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        req.body.user_id = req.user?.userId;
        req.body.cart_id = parseInt(req.params.id);
        const result = await cart.updateCart(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const deleteProductCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        req.body.user_id = req.user?.userId;
        req.body.cart_id = parseInt(req.params.id);
        const result = await cart.deleteProductCart(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const deleteCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        req.body.user_id = req.user?.userId;
        const result = await cart.deleteCart(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};

export const getCartByIdController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const cartId = parseInt(req.params.id);
        const result = await cart.getCartItemsById(cartId, userId);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(formatResponse(true, "Internal Server Error"));
    }
};
