import Joi from "joi";

export const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name must be at most 50 characters",
  }),

  last_name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name must be at most 50 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 3 characters",
      "string.max": "Password must be at most 20 characters",
    }),

  phone_number: Joi.string()
    .pattern(new RegExp("^[0-9]{10,15}$"))
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10-15 digits",
      "string.empty": "Phone number is required",
    }),

  role: Joi.string().valid("admin", "customer").default("customer").messages({
    "any.only": "Role must be either 'admin' or 'user'",
  }),

  dob: Joi.date()
    .max("now")
    .required()
    .messages({
      "date.base": "Date of birth must be a valid date",
      "date.max": "Date of birth cannot be in the future",
      "any.required": "Date of birth is required",
    }),
});


export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });