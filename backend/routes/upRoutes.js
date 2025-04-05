const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require('../middlewares/authMiddleware');

router.put("/update-coins", protect, async (req, res) => {
  const { clientId, freelancerId, rewardCoins, earnings } = req.body;

  if (!clientId || !freelancerId || !rewardCoins || earnings == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update client coins
    await User.findByIdAndUpdate(clientId, {
      $inc: { coins: rewardCoins },
    });

    // Update freelancer coins and earnings
    await User.findByIdAndUpdate(freelancerId, {
      $inc: { coins: rewardCoins, moneyReceived: earnings },
    });

    res.json({ success: true, message: "Coins and earnings updated." });
  } catch (err) {
    console.error("Backend reward error:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
