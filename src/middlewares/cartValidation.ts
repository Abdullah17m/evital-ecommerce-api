import Joi from "joi";

export const addProductCartSchema = Joi.object({
  

    cart_id: Joi.number().integer().positive().required()
        .messages({
            "number.base": "Cart ID must be a number.",
            "number.integer": "Cart ID must be an integer.",
            "number.positive": "Cart ID must be a positive number.",
            "any.required": "Cart ID is required."
        }),

    product_id: Joi.number().integer().positive().required()
        .messages({
            "number.base": "Product ID must be a number.",
            "number.integer": "Product ID must be an integer.",
            "number.positive": "Product ID must be a positive number.",
            "any.required": "Product ID is required."
        }),

    quantity: Joi.number().integer().positive().min(1).required()
        .messages({
            "number.base": "Quantity must be a number.",
            "number.integer": "Quantity must be an integer.",
            "number.positive": "Quantity must be a positive number.",
            "number.min": "Quantity must be at least 1.",
            "any.required": "Quantity is required."
        })
});

export const updateProductCartSchema = Joi.object({
    product_id: Joi.number().integer().positive().required()
    .messages({
        "number.base": "Product ID must be a number.",
        "number.integer": "Product ID must be an integer.",
        "number.positive": "Product ID must be a positive number.",
        "any.required": "Product ID is required."
    }),
    quantity: Joi.number().integer().positive().min(1).required()
        .messages({
            "number.base": "Quantity must be a number.",
            "number.integer": "Quantity must be an integer.",
            "number.positive": "Quantity must be a positive number.",
            "number.min": "Quantity must be at least 1.",
            "any.required": "Quantity is required."
        })
});
