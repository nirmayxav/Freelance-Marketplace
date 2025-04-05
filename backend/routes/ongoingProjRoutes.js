// routes/ongoingProjRoutes.js
const express = require('express');
const router = express.Router();
const Timeline = require('../models/Timeline');
const protect = require('../middlewares/authMiddleware');

// GET timelines where current user is applicant
// Endpoint: /api/ongoing-projects/applicant/:id
router.get('/applicant/:id', protect, async (req, res) => {
  try {
    const applicantId = req.params.id;
    const timelines = await Timeline.find({ applicant: applicantId })
      .populate('jobId');
    res.json({ success: true, timelines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET timelines where current user is client
// Endpoint: /api/ongoing-projects/client/:id
router.get('/client/:id', protect, async (req, res) => {
  try {
    const clientId = req.params.id;
    const timelines = await Timeline.find({ client: clientId })
      .populate('jobId');
    res.json({ success: true, timelines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Applicant submits GitHub link or text
// Endpoint: /api/ongoing-projects/:id/submit
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const { submission } = req.body;
    const updatedTimeline = await Timeline.findByIdAndUpdate(
      req.params.id,
      { applicantSubmission: submission },
      { new: true }
    );

    if (!updatedTimeline) {
      return res.status(404).json({ success: false, message: 'Timeline not found' });
    }

    res.json({ success: true, timeline: updatedTimeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Client accepts applicant's submission
// Endpoint: /api/ongoing-projects/:id/accept
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const timeline = await Timeline.findById(req.params.id);
    if (!timeline) {
      return res.status(404).json({ success: false, message: 'Timeline not found' });
    }

    timeline.status = 'accepted';
    await timeline.save();

    res.json({ success: true, timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
