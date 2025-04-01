const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const protect = require('../middlewares/authMiddleware');
const User = require('../models/User');
const fs = require('fs');

// Ensure the uploads directory exists (adjust the path as needed)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

/**
 * @desc   Get user profile
 * @route  GET /api/user/profile
 * @access Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      image: user.image,
      rating: user.rating,
      coins: user.coins,
      moneyReceived: user.moneyReceived,
      moneyInEscrow: user.moneyInEscrow,
      achievements: user.achievements,
      reviews: user.reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc   Update user profile (including password update if provided)
 * @route  PUT /api/user/profile
 * @access Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update editable fields
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.skills) user.skills = req.body.skills;
    // Use 'image' from request body as that's the field in your model
    if (req.body.image) user.image = req.body.image;

    // Handle password update if both oldPassword and newPassword are provided
    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });
      // Assigning new password will trigger the pre-save hook to hash it
      user.password = req.body.newPassword;
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      image: user.image,
      rating: user.rating,
      coins: user.coins,
      moneyReceived: user.moneyReceived,
      moneyInEscrow: user.moneyInEscrow,
      achievements: user.achievements,
      reviews: user.reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @desc   Upload profile picture
 * @route  POST /api/user/uploadProfile
 * @access Private
 */
router.post('/uploadProfile', protect, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user image with the new file path and save
    user.image = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ image: user.image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
