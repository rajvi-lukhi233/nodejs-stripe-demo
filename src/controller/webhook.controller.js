import { updatePayment } from "../service/payment.service.js";
import { STATUS } from "../util/constant.js";

export const webhook = async (req, res) => {
  try {
    let event = req.body;
    const paymentIntent = event.data.object;

    if (event.type === "payment_intent.succeeded") {
      await updatePayment(
        { paymentIntentId: paymentIntent.id },
        {
          paymentStatus: STATUS.COMPLETED,
          amount: paymentIntent.amount_received,
        },
      );
      return res.success(200, "Payment success.");
    }
    if (event.type === "payment_intent.payment_failed") {
      await updatePayment(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: STATUS.FAILED },
      );
    }

    return res.success(200, "recived successfully");
  } catch (error) {
    console.log("Webhook API Error:", error);
    return res.fail(500, "Internal server error.");
  }
};
