import express from "express";
const route = express.Router();
import authRoute from "./auth.route.js";
import productRoute from "./product.route.js";
import orderRoute from "./order.route.js";
import paymentRoute from "./payment.route.js";

route.use("/auth", authRoute);
route.use("/product", productRoute);
route.use("/order", orderRoute);
route.use("/payment", paymentRoute);

export default route;
