const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

// PUT /api/rewards/update-coins
router.put('/update-coins', protect, async (req, res) => {
  const { clientId, freelancerId, rewardCoins, earnings } = req.body;

  if (!clientId || !freelancerId || !rewardCoins || !earnings) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Update client coins
    const client = await User.findById(clientId);
    const freelancer = await User.findById(freelancerId);

    if (!client || !freelancer) {
      return res.status(404).json({ error: 'Client or freelancer not found.' });
    }

    client.coins += rewardCoins;
    freelancer.coins += rewardCoins;
    freelancer.moneyReceived += earnings;

    await client.save();
    await freelancer.save();

    return res.status(200).json({
      success: true,
      message: 'Users rewarded successfully.',
      clientCoins: client.coins,
      freelancerCoins: freelancer.coins,
      freelancerEarnings: freelancer.moneyReceived,
    });
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ error: 'Server error while updating coins and earnings.' });
  }
});

const Timeline = require("../models/Timeline");
const Conversation = require("../models/Conversation");

router.delete("/cleanup", protect, async (req, res) => {
    const { jobId, clientId, freelancerId } = req.body;
  
    if (!jobId || !clientId || !freelancerId) {
      return res.status(400).json({ error: "Missing required fields." });
    }
  
    try {
      const deletedTimeline = await Timeline.findOneAndDelete({ jobId, client: clientId });
      const deletedConversation = await Conversation.findOneAndDelete({
        jobId,
        participants: { $all: [clientId, freelancerId] },
      });
  
      return res.status(200).json({
        success: true,
        message: "Timeline and conversation deleted.",
        deletedTimeline,
        deletedConversation,
      });
    } catch (err) {
      console.error("Cleanup error:", err);
      return res.status(500).json({ error: "Server error during cleanup." });
    }
  });

module.exports = router;
