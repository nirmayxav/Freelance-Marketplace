const express = require('express');
const router = express.Router();
const Timeline = require('../models/Timeline');
const protect = require('../middlewares/authMiddleware');
const Job = require('../models/Job'); // ✅ Import the Job model

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

    // Check if a timeline already exists for this conversation
    const existingTimeline = await Timeline.findOne({ conversationId });
    if (existingTimeline) {
      return res.status(400).json({
        success: false,
        message: "A timeline already exists for this conversation.",
      });
    }
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.client.toString() !== client) {
      return res.status(403).json({
        success: false,
        message: "Only the job owner can create a timeline.",
      });
    }

    // For full or hourly, allow only one milestone.
    if ((paymentMode === 'full' || paymentMode === 'hourly') && milestones.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Only one milestone allowed for full or hourly payment mode.",
      });
    }

    // Calculate total from milestones if not provided
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
      milestones,
    });

    res.status(201).json({ success: true, timeline });
  } catch (error) {
    console.error("❌ Error creating timeline:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
