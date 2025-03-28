const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  counterOffer: { type: Number, default: null },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  timestamp: { type: Date, default: Date.now }
});

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
