import Joi from "joi";

export const feedbackSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  rating: Joi.number().min(1).max(5).precision(2).required(),
  comment: Joi.string().trim().max(500).required(),
});

export const updateFeedbackSchema = Joi.object({
    product_id: Joi.number().integer().positive().required(),
    rating: Joi.number().min(1).max(5).precision(2).optional(),
    comment: Joi.string().trim().max(500).optional(),
  });
  