const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const Timeline = require('../models/Timeline');
/**
 * @desc   Create a new timeline proposal
 * @route  POST /api/timeline
 * @access Private
 */
router.post('/', protect, async (req, res) => {
    try {
      const {
        conversationId,
        client,
        applicant,
        jobId,
        paymentMode,
        totalAmount,
        escrowEnabled,
        milestones,
      } = req.body;
  
      // Basic validation: ensure required fields are provided
      if (!conversationId || !client || !applicant || !paymentMode || !milestones) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // If paymentMode is 'milestone', we need at least one milestone
      if (paymentMode === 'milestone' && (!milestones || milestones.length === 0)) {
        return res.status(400).json({ message: 'At least one milestone is required for milestone payments' });
      }
  
      // If paymentMode is 'full', totalAmount should be provided
      if (paymentMode === 'full' && !totalAmount) {
        return res.status(400).json({ message: 'Total amount is required for full payment' });
      }
  
      // Create the new timeline (proposal)
      const newTimeline = await Timeline.create({
        conversationId,
        client,
        applicant,
        jobId,
        paymentMode,
        totalAmount,
        escrowEnabled,
        milestones,
      });
  
      // Respond with success message and created timeline
      res.status(201).json({ success: true, timeline: newTimeline });
    } catch (error) {
      console.error("Timeline creation error:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
/**
 * @desc   Get timeline by its ID
 * @route  GET /api/timeline/:id
 * @access Private
 */
router.get('/id', protect, async (req, res) => {
  try {
    const timeline = await Timeline.findById(req.params.id)
      .populate('client', 'username email image')
      .populate('applicant', 'username email image')
      .populate('jobId', 'title description');
    if (!timeline) {
      return res.status(404).json({ message: 'Timeline not found' });
    }
    res.json({ success: true, timeline });
  } catch (error) {
    console.error("Timeline retrieval error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
