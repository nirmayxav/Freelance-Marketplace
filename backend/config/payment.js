const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Function to create a payment intent
const createPaymentIntent = async (amount, currency, description = "Freelance Payment") => {
  try {
    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

    if (!currency || typeof currency !== "string") {
      throw new Error("Currency is required and must be a string");
    }

    // Convert to cents (Stripe requires smallest unit)
    const amountInCents = Math.round(amount * 100);

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      payment_method_types: ["card"],
      description,
    });

    console.log(`✅ Payment Intent Created: ${paymentIntent.id}`);

    // Return only what's needed (not the full intent)
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

  } catch (error) {
    console.error("❌ Error creating payment intent:", error.message);
    throw error;
  }
};

module.exports = { createPaymentIntent };
