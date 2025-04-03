const express = require('express');
const router = express.Router();
const Timeline = require('../models/Timeline');
const protect = require('../middlewares/authMiddleware');


router.post('/', protect, async (req, res) => {
  try {
    const {
      conversationId,
      client,
      applicant,
      jobId,
      paymentMode,
      paymentType,
      totalAmount,
      escrowEnabled,
      milestones
    } = req.body;

    // For full or hourly, allow only one milestone.
    if (paymentMode === 'full' || paymentMode === 'hourly') {
      if (milestones.length > 1) {
        return res.status(400).json({
          success: false,
          message: "Only one milestone allowed for full or hourly payment mode."
        });
      }
    }

    // Calculate the total amount from milestones if not provided.
    const computedTotal = milestones.reduce((sum, milestone) => sum + Number(milestone.amount), 0);

    const timeline = await Timeline.create({
      conversationId,
      client,
      applicant,
      jobId,
      paymentMode,
      paymentType,
      totalAmount: totalAmount || computedTotal,
      escrowEnabled,
      milestones
    });

    res.status(201).json({ success: true, timeline });
  } catch (error) {
    console.error("Error creating timeline:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
