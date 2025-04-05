const express = require("express");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const Escrow = require("../models/Escrow");
const CryptoPayment = require("../models/CryptoPayment");
const { ethers, wallet, provider } = require("../config/web3");
const protect = require("../middlewares/authMiddleware");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to create escrow
const createEscrowRecord = async ({ clientId, freelancerId, jobId, amount, currency, paymentIntentId }) => {
  const escrow = new Escrow({
    clientId,
    freelancerId,
    jobId,
    amount,
    currency,
    status: "on-hold",
    paymentIntentId,
  });
  return await escrow.save();
};

// 1) Stripe Payment
router.post("/create-payment", protect, async (req, res) => {
  try {
    const { amount, currency, description = "Freelance Payment", type, freelancerId, jobId } = req.body;
    const clientId = req.user.id;

    if (!amount || isNaN(amount) || !currency) {
      return res.status(400).json({ error: "Valid amount and currency are required." });
    }

    if (!["escrow", "full"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing payment type." });
    }

    if (type === "escrow") {
      if (!freelancerId || !jobId) {
        return res.status(400).json({ error: "Missing freelancerId or jobId for escrow." });
      }
      if (!mongoose.Types.ObjectId.isValid(freelancerId) || !mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: "Invalid freelancerId or jobId format." });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      payment_method_types: ["card"],
    });

    if (type === "escrow") {
      await createEscrowRecord({
        clientId,
        freelancerId,
        jobId,
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
      });
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment creation failed. Please try again." });
  }
});

// 2) Crypto Payment Request
router.post("/crypto-request", protect, async (req, res) => {
  try {
    const { freelancerId, jobId, type, milestones } = req.body;
    const clientId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(freelancerId) || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid freelancerId or jobId format." });
    }
    if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({ error: "Milestones array is required for crypto payment." });
    }

    const ethPrice = 2000; // Example conversion
    const totalAmountUSD = milestones.reduce((sum, m) => sum + m.amountUSD, 0);
    const totalAmountCrypto = (totalAmountUSD / ethPrice).toFixed(6);

    const payments = await Promise.all(
      milestones.map(async (milestone) => {
        const amountCrypto = (milestone.amountUSD / ethPrice).toFixed(6);
        return CryptoPayment.create({
          clientId,
          freelancerId,
          jobId,
          type: "escrow",
          amountUSD: milestone.amountUSD,
          amountCrypto,
          cryptoCurrency: "eth",
          toWallet: wallet.address,
          status: "pending",
          milestoneTitle: milestone.title,
        });
      })
    );

    res.json({
      totalUSD: totalAmountUSD,
      totalETH: totalAmountCrypto,
      payments,
    });
  } catch (error) {
    console.error("Crypto Payment Error:", error);
    res.status(500).json({ error: "Failed to create crypto escrow milestones." });
  }
});

// 3) Crypto Payment Verification
router.post("/verify-crypto", async (req, res) => {
  try {
    const { intentId, txHash } = req.body;
    if (!mongoose.Types.ObjectId.isValid(intentId)) {
      return res.status(400).json({ message: "Invalid payment intentId." });
    }
    if (!txHash) {
      return res.status(400).json({ message: "Transaction hash is required." });
    }

    const payment = await CryptoPayment.findById(intentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx || !receipt || receipt.status !== 1 || tx.to.toLowerCase() !== payment.toWallet.toLowerCase()) {
      return res.status(400).json({ message: "Invalid or unconfirmed transaction." });
    }

    const sent = parseFloat(ethers.utils.formatEther(tx.value));
    if (sent < parseFloat(payment.amountCrypto)) {
      return res.status(400).json({ message: "Insufficient amount sent." });
    }

    payment.txHash = txHash;
    payment.status = "paid";
    await payment.save();

    res.json({ message: "Payment verified.", txHash });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Error verifying payment." });
  }
});

// 4) Crypto Release
router.post("/release-crypto", async (req, res) => {
  try {
    const { intentId, toAddress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(intentId)) {
      return res.status(400).json({ message: "Invalid payment intentId." });
    }
    if (!toAddress) {
      return res.status(400).json({ message: "Destination address is required." });
    }

    const payment = await CryptoPayment.findById(intentId);
    if (!payment || payment.status !== "paid") {
      return res.status(400).json({ message: "No funds available for release." });
    }

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(payment.amountCrypto),
    });

    payment.status = "released";
    await payment.save();

    res.status(200).json({ message: "Crypto funds released", txHash: tx.hash });
  } catch (error) {
    console.error("Release Error:", error);
    res.status(500).json({ message: "Failed to release funds." });
  }
});

module.exports = router;
