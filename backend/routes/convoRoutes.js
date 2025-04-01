const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const protect = require('../middlewares/authMiddleware');

router.use(protect);

// @desc   Get conversation by ID
// @route  GET /api/conversations/:id
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username email image') // Populate participants data (client/applicant)
      .populate('messages', 'message sender') // Populate messages if needed
      .populate('lastMessage', 'message') // Optional: Populate lastMessage data
      .exec();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all conversations for the logged-in user, ensuring only one conversation per participant pair
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id; // The logged-in user's ID

    // Fetch all conversations where the user is a participant
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: 'participants',
        match: { _id: { $ne: userId } }, // Exclude the current user
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

    // Deduplicate the conversations based on participants and only return the conversation ID once per pair
    const seenParticipants = new Set();
    const uniqueConversations = [];

    conversations.forEach(conv => {
      const participantsIds = conv.participants.map(p => p._id).sort().join('-'); // Unique identifier for participants

      // If the conversation with these participants has not been seen before, add it
      if (!seenParticipants.has(participantsIds)) {
        seenParticipants.add(participantsIds);
        uniqueConversations.push({
          _id: conv._id, // Only send the conversation ID
          participants: conv.participants, // Include participants, if needed
          lastMessage: conv.lastMessage // Optionally include last message details
        });
      }
    });

    res.json({ success: true, data: uniqueConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
// Create or fetch existing conversation between two participants
router.post('/create', async (req, res) => {
  try {
    const { clientId, applicantId } = req.body;

    // Check if a conversation already exists between the two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [clientId, applicantId] }
    });

    if (!conversation) {
      // If no conversation exists, create a new one
      conversation = new Conversation({
        participants: [clientId, applicantId],
        messages: [], // Initial messages
      });
      await conversation.save();
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error("Error creating or fetching conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;