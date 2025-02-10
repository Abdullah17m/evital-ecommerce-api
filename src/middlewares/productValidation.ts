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




const searchAndFilterSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .optional()
        .messages({
            "string.base": "Name must be a string.",
            "string.min": "Name must be at least 1 character long.",
            "string.max": "Name cannot exceed 255 characters."
        }),

    min_price: Joi.number()
        .min(0)
        .optional()
        .messages({
            "number.base": "Minimum price must be a number.",
            "number.min": "Minimum price cannot be negative."
        }),

    max_price: Joi.number()
        .min(0)
        .greater(Joi.ref("min_price"))
        .optional()
        .messages({
            "number.base": "Maximum price must be a number.",
            "number.min": "Maximum price cannot be negative.",
            "number.greater": "Maximum price must be greater than minimum price."
        }),

    min_stock: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            "number.base": "Minimum stock must be a number.",
            "number.integer": "Minimum stock must be an integer.",
            "number.min": "Minimum stock cannot be negative."
        }),

    category_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            "number.base": "Category ID must be a number.",
            "number.integer": "Category ID must be an integer.",
            "number.positive": "Category ID must be a positive number."
        }),

    min_rating: Joi.number()
        .min(0)
        .max(5)
        .optional()
        .messages({
            "number.base": "Minimum rating must be a number.",
            "number.min": "Minimum rating cannot be negative.",
            "number.max": "Minimum rating cannot exceed 5."
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
            "number.base": "Page must be a number.",
            "number.integer": "Page must be an integer.",
            "number.min": "Page number must be at least 1."
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
            "number.base": "Limit must be a number.",
            "number.integer": "Limit must be an integer.",
            "number.min": "Limit must be at least 1.",
            "number.max": "Limit cannot exceed 100."
        }),

    sort_by: Joi.object({
        name: Joi.string()
            .valid("name", "price", "stock", "average_rating", "created_at")
            .required()
            .messages({
                "any.only": "Sort column must be one of: name, price, stock, average_rating, created_at.",
                "any.required": "Sort column is required if sorting is applied."
            }),

        type: Joi.string()
            .valid("ASC", "DESC")
            .required()
            .messages({
                "any.only": "Sort type must be either 'ASC' or 'DESC'.",
                "any.required": "Sort type is required if sorting is applied."
            })
    }).optional()
});

export default searchAndFilterSchema;




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
