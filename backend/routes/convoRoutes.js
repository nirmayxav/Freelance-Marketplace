const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const protect = require('../middlewares/authMiddleware');

router.use(protect);

// Get all conversations with last message and participants
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: 'participants',
        match: { _id: { $ne: userId } },
        select: 'username image'
      })
      .populate({
        path: 'lastMessage',
        select: 'message sender timestamp jobId',
        populate: {
          path: 'sender',
          select: 'username image'
        }
      })
      .sort({ updatedAt: -1 });
    // Filter out conversations whose other participant was not found
    const filtered = conversations.filter(conv => conv.participants && conv.participants.length > 0);
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    })
    .populate({
      path: 'messages',
      populate: {
        path: 'sender',
        select: 'username image'
      }
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.json({ success: true, data: conversation.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Send new message (via REST)
router.post('/:conversationId/messages', async (req, res) => {
  try {
    const { message } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const newChat = new Chat({
      conversationId: conversation._id,
      sender: req.user._id,
      receiver: conversation.participants.find(
        (p) => p.toString() !== req.user._id.toString()
      ),
      message,
      timestamp: new Date()
    });
    const savedChat = await newChat.save();

    // Update conversation with the new message
    conversation.messages.push(savedChat._id);
    conversation.lastMessage = savedChat._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info for the response
    const populatedMessage = await Chat.findById(savedChat._id).populate({
      path: 'sender',
      select: 'username image'
    });
    res.json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;