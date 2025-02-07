import Joi from "joi";

export const productSchema = Joi.object({
    category_id: Joi.number().integer().required().messages({
        "number.base": "Category ID must be a number",
        "any.required": "Category ID is required",
    }),
    name: Joi.string().min(3).max(255).required().messages({
        "string.base": "Name must be a string",
        "string.min": "Name must be at least 3 characters",
        "string.max": "Name cannot exceed 255 characters",
        "any.required": "Name is required",
    }),
    description: Joi.string().allow("").max(1000).messages({
        "string.base": "Description must be a string",
        "string.max": "Description cannot exceed 1000 characters",
    }),
    price: Joi.number().positive().required().messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be a positive number",
        "any.required": "Price is required",
    }),
    stock: Joi.number().integer().min(0).required().messages({
        "number.base": "Stock must be a number",
        "number.integer": "Stock must be an integer",
        "number.min": "Stock cannot be negative",
        "any.required": "Stock is required",
    }),
});

export const updateProductSchema = Joi.object({
    category_id: Joi.number().integer().optional(),
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().allow("").max(1000).optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().min(0).optional(),
});




export const categorySchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        "string.base": "Category name must be a string",
        "string.empty": "Category name cannot be empty",
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name must be less than 255 characters",
        "any.required": "Category name is required"
    })
});

export const UpdatecategorySchema = Joi.object({
    category_id: Joi.number().integer().required(),
    name: Joi.string().min(2).max(255).required().messages({
        "string.base": "Category name must be a string",
        "string.empty": "Category name cannot be empty",
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name must be less than 255 characters",
        "any.required": "Category name is required"
    })
});
