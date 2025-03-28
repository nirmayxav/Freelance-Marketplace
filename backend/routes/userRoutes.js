const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const protect = require('../middlewares/authMiddleware');
const User = require('../models/User');

// @desc Get user profile
// @route GET /api/user/profile
// @access Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      name: user.username, // returned as name
      email: user.email,
      profilePhoto: user.image,
      bio: user.bio,
      skills: user.skills || [],
      rating: user.rating || 0,
      coins: user.coins || 0,
      achievements: user.achievements || [],
      moneyReceived: user.moneyReceived || 0,
      escrowMoney: user.moneyInEscrow || 0,
      reviews: user.reviews || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Update user profile fields (bio, skills, image, achievements, email)
// @route PUT /api/user/profile
// @access Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update editable fields (we don't update name/username here)
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.skills = req.body.skills || user.skills;
    user.image = req.body.profilePhoto || user.image;
    user.achievements = req.body.achievements || user.achievements;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Get user financial details
// @route GET /api/user/financial
// @access Private
router.get('/financial', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('coins moneyReceived moneyInEscrow');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      coins: user.coins,
      moneyReceived: user.moneyReceived,
      escrowMoney: user.moneyInEscrow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Get user reviews
// @route GET /api/user/reviews
// @access Private
router.get('/reviews', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('reviews');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.reviews || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Update user profile details (update email and password only)
// Name (username) is not changeable.
router.put('/update-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Do not update name/username, as required.
    user.email = req.body.email || user.email;

    // Update password only if both old and new passwords are provided.
    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    await user.save();
    res.json({ 
      message: 'Profile updated successfully', 
      user: { name: user.username, email: user.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
