import express from "express";
import { validation } from "../middleware/validationMiddleware.js";
import { login, logout, register } from "../controller/auth.controller.js";
import {
  loginSchemaValidation,
  registerSchemaValidation,
} from "../validation/auth.validation.js";
import { auth } from "../middleware/authMiddleware.js";
const route = express.Router();

route
  .post("/register", validation(registerSchemaValidation), register)
  .post("/login", validation(loginSchemaValidation), login)
  .post("/logout", auth, logout);
export default route;
