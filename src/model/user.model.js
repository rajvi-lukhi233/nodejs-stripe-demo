import mongoose from "mongoose";
import { DB_NAME, PLAN, PLAN_STATUS, ROLE } from "../util/constant.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: Object.values(PLAN),
      default: PLAN.MONTHLY,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(PLAN_STATUS),
      default: PLAN_STATUS.INACTIVE,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

export const userModel = mongoose.model(DB_NAME.USER, userSchema);
