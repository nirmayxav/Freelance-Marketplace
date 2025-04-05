const mongoose = require("mongoose");

const cryptoPaymentSchema = new mongoose.Schema(
  {
    clientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    freelancerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Job" 
    },
    type: { 
      type: String, 
      enum: ["full", "escrow"] 
    },
    amountUSD: Number,
    amountCrypto: String,
    cryptoCurrency: { 
      type: String, 
      default: "eth" 
    },
    toWallet: String,
    txHash: String,
    status: { 
      type: String, 
      enum: ["pending", "paid", "released"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CryptoPayment", cryptoPaymentSchema);
