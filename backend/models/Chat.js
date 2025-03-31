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
  jobId: {          
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job' 
  },
  counterOffer: {    
    type: Number 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
