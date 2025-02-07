import Joi from "joi";

export const discountSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(5).max(20).required(),
  discount_percentage: Joi.number().integer().min(1).max(100).required(),
  expiration_date: Joi.date().iso().greater("now").required(),
});


export const updatediscountSchema = Joi.object({
  discount_id:Joi.number().integer().required(),
    code: Joi.string().trim().uppercase().min(5).max(20).optional(),
    discount_percentage: Joi.number().integer().min(1).max(100).optional(),
    expiration_date: Joi.date().iso().greater("now").optional(),
  });