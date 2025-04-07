const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

// ✅ GET freelancer by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
    
        if (!user) {
          console.log("❌ No user found with ID:", req.params.id);
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(200).json(user);
      } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({ error: 'Server error' });
      }
});

module.exports = router;
