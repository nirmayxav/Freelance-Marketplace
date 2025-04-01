const express = require('express');
const router = express.Router();
const GetInTouch = require('../models/GetInTouch');

// @desc   Save contact form message
// @route  POST /api/getintouch
// @access Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMessage = await GetInTouch.create({ name, email, message });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
