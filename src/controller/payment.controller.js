import { stripe } from "../config/stripeConfig.js";
import { create } from "../service/payment.service.js";
import { findProductById } from "../service/product.service.js";

export const createPaymentIntent = async (req, res) => {
  try {
    const { productId, paymentMethodType = "card" } = req.body;
    const userId = req.user.userId;
    const product = await findProductById(productId);
    const normalizedPaymentMethodType =
      paymentMethodType === "card_present" ? "card_present" : "card";

    if (!product) {
      return res.fail(404, "This product is not found");
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price * 100,
      currency: "usd",
      payment_method_types: [normalizedPaymentMethodType],
      metadata: {
        productId,
        userId,
        paymentMethodType: normalizedPaymentMethodType,
      },
    });
    await create({
      userId,
      productId,
      amount: product.price,
      paymentIntentId: paymentIntent.id,
      paymentMethodType: normalizedPaymentMethodType,
    });
    return res.success(200, "Payment intenet created successfully", {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentMethodType: normalizedPaymentMethodType,
    });
  } catch (error) {
    console.log("createPaymentIntent API Error:", error);
    return res.fail(500, "Internal server error");
  }
};

export const connectionToken = async (req, res) => {
  try {
    const token = await stripe.terminal.connectionTokens.create();
    return res.success(200, "connction token created successfully", {
      secret: token.secret,
    });
  } catch (error) {
    console.log("connectionToken API Error:", error);
    return res.fail(500, "Internal server error");
  }
};
