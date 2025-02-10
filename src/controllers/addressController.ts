import { Request, Response } from "express";
import { AddressService } from "../models/addressModel";
import { AuthenticatedRequest } from "../types/express";
import { formatResponse } from "../utils/helper";


const addr = new AddressService();


// Add Address
export const addAddressController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        req.body.user_id = userId;
        const newAddress = await addr.addAddress(req.body);

        res.status(newAddress.error ? 500 : 201).json(newAddress);
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};

// Get All Addresses
export const getAllAddressesController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const addresses = await addr.getAllAddresses(userId);

        res.status(addresses.error ? 500 : 200).json(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", []));
    }
};

// Get Address by ID
export const getAddressByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const addressId = parseInt(req.params.id);
        if (isNaN(addressId)) {
            res.status(400).json(formatResponse(true, "Invalid address ID", {}));
            return;
        }

        const address = await addr.getAddressById(addressId);
        res.status(address.error ? 404 : 200).json(address);
    } catch (error) {
        console.error("Error fetching address by ID:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};

// Update Address
export const updateAddressController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const addressId = parseInt(req.params.id);

        if (isNaN(addressId)) {
            res.status(400).json(formatResponse(true, "Invalid address ID", {}));
            return;
        }

        const updatedAddress = await addr.updateAddress(userId, addressId, req.body);
        res.status(updatedAddress.error ? 404 : 200).json(updatedAddress);
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};

// Delete Address
export const deleteAddressController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { addressId } = req.body;

        if (isNaN(addressId)) {
            res.status(400).json(formatResponse(true, "Invalid address ID", {}));
            return;
        }

        const address = await addr.getAddressById(addressId);
        if (address.error || address.data?.is_default) {
            res.status(400).json(formatResponse(true, "Cannot delete default address, change default address first", {}));
            return;
        }

        const deletedAddress = await addr.deleteAddress(userId, addressId);
        res.status(deletedAddress.error ? 500 : 200).json(deletedAddress);
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json(formatResponse(true, "Internal Server Error", {}));
    }
};
