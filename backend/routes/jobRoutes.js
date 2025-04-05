const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Job = require('../models/Job'); 
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

// Ensure 'uploads/' directory exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Route for posting a job (Anyone can post)
router.post('/create', protect, upload.single('fileAttachment'), async (req, res) => {
  const { title, description, budget, skillsRequired, timeline } = req.body;
  const userId = req.user.id;
  const fileAttachment = req.file ? req.file.path : null;

  try {
    // Create a new job
    const job = new Job({
      title,
      description,
      budget,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(','),
      timeline,
      fileAttachment,
      client: userId, // Store job creator ID
    });

    await job.save();
    res.status(201).json({ message: 'Job created successfully.', job });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating job.' });
  }
});

// Route for applying to a job (Anyone can apply, but not multiple times & not for own job)
router.post('/apply/:jobId', protect, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.user.id;

  try {
    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Prevent job creator from applying
    if (job.client.toString() === userId) {
      return res.status(400).json({ error: 'You cannot apply to your own job.' });
    }

    // Check if the user has already applied
    if (job.freelancers.includes(userId)) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    // Add applicant to the job
    job.freelancers.push(userId);
    await job.save();

    res.status(200).json({ message: 'Application submitted successfully.', job });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error applying to job.' });
  }
});

// Route for fetching all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).populate('client', 'name email');
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching jobs.' });
  }
});

// Route for liking a job
router.post('/:jobId/like', protect, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.user.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found." });

    if (job.likedBy.includes(userId))
      return res.status(400).json({ error: "You already liked this job." });

    // Increment likes & add user to likedBy
    job.likes += 1;
    job.likedBy.push(userId);
    await job.save();

    // Recalculate Featured & Trending jobs
    const allJobs = await Job.find().sort({ likes: -1 });

    if (allJobs.length > 0) {
      allJobs[0].isFeatured = true;
      await allJobs[0].save();
    }

    // Set the next top 3 as trending
    for (let i = 1; i <= 3 && i < allJobs.length; i++) {
      allJobs[i].isTrending = true;
      await allJobs[i].save();
    }

    // Reset "isFeatured" and "isTrending" for other jobs
    await Job.updateMany(
      { _id: { $nin: allJobs.slice(0, 4).map((job) => job._id) } },
      { $set: { isFeatured: false, isTrending: false } }
    );

    res.status(200).json({ message: "Job liked successfully.", job });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error liking job." });
  }
});
// Close a job by ID
router.put('/:id/close', protect, async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job: updated });
  } catch (err) {
    console.error('Error closing job:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
