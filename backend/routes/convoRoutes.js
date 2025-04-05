const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const protect = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes in this file.
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
      .populate('jobId', 'title description') // Populate jobId details if needed
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

// @desc   Get all conversations for the logged-in user
// @route  GET /api/conversations
// @access Private
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
      .populate('jobId', 'title description') // Populate jobId details for each conversation
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
          _id: conv._id,
          participants: conv.participants,
          lastMessage: conv.lastMessage,
          jobId: conv.jobId // Include jobId here
        });
      }
    });

    res.json({ success: true, data: uniqueConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc   Get messages for a specific conversation
// @route  GET /api/conversations/:conversationId/messages
// @access Private
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

// @desc   Send new message (via REST)
// @route  POST /api/conversations/:conversationId/messages
// @access Private
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
      timestamp: new Date(),
      jobId: conversation.jobId // Include jobId when sending the chat message
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

// @desc   Create or fetch existing conversation between two participants
// @route  POST /api/conversations/create
// @access Private
router.post('/create', async (req, res) => {
  try {
    const { clientId, applicantId, jobId } = req.body; // Pass jobId along with the request

    // Check if a conversation already exists between the two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [clientId, applicantId] }
    });

    if (!conversation) {
      // If no conversation exists, create a new one
      conversation = new Conversation({
        participants: [clientId, applicantId],
        messages: [], // Initial messages
        jobId: jobId // Store jobId in the conversation
      });
      await conversation.save();
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error("Error creating or fetching conversation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc   Delete conversations for a specific job, excluding a particular conversation
// @route  DELETE /api/conversations?jobId=...&exclude=...
// @access Private
router.delete('/', protect, async (req, res) => {
  try {
    const { jobId, exclude } = req.query;
    if (!jobId || !exclude) {
      return res.status(400).json({ success: false, message: 'jobId and exclude are required' });
    }

    // Delete conversations with matching jobId except the one to exclude
    const result = await Conversation.deleteMany({
      jobId: jobId,
      _id: { $ne: exclude },
    });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting conversations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
