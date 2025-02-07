import Joi from "joi";

export const orderValidationSchema = Joi.object({
    cart_id: Joi.number().integer().positive().required().messages({
        "number.base": "Cart ID must be a number.",
        "number.integer": "Cart ID must be an integer.",
        "number.positive": "Cart ID must be a positive number.",
        "any.required": "Cart ID is required."
    }),

    address_id: Joi.number().integer().positive().required().messages({
        "number.base": "Address ID must be a number.",
        "number.integer": "Address ID must be an integer.",
        "number.positive": "Address ID must be a positive number.",
        "any.required": "Address ID is required."
    }),

    discount_id: Joi.number().integer().positive().allow(null).optional().messages({
        "number.base": "Discount ID must be a number.",
        "number.integer": "Discount ID must be an integer.",
        "number.positive": "Discount ID must be a positive number.",
    }),

    payment_status: Joi.string().valid("paid", "pending", "failed").required().messages({
        "string.base": "Payment status must be a string.",
        "any.only": "Payment status must be 'paid', 'pending', or 'failed'.",
        "any.required": "Payment status is required."
    }),

    payment_method: Joi.string().valid("upi", "card", "cod", "netbanking").required().messages({
        "string.base": "Payment method must be a string.",
        "any.only": "Payment method must be 'upi', 'card', 'cod', or 'netbanking'.",
        "any.required": "Payment method is required."
    })
});
