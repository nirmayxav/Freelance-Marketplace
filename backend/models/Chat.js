const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isApplication: {  
    type: Boolean, 
    default: false 
  },
  counterOffer: {          
    type: Number 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true } // Added jobId
});

module.exports = mongoose.model('Chat', ChatSchema);
