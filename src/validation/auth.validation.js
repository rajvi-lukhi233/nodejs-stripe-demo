import joi from "joi";
import { ROLE } from "../util/constant.js";

export const registerSchemaValidation = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  role: joi
    .string()
    .valid(...Object.values(ROLE))
    .default(ROLE.USER),
});

export const loginSchemaValidation = joi.object({
  email: joi.string().required(),
  password: joi.string().min(6).required(),
});
