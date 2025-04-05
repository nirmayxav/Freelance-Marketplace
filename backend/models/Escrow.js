const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema(
  {
    clientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    freelancerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Job", 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "usd" 
    },
    status: { 
      type: String, 
      enum: ["on-hold", "released"], 
      default: "on-hold" 
    },
    freelancerStripeId: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Escrow", escrowSchema);
