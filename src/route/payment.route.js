import express from "express";

import { auth } from "../middleware/authMiddleware.js";
import {
  connectionToken,
  createPaymentIntent,
} from "../controller/payment.controller.js";
import { webhook } from "../controller/webhook.controller.js";
const route = express.Router();

route.post("/create-payment-intent", auth, createPaymentIntent);
route.post("/connection-token", auth, connectionToken);
route.post("/webhook", webhook);
export default route;
