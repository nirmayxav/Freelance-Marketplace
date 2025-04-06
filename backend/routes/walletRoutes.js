const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require('../middlewares/authMiddleware');


router.get("/me", protect, async (req, res) => {
  console.log("✅ [WALLET] Hitting /me endpoint");
  const user = await User.findById(req.user.id).select("walletAddress");
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.json({ success: true, walletAddress: user.walletAddress });
});


// ✅ THEN this - more generic
router.get("/:id", protect, async (req, res) => {
  const userId = req.params.id;
  console.log("🔍 [WALLET API] Request received to fetch wallet for ID:", userId);

  try {
    const user = await User.findById(userId).select("walletAddress");

    if (!user) {
      console.warn("⚠️ User not found for ID:", userId);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    console.log("✅ Wallet Address found:", user.walletAddress);
    res.json({ success: true, walletAddress: user.walletAddress });
  } catch (err) {
    console.error("❌ Error fetching wallet address:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
