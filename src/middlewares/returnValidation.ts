import Joi from "joi";

const returnRequestSchema = Joi.object({
  returnRequest: Joi.object({
    return_reason: Joi.string().min(3).max(255).required(),
    order_id: Joi.number().integer().positive().required(),
  }).required(),

  returnItems: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().min(1).required(),
        reason: Joi.string().min(3).max(255).required(),
        ordered_item_id: Joi.number().integer().positive().required(),
      })
    )
    .min(1)
    .required(),
});

export default returnRequestSchema;
