import mongoose from "mongoose";
import { DB_NAME, STATUS } from "../util/constant.js";
const paymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_NAME.USER,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_NAME.PRODUCT,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "card_present"],
      default: "card",
    },
    refundId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ userId: 1, paymentStatus: 1 });

export const paymentModel = mongoose.model(DB_NAME.PAYMENT, paymentSchema);
