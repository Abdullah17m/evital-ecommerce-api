import { Request, Response } from "express";
import { addAddress, deleteAddress, getAddressById, getAllAddress, updateAddress } from "../models/addressModel";
import { AuthenticatedRequest } from "../types/express";

// Add Address
export const addAddressController = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
    try {
        const userId = req.user?.userId;
        req.body.user_id = userId;
        const newAddress = await addAddress(req.body);

        if (newAddress.error) {
             res.status(500).json({ error: true, message: newAddress.message, data: {} });
             return;
        }

        res.status(201).json({ error: false, message: newAddress.message, data: newAddress.data });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: {} });
        return;
    }
};

// Get All Addresses
export const getAllAddressesController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const addresses = await getAllAddress(userId);

        if (addresses.error) {
             res.status(500).json({ error: true, message: addresses.message, data: [] });
             return;
        }

        res.json({ error: false, message: addresses.message, data: addresses.data });
        return;
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error", data: [] });
        return;
    }
};

// Get Address by ID
export const getAddressByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const addressId = parseInt(req.params.id);
        const address = await getAddressById(addressId);

        if (address.error) {
            res.status(404).json({ error: true, message: address.message, data: {} });
            return;
        }

        res.json({ error: false, message: address.message, data: address.data });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error", data: {} });
    }
};

// Update Address
export const updateAddressController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const addressId = parseInt(req.params.id);

        if (isNaN(addressId)) {
             res.status(400).json({ error: true, message: "Invalid address ID", data: {} });
             return;
        }

        const updatedAddress = await updateAddress(userId, addressId, req.body);

        if (!updatedAddress || updatedAddress.error) {
            res.status(404).json({ error: true, message: updatedAddress?.message || "Address not found or unauthorized", data: {} });
            return;
        }

        res.json({ error: false, message: updatedAddress.message, data: updatedAddress.data });
        return;
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: {} });
    }
};

// Delete Address
export const deleteAddressController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { addressId } = req.body;

        if (isNaN(addressId)) {
             res.status(400).json({ error: true, message: "Invalid address ID", data: {} });
             return;
        }

        const addr = await getAddressById(addressId);

        if (addr.error || addr.data.is_default) {
            res.status(400).json({ error: true, message: "Cannot delete default address, change default address first", data: {} });
            return;
        }

        const deletedAddress = await deleteAddress(userId, addressId);

        if (deletedAddress.error) {
           res.status(500).json({ error: true, message: deletedAddress.message, data: {} });
           return;
        }

        res.json({ error: false, message: deletedAddress.message, data: deletedAddress.data });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: true, message: "Internal Server Error", data: {} });
    }
};
