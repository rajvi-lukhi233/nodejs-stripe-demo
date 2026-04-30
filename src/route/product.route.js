import express from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controller/product.controller.js";
import { auth, authRole } from "../middleware/authMiddleware.js";
import { ROLE } from "../util/constant.js";
import { upload } from "../util/multer.js";
import {
  deleteProductSchemaValidation,
  productSchemaValidation,
  updateProductSchemaValidation,
} from "../validation/product.validation.js";
import { validation } from "../middleware/validationMiddleware.js";
const route = express.Router();

route
  .get("/", auth, getAllProducts)
  .post(
    "/addProduct",
    auth,
    authRole(ROLE.ADMIN),
    upload.single("image"),
    validation(productSchemaValidation),
    addProduct,
  )
  .put(
    "/:productId",
    auth,
    authRole(ROLE.ADMIN),
    upload.single("image"),
    validation(updateProductSchemaValidation),
    updateProduct,
  )
  .delete(
    "/:productId",
    auth,
    authRole(ROLE.ADMIN),
    validation(deleteProductSchemaValidation),
    deleteProduct,
  );

export default route;
