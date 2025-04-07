const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");


// 🔍 GET another user's wallet address by ID
router.get("/wallets/:id", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  console.log("🔍 [WALLET API] Fetch wallet for ID:", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(userId).select("walletAddress");

    if (!user) {
      console.warn("⚠️ User not found for ID:", userId);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.walletAddress) {
      return res.status(404).json({ success: false, message: "Wallet address not found." });
    }

    console.log("✅ Wallet Address found:", user.walletAddress);
    res.json({ success: true, walletAddress: user.walletAddress });
  } catch (err) {
    console.error("❌ Error fetching wallet address:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET completed timelines for applicant
router.get('/ongoing-projects/applicant/completed/:id', authMiddleware, async (req, res) => {
  try {
    const applicantId = req.params.id;
    const timelines = await Timeline.find({
      applicant: applicantId,
      status: 'completed'
    }).populate('jobId');
    res.json({ success: true, timelines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
