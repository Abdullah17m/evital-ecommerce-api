import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { 
    addAddressController,
    deleteAddressController,
    getAddressByIdController,
    getAllAddressesController,
    updateAddressController
} from "../controllers/addressController";
import { validateRequest } from "../middlewares/validateRequest";
import { addressSchema } from "../middlewares/addressValidation";

const router = express.Router();

router.post("/", authenticate,validateRequest(addressSchema),addAddressController);
router.get("/", authenticate, getAllAddressesController);
router.get("/:id", authenticate, getAddressByIdController);
router.patch("/:id", authenticate, updateAddressController);
router.delete("/", authenticate, deleteAddressController);

export default router;
