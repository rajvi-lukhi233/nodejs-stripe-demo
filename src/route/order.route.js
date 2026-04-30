import express from "express";
import { auth, authRole } from "../middleware/authMiddleware.js";
import {
  craeteOrder,
  deleteOrder,
  getAllOrders,
  getUserWiseOrder,
  updateOrder,
} from "../controller/order.controller.js";
import { ROLE } from "../util/constant.js";
import {
  createOrderSchemaValidation,
  deleteOrderSchemaValidation,
  updateOrderSchemaValidation,
} from "../validation/order.validation.js";
import { validation } from "../middleware/validationMiddleware.js";
const route = express.Router();

route
  .get("/", auth, getAllOrders)
  .get("/getUserWiseOrder", auth, authRole(ROLE.ADMIN), getUserWiseOrder)
  .post("/", auth, validation(createOrderSchemaValidation), craeteOrder)
  .put("/:orderId", auth, validation(updateOrderSchemaValidation), updateOrder)
  .delete(
    "/:orderId",
    auth,
    validation(deleteOrderSchemaValidation),
    deleteOrder,
  );

export default route;
