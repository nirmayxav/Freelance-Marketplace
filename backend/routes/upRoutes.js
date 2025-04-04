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

module.exports = router;
