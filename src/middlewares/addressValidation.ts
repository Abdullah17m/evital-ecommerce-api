import Joi from "joi";

export const addressSchema = Joi.object({
    street: Joi.string().min(3).max(255).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    country: Joi.string().min(2).max(100).required(),
    postal_code: Joi.string().pattern(/^\d{4,10}$/).required(),
    is_default: Joi.boolean().optional(), 
    type: Joi.string().valid("home", "work", "other").required(),
});
